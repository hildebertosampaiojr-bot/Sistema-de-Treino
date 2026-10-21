# AOLDEYA FITNESS

Aplicação com frontend em HTML, CSS e JavaScript e backend em Python com SQLite. A página inicial oferece dois cards de acesso: **Junior** e **Gabriella**. Cada perfil pode consultar seu plano, marcar exercícios, registrar cargas e fechar treinos com histórico de resultados.

## Executar

Requer Python 3.10 ou superior. Não é necessário instalar pacotes.

Na raiz do projeto:

```powershell
python -m backend.app
```

Abra **http://localhost:8000**. Para encerrar, pressione `Ctrl+C`. Para outra porta, execute `python -m backend.app --port 8001`.

Use o servidor para acessar as páginas: abrir o HTML diretamente pelo explorador não conecta a API. As fontes do Google são opcionais; sem internet, a interface utiliza fontes do sistema.

## Estrutura

```text
frontend/
  index.html             # Tela de acesso com os dois cards
  html/treinos.html       # Treinos do perfil selecionado
  css/style.css          # Estilos responsivos
  js/                    # Integração com a API e interações
backend/
  app.py                 # Servidor HTTP e rotas
  banco_de_dados/        # Conexão SQLite e banco gerado automaticamente
  regras/                # Validação e regras de negócio
  migrations/            # Scripts SQL versionados
  controlles/            # Controladores (nome conforme estrutura solicitada)
  models/                # Consultas e persistência
```

O banco `backend/banco_de_dados/treino.db` é criado na primeira execução. As migrations são aplicadas automaticamente, uma vez por arquivo. Os dados são persistidos entre reinicializações e o banco fica fora do Git. Para usar outro banco, configure `TREINO_DB_PATH`.

## API

| Método | Rota | Função |
| --- | --- | --- |
| GET | `/api/perfis` | Lista Junior e Gabriella |
| GET | `/api/treinos?perfil_id=1` | Lista os treinos de um perfil |
| POST | `/api/treinos` | Cadastra treino com `perfil_id`, `nome`, `descricao` |
| PATCH | `/api/treinos/1` | Atualiza com `perfil_id` e `concluido` (booleano) |

Esta primeira versão usa seleção de perfil, sem senha ou autenticação. Os perfis organizam os dados, mas não oferecem isolamento de segurança: quem acessa a API pode selecionar qualquer um deles. O servidor é de uso local e escuta apenas em `127.0.0.1`.

## Verificar

```powershell
python -m unittest discover -s tests -v
```

## Dias da semana

Os dois perfis exibem segunda-feira a domingo e a aba Resumo. O Junior tem o plano de sete dias fornecido pelo usuario; Gabriella tem o plano de cinco dias fornecido pelo usuario, com 27 exercicios. O cadastro de planos continua disponivel pela API. Os exercicios do plano inicial tambem estao em `frontend/dados/planos.json` para uso pelo Live Server.

## Ficha interativa e evolucao

Selecione um dia, marque os circulos dos exercicios feitos e preencha a carga em kg. O botao **Fechar treino do dia** salva uma sessao, inclusive parcial. Fechar novamente o mesmo treino na mesma data atualiza o registro sem duplicar. Uma nova data cria outro registro. A carga e por exercicio, sem detalhamento por serie; deixar em branco significa carga nao informada.

A aba **Resumo** mostra treinos fechados, exercicios feitos, percentual de conclusao, dias ativos, frequencia dos ultimos sete dias, comparacao entre a primeira e a ultima carga e historico. Apenas sessoes fechadas entram no dashboard; somente cargas de exercicios feitos entram na evolucao.

Pelo servidor Python, os resultados ficam no SQLite. Pelo Live Server, os resultados ficam neste navegador e origem/endereco, separados por perfil. A interface indica onde esta salvando. O historico local nao e sincronizado automaticamente com o banco. Limpar os dados do navegador remove os registros locais.

Rascunhos sao guardados neste navegador por perfil, data e modo de acesso. As cargas do ultimo registro sao sugeridas na proxima sessao; as marcacoes de feito comecam desmarcadas. A data usada e a data local do navegador quando a ficha e aberta. Reinicie o servidor Python para aplicar a migration de resultados.

API: GET `/api/resultados?perfil_id=1` lista o historico. POST `/api/resultados` recebe `perfil_id`, `treino_id`, `data` (AAAA-MM-DD) e `exercicios` com `nome`, `feito` (booleano) e `carga` (numero em kg ou null). O campo legado `treinos.concluido` nao controla o historico por data.

Validacao do fluxo frontend com Node.js: `node tests/frontend_interacao.mjs`. O teste simula o DOM; nao substitui verificacao visual.

## Menu de perfil e aparencia

Clique no avatar circular no topo da pagina de treinos para editar nome e foto, escolher tema claro/escuro, selecionar uma das cinco paletas ou trocar de perfil. Cada paleta aplica o tema sugerido; o tema pode ser alterado depois. A foto pode ser JPG, PNG ou WebP de ate 5 MB e e ajustada para um avatar quadrado de 256 pixels com recorte central. Nome, foto e preferencias de aparencia ficam neste navegador, separados por perfil, e nao alteram o plano nem o historico. O nome e a foto tambem aparecem nos cards da tela inicial. Cancelar a edicao nao altera o perfil.
