import json
import tempfile
import threading
import unittest
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from backend import app
from backend.banco_de_dados import conexao


class SistemaTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.original_path = conexao.DB_PATH
        conexao.DB_PATH = Path(self.temp.name) / 'teste.db'
        conexao.inicializar()
        # Os testes de cadastro usam um banco sem os treinos iniciais do Junior.
        with conexao.conectar() as banco:
            banco.execute("DELETE FROM treinos")
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(app.Handler, directory=str(app.FRONTEND)))
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f'http://127.0.0.1:{self.server.server_port}'

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join()
        conexao.DB_PATH = self.original_path
        self.temp.cleanup()

    def request(self, path, method='GET', data=None):
        body = json.dumps(data).encode() if data is not None else None
        request = Request(self.base + path, data=body, method=method, headers={'Content-Type': 'application/json'})
        try:
            response = urlopen(request, timeout=5)
        except HTTPError as error:
            response = error
        with response:
            return response.status, json.loads(response.read())

    def test_fluxo_completo_e_persistencia(self):
        status, perfis = self.request('/api/perfis')
        self.assertEqual(status, 200)
        self.assertEqual([p['nome'] for p in perfis], ['Junior', 'Gabriella'])
        status, treino = self.request('/api/treinos', 'POST', {'perfil_id': 1, 'nome': ' Treino A ', 'descricao': '3 series'})
        self.assertEqual(status, 201)
        self.assertEqual(treino['nome'], 'Treino A')
        self.assertEqual(self.request('/api/treinos?perfil_id=2'), (200, []))
        status, atualizado = self.request(f"/api/treinos/{treino['id']}", 'PATCH', {'perfil_id': 1, 'concluido': True})
        self.assertEqual(status, 200)
        self.assertEqual(atualizado['concluido'], 1)
        conexao.inicializar()
        self.assertEqual(len(self.request('/api/treinos?perfil_id=1')[1]), 1)
        self.assertEqual(len(self.request('/api/perfis')[1]), 2)
        self.assertEqual(self.request(f"/api/treinos/{treino['id']}", 'PATCH', {'perfil_id': 2, 'concluido': False})[0], 404)

    def test_dias_da_semana_em_ambos_perfis(self):
        for perfil_id in (1, 2):
            for dia in range(1, 8):
                status, treino = self.request('/api/treinos', 'POST', {
                    'perfil_id': perfil_id, 'nome': f'Treino dia {dia}', 'dia_semana': dia
                })
                self.assertEqual(status, 201)
                self.assertEqual(treino['dia_semana'], dia)
        conexao.inicializar()
        for perfil_id in (1, 2):
            status, treinos = self.request(f'/api/treinos?perfil_id={perfil_id}')
            self.assertEqual(status, 200)
            self.assertEqual({t['dia_semana'] for t in treinos}, set(range(1, 8)))
            self.assertTrue(all(t['perfil_id'] == perfil_id for t in treinos))
        for dia in (0, 8, True, 'segunda', 1.5):
            status, _ = self.request('/api/treinos', 'POST', {
                'perfil_id': 1, 'nome': 'Treino', 'dia_semana': dia
            })
            self.assertEqual(status, 400)

    def test_validacoes(self):
        for data in [[], {'perfil_id': 9, 'nome': 'A'}, {'perfil_id': True, 'nome': 'A'}, {'perfil_id': 1, 'nome': '   '}, {'perfil_id': 1, 'nome': 'a' * 81}, {'perfil_id': 1, 'nome': 'A', 'descricao': 'b' * 2001}]:
            self.assertEqual(self.request('/api/treinos', 'POST', data)[0], 400)
        self.assertEqual(self.request('/api/treinos?perfil_id=invalido')[0], 400)
        self.assertEqual(self.request('/api/treinos/1', 'PATCH', {'perfil_id': 1, 'concluido': 'sim'})[0], 400)
        self.assertEqual(self.request('/api/desconhecida')[0], 404)

    def test_resultados_historico_e_isolamento(self):
        _, treino = self.request('/api/treinos', 'POST', {'perfil_id': 1, 'nome': 'Peito', 'dia_semana': 1})
        dados = {'perfil_id': 1, 'treino_id': treino['id'], 'data': '2026-10-15',
                 'exercicios': [{'nome': 'Supino', 'feito': True, 'carga': 20},
                                {'nome': 'Crucifixo', 'feito': False, 'carga': None}]}
        status, resultado = self.request('/api/resultados', 'POST', dados)
        self.assertEqual(status, 200)
        self.assertEqual(resultado['nome'], 'Peito')
        self.assertEqual(resultado['exercicios'], dados['exercicios'])
        dados['exercicios'][0]['carga'] = 25
        self.assertEqual(self.request('/api/resultados', 'POST', dados)[0], 200)
        resultados = self.request('/api/resultados?perfil_id=1')[1]
        self.assertEqual(len(resultados), 1)
        self.assertEqual(resultados[0]['exercicios'][0]['carga'], 25)
        dados['data'] = '2026-10-22'
        self.assertEqual(self.request('/api/resultados', 'POST', dados)[0], 200)
        conexao.inicializar()
        self.assertEqual(len(self.request('/api/resultados?perfil_id=1')[1]), 2)
        self.assertEqual(self.request('/api/resultados?perfil_id=2'), (200, []))
        dados['perfil_id'] = 2
        self.assertEqual(self.request('/api/resultados', 'POST', dados)[0], 404)

    def test_validacao_resultados(self):
        _, treino = self.request('/api/treinos', 'POST', {'perfil_id': 1, 'nome': 'A'})
        dados = {'perfil_id': 1, 'treino_id': treino['id'], 'data': '2026-10-15',
                 'exercicios': [{'nome': 'Supino', 'feito': True, 'carga': 0}]}
        for carga in (-1, 10001, True, '20', float('inf'), float('nan')):
            dados['exercicios'][0]['carga'] = carga
            self.assertEqual(self.request('/api/resultados', 'POST', dados)[0], 400)
        dados['exercicios'][0]['carga'] = None
        dados['data'] = '2026-02-30'
        self.assertEqual(self.request('/api/resultados', 'POST', dados)[0], 400)
        dados['data'] = '2026-10-15'
        dados['exercicios'][0]['feito'] = 'sim'
        self.assertEqual(self.request('/api/resultados', 'POST', dados)[0], 400)
        dados['exercicios'] = []
        self.assertEqual(self.request('/api/resultados', 'POST', dados)[0], 400)
        self.assertEqual(self.request('/api/resultados?perfil_id=x')[0], 400)

    def test_frontend_e_arquivos_privados(self):
        for path in ['/', '/html/treinos.html', '/css/style.css', '/js/index.js', '/js/treinos.js', '/js/api.js']:
            with urlopen(self.base + path, timeout=5) as response:
                self.assertEqual(response.status, 200)
                self.assertTrue(response.read())
        for path in ['/backend/app.py', '/banco_de_dados/treino.db', '/css/']:
            with self.assertRaises(HTTPError) as caught:
                urlopen(self.base + path, timeout=5)
            self.assertEqual(caught.exception.code, 404)
            caught.exception.close()


if __name__ == '__main__':
    unittest.main()
