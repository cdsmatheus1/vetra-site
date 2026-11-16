# Vetra Services website

Site da Vetra Services, publicado em https://www.vetraservices.tech

Site estático (HTML/CSS/JS puro, sem dependências) para a Vetra Services, Orlando FL.

| Arquivo | O que é |
|---|---|
| `index.html` | Site principal (one-page) |
| `quote.html` | Página de captura de leads (formulário em 4 etapas) |
| `assets/styles.css` | Estilos (cores da marca em `:root`) |
| `assets/main.js` | Menu, animações e envio do formulário |
| `assets/i18n.js` | Traduções PT e ES (o inglês está no HTML). Para mudar um texto traduzido, edite aqui |
| `assets/img/hero.jpg` | **Coloque aqui uma foto real** — ela substitui a ilustração do topo automaticamente |
| `src/*.src.html` + `build.py` | Fonte das páginas; edite aqui e rode `python3 build.py` |
| `ANALISE.md` | Engenharia reversa de mrelectric.com e jcpower.pro |

## Leads
O formulário envia para **vetraservices25@gmail.com** via [FormSubmit](https://formsubmit.co) (grátis, sem servidor).
No **primeiro envio** chega um e-mail "Activate Form" — clique uma vez e pronto. Se o envio falhar,
o visitante vê botões de WhatsApp / e-mail / ligação já preenchidos com os dados, então nenhum lead se perde.

Links diretos para o formulário já com serviço/cliente marcado (bons para anúncios e Instagram):
`quote.html?type=builder`, `quote.html?type=homeowner`, `quote.html?service=cctv`, `?service=automation`, `?service=handyman`…

## Email bonito e WhatsApp (Google Apps Script)
O script `google-apps-script/Code.gs` roda grátis na conta Google **vetraservices25@gmail.com**. A cada pedido ele:
1. manda para você um email com a identidade visual da Vetra e botões "Responder no WhatsApp", "Ligar" e "Responder por email";
2. manda um WhatsApp para (689) 248-7410 com o resumo do pedido (API oficial da Meta);
3. manda ao cliente um email de confirmação no idioma dele;
4. guarda o pedido na planilha "Vetra Leads" no seu Google Drive.

**Instalar (uma vez):**
1. Entre em script.google.com logado como vetraservices25@gmail.com e clique em **Novo projeto**.
2. Apague o código de exemplo, cole todo o conteúdo de `google-apps-script/Code.gs` e salve.
3. WhatsApp: siga `google-apps-script/WHATSAPP-META.md` (API oficial do WhatsApp) e coloque `WA_TOKEN` e
   `WA_PHONE_NUMBER_ID` em **Configurações do projeto → Propriedades do script**.
4. Teste: selecione a função `testLead` no topo e clique em **Executar**. Autorize o acesso quando o Google pedir.
   Devem chegar o email de teste, o WhatsApp e a planilha.
5. Publique: **Implantar → Nova implantação → tipo App da Web**. Executar como: **Eu**. Quem pode acessar: **Qualquer pessoa**.
   Copie a URL que termina em `/exec`.
6. Cole essa URL em `assets/main.js`, no campo `appsScriptUrl: ''`, e publique o site.

Sem a URL configurada, o site continua mandando os pedidos pelo FormSubmit (email simples).

## Idiomas
Inglês é o padrão. O visitante troca no seletor EN | PT | ES do cabeçalho (fica salvo no navegador).
Link direto num idioma: `index.html?lang=pt`, `quote.html?lang=es`. Os pedidos chegam com os valores em inglês
e com o campo `language` mostrando em que idioma o cliente preencheu.

## Publicar em www.vetraservices.tech (Netlify, grátis)
Arquivos que vão para o ar: `index.html`, `quote.html`, `robots.txt`, `sitemap.xml` e a pasta `assets/`
(as pastas `src/`, `build.py`, `README.md` e `ANALISE.md` não precisam subir).

1. Crie uma conta em netlify.com e escolha "Deploy manually". Arraste a pasta (ou o zip) com esses arquivos.
2. No site criado: **Domain management → Add a domain** → `www.vetraservices.tech`.
3. No painel onde você comprou o domínio, em DNS, crie:
   - `CNAME` com nome `www` apontando para `SEU-SITE.netlify.app` (o endereço que o Netlify mostrar);
   - `A` com nome `@` (domínio sem www) apontando para o IP que o Netlify indicar no passo 2.
4. Espere o DNS propagar (de minutos a algumas horas). O Netlify ativa o HTTPS sozinho.
5. Faça um pedido de teste no site e ative o FormSubmit no email `vetraservices25@gmail.com`.

Para atualizar o site depois: arraste a pasta nova em **Deploys** no Netlify.

## Antes de publicar, confirme
- Número da licença de eletricista (FL EC/ER) — o site diz "Licensed & Insured"; ideal exibir o número no rodapé.
- Horário de atendimento (está Mon–Sat 7am–7pm).
- Se o (689) 248-7410 tem WhatsApp (os botões usam wa.me/16892487410).
