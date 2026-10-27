# Assistente de Fiscalização de Trânsito — PWA inicial

## O que esta versão já faz
- Interface responsiva para celular e desktop.
- Estrutura PWA com manifest e service worker.
- Cache local do shell e dos dados demonstrativos depois da primeira carga online.
- Busca local por texto em títulos, descrições, artigos, códigos e palavras-chave.
- Pesquisa por voz quando o navegador oferece `SpeechRecognition`/`webkitSpeechRecognition`.
- Favoritos e histórico no `localStorage` do aparelho.
- Exportação e importação de backup JSON.
- Links para fontes oficiais do CTB, CONTRAN e SENATRAN.
- Avisos explícitos sobre registros demonstrativos e dados ainda não validados.

## Limitações importantes
Esta é uma **base de protótipo**, não uma base jurídica completa. `data/legal-data.json` contém registros de referência e um exemplo de busca; não contém o CTB integral, todas as resoluções vigentes nem todas as fichas do MBFT. Não use os registros demonstrativos para lavrar autos de infração.

A IA online está intencionalmente desativada. O navegador não deve conter chaves secretas de API. A integração exige um backend/proxy seguro, autenticação, limites de uso, tratamento de erros e recuperação de fontes oficiais. O GitHub Pages é hospedagem estática e não executa esse backend.

O cache offline só fica disponível depois que o app é carregado online pelo menos uma vez. O reconhecimento de voz pode depender de internet e varia por navegador; digitação permanece disponível.

## Publicar no GitHub Pages
1. Crie um repositório novo, por exemplo `assistente-fiscalizacao-transito`.
2. Envie todos os arquivos e pastas deste pacote para a raiz do repositório.
3. No GitHub, abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**, branch `main`, pasta `/ (root)` e salve.
5. Aguarde o endereço `https://SEU-USUARIO.github.io/assistente-fiscalizacao-transito/`.
6. Abra o link online no celular antes de instalar/adicionar à tela inicial.

## Antes de uso operacional
1. Obter e estruturar o CTB e anexos a partir das fontes oficiais.
2. Importar todas as fichas atuais do MBFT e registrar fonte, versão, data de publicação, início de vigência, revogações e alterações.
3. Validar os códigos e campos por conferência automatizada e revisão humana.
4. Criar pipeline de atualização com comparação de versões e histórico de alterações.
5. Testar busca, modo offline e comportamento em iPhone/Android.
6. Implementar backend seguro para IA, que recupere trechos oficiais e retorne citações, sem permitir que o modelo invente códigos.
7. Realizar revisão jurídica e operacional com o órgão responsável antes de uso real.

## Estrutura
- `index.html` — interface
- `styles.css` — estilos responsivos
- `app.js` — busca, voz, favoritos, histórico e backup
- `manifest.webmanifest` — metadados de instalação
- `service-worker.js` — cache offline
- `data/legal-data.json` — registros demonstrativos
- `icons/` — ícones PWA

## Fontes oficiais de partida
- CTB compilado: https://www.planalto.gov.br/ccivil_03/leis/l9503compilado.htm
- Resoluções CONTRAN: https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-Senatran/resolucoes-contran
- Manuais SENATRAN: https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-Senatran/manuais-de-fiscalizacao-sinalizacao-e-polos-geradores-de-trafego
