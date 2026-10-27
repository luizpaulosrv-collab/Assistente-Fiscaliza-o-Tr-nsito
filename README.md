# Assistente de Fiscalização de Trânsito — versão inicial funcional

PWA estático, sem dependências externas. Interface responsiva, pesquisa textual local, resultados por relevância, fichas detalhadas, favoritos, histórico, exportação de backup, tentativa de reconhecimento de voz e cache offline.

## Atenção jurídica
Esta entrega é uma base funcional de aplicativo, **não uma base jurídica integral nem certificada para autuação**. O arquivo `data/legal-data.json` contém somente fichas demonstrativas. Códigos e desdobramentos estão explicitamente marcados para conferência. Não use os exemplos como confirmação autônoma de enquadramento. Antes de uso operacional, é necessário importar e conferir todas as fichas do MBFT vigente, resoluções que as alterem, tabela oficial de códigos, texto compilado do CTB e normas municipais aplicáveis.

Fontes de referência:
- CTB: https://planalto.gov.br/ccivil_03/leis/l9503compilado.htm
- Resoluções CONTRAN: https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-Senatran/resolucoes-contran
- Portal do Município de Eusébio: https://www.eusebio.ce.gov.br/

## Publicar no GitHub Pages
1. Descompacte o ZIP.
2. Envie **o conteúdo da pasta** para a raiz do repositório, preservando as pastas `data/` e `icons/`.
3. Confirme estes caminhos: `data/legal-data.json`, `icons/icon-192.png` e `icons/icon-512.png`.
4. Em Settings → Pages, escolha Deploy from a branch, branch `main`, pasta `/(root)` e salve.
5. Aguarde o workflow Pages terminar. Depois abra o endereço indicado em Settings → Pages.

## Instalação e offline
Abra a URL HTTPS no navegador do celular e use a opção do navegador para adicionar à tela inicial. Abra uma vez com internet para armazenar os arquivos no cache. O conteúdo jurídico disponível offline é apenas o que estiver incluído em `data/legal-data.json`.

## Privacidade e IA
Consultas e favoritos ficam no armazenamento local do navegador. Esta versão não envia relatos para uma IA online. Para adicionar IA, crie um backend protegido; não publique chaves de API em `app.js` ou em repositório público.

## Atualização jurídica
`lastReviewed` é a data de preparação da base inicial, não uma certificação de que todas as normas foram verificadas. Atualize e versiona a base somente após conferência das fontes oficiais e das datas de vigência.
