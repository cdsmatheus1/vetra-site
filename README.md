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

## Aviso de novo pedido no WhatsApp
Cada pedido feito no formulário chega no email **e** pode chegar como mensagem no seu WhatsApp
(689) 248-7410, com todos os dados em português e um link "Responder no WhatsApp" que abre a conversa com o cliente.
O envio usa o CallMeBot, um serviço gratuito. Para ativar (uma vez só):
1. Acesse callmebot.com, abra a página **WhatsApp API** e siga as instruções de ativação
   (adicionar o número deles nos contatos e mandar a mensagem de autorização pelo WhatsApp).
2. Você recebe uma **apikey** no WhatsApp.
3. Abra `assets/main.js`, procure `apikey: ''` e cole a chave entre as aspas. Exemplo: `apikey: '123456'`.
4. Publique o site de novo e faça um pedido de teste.

Enquanto a chave estiver vazia, o site não manda o aviso no WhatsApp (os pedidos continuam chegando por email).
A chave fica visível no código do site; ela só serve para mandar mensagens para o seu próprio número.

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
