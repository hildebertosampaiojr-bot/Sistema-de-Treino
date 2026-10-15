"""Execute da raiz do projeto: python -m backend.app"""
import argparse
import json
import logging
import re
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

from backend.banco_de_dados.conexao import inicializar
from backend.controlles import api

FRONTEND = Path(__file__).resolve().parents[1] / "frontend"


class Handler(SimpleHTTPRequestHandler):
    def responder(self, status, dados):
        conteudo = json.dumps(dados, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(conteudo)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(conteudo)

    def ler_json(self):
        tamanho = int(self.headers.get("Content-Length", "0"))
        if tamanho < 1 or tamanho > 16384:
            raise ValueError("O corpo da requisição está vazio ou é muito grande.")
        try:
            dados = json.loads(self.rfile.read(tamanho))
        except (ValueError, UnicodeDecodeError):
            raise ValueError("Envie um JSON válido.") from None
        if not isinstance(dados, dict):
            raise ValueError("Envie um objeto JSON.")
        return dados

    def tratar_api(self):
        url = urlsplit(self.path)
        try:
            if self.command == "GET" and url.path == "/api/perfis":
                return self.responder(200, api.perfis())
            if self.command == "GET" and url.path == "/api/resultados":
                valor = parse_qs(url.query).get("perfil_id", [""])[0]
                if not valor.isdecimal():
                    raise ValueError("Selecione um perfil válido.")
                return self.responder(200, api.listar_resultados(int(valor)))
            if self.command == "POST" and url.path == "/api/resultados":
                resultado = api.salvar_resultado(self.ler_json())
                return self.responder(200, resultado) if resultado else self.responder(404, {"erro": "Treino não encontrado."})
            if self.command == "GET" and url.path == "/api/treinos":
                valor = parse_qs(url.query).get("perfil_id", [""])[0]
                if not valor.isdecimal():
                    raise ValueError("Selecione um perfil válido.")
                return self.responder(200, api.listar_treinos(int(valor)))
            if self.command == "POST" and url.path == "/api/treinos":
                return self.responder(201, api.criar_treino(self.ler_json()))
            rota = re.fullmatch(r"/api/treinos/(\d+)", url.path)
            if self.command == "PATCH" and rota:
                resultado = api.concluir_treino(int(rota[1]), self.ler_json())
                return self.responder(200, resultado) if resultado else self.responder(404, {"erro": "Treino não encontrado."})
            self.responder(404, {"erro": "Rota não encontrada."})
        except ValueError as erro:
            self.responder(400, {"erro": str(erro)})
        except Exception:
            logging.exception("Falha ao processar requisição")
            self.responder(500, {"erro": "Não foi possível processar a solicitação."})

    def do_GET(self):
        if urlsplit(self.path).path.startswith("/api/"):
            self.tratar_api()
        else:
            super().do_GET()

    def do_POST(self):
        self.tratar_api()

    def do_PATCH(self):
        self.tratar_api()

    def list_directory(self, path):
        self.send_error(404)


def main():
    parser = argparse.ArgumentParser(description="AOLDEYA FITNESS")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    inicializar()
    servidor = ThreadingHTTPServer(("127.0.0.1", args.port), partial(Handler, directory=str(FRONTEND)))
    print(f"AOLDEYA FITNESS disponível em http://localhost:{args.port}", flush=True)
    try:
        servidor.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        servidor.server_close()


if __name__ == "__main__":
    main()
