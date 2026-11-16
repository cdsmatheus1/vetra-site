# Engenharia reversa: mrelectric.com e jcpower.pro

Coleta feita em 16/11/2026 com navegador automatizado (Chromium), em desktop (1366px) e celular (390px).
Foram levantados: estrutura de títulos, CTAs, formulários, links de telefone, dados estruturados (schema),
requisições de rede e tecnologias de terceiros.

## 1. Mr. Electric — mrelectric.com
Franquia nacional (grupo Neighborly). Site corporativo que direciona para a unidade local.

**Dados observados**
- Título: *"Commercial & Residential Electrical Services | Mr. Electric"*; H1: *"Our Residential & Commercial Electrical Services"*.
- Página de ~12.300px de altura, 93 imagens (todas com `alt`), 49 scripts, **134 requisições** e **28 domínios de terceiros**
  (Google Ads/Analytics, Facebook, LinkedIn, AdRoll, Simpli.fi, The Trade Desk, Microsoft Clarity, Datadog, Convert A/B testing, HERE Maps, Google Maps…).
- Formulários: busca por CEP ("Find my local Mr. Electric") e um agendamento online com nome, e-mail, telefone, endereço e CEP.
- Telefone `tel:8448661367` repetido no topo, no menu e numa **barra fixa no celular: "Call Now: (844) 866-1367"**.
- Schema: Organization, WebSite, BreadcrumbList, **FAQPage**, ItemList (ofertas).
- Menu gigante com cerca de 40 serviços (tomadas USB, AFCI, painéis, surge protectors…).

**Pontos positivos**
1. Telefone sempre visível, com barra fixa "Call Now" no celular. É o melhor padrão de conversão do mercado.
2. Duas portas de entrada claras: "Easy Online Booking" e "Click to Call".
3. SEO forte: FAQ com schema (aparece no Google como perguntas), blog e uma página para cada serviço.
4. Sinais de confiança: garantia "Done Right Promise", financiamento, ofertas especiais e avaliações.
5. Separação Residencial × Comercial já no hero.
6. Acessibilidade bem feita: todas as imagens com `alt`.
7. Arquitetura de serviços muito detalhada, ótima para captar buscas de cauda longa.

**Pontos negativos**
1. **Pesado**: 134 requisições e 28 rastreadores. Fica lento no 4G e prejudica o Core Web Vitals.
2. Cara de franquia genérica, sem personalidade local, sem fotos reais da equipe e sem "premium".
3. Obriga a "escolher a unidade/CEP" antes de agendar, uma etapa extra que faz perder leads.
4. Na captura feita aqui o selo de avaliação mostrava **"0/5"**. Pode ter sido o widget de terceiros que não carregou,
   mas mostra o risco de depender dele: quando falha, a prova social vira prova negativa.
5. Página longa demais (12 mil px) e texto corrido no hero do celular, com a dobra ocupada por um parágrafo.
6. Telefone 0800 nacional (844), que passa menos confiança local que um DDD de Orlando.
7. Nenhuma mensagem para construtoras, investidores ou house flipping.

## 2. JC Power — jcpower.pro
Empresa local de Orlando (elétrica + HVAC + cursos), trilíngue (EN/ES/PT).

**Dados observados**
- Título: *"JC Power | Serviços Elétricos e HVAC em Orlando, FL"*; H1: *"Energia para Casas e Empresas de Orlando"*.
- Site leve: **12 requisições**, 8 scripts, 9 imagens, carregou em ~1,7s. Nenhum rastreador de anúncios instalado.
- Seções: Por que escolher → Serviços → Cursos → Trabalhos → Sobre → Avaliações → Orçamento.
- Formulário de orçamento simples (nome, e-mail, telefone, interesse, mensagem) e formulário para deixar avaliação com foto.
- Schema `Electrician` (bom). Botões flutuantes de Messenger, ligação e WhatsApp.
- **Bug: o link de telefone é `tel:+140750814574074853987`**, dois números colados num só. Quem toca para ligar não consegue completar a chamada.

**Pontos positivos**
1. Rápido e leve.
2. Trilíngue (EN/ES/PT), excelente para o público latino e brasileiro de Orlando.
3. Visual moderno (hero escuro em gradiente, cards com bordas arredondadas, números "10+ / 500+ / 24/7").
4. WhatsApp e Messenger flutuantes.
5. Schema local `Electrician` e foco geográfico claro ("Orlando").
6. Formulário curto, com pouca fricção.

**Pontos negativos**
1. **Telefone quebrado** (link `tel:` inválido). É a pior falha possível para um prestador de serviço.
2. Na captura, os ícones dos cards apareceram como **caixas vazias** (dependem de uma biblioteca externa via unpkg). No celular o cabeçalho mostra botões vazios e não há menu visível.
3. No celular, os botões flutuantes cobrem o conteúdo e não existe uma barra fixa de ligação.
4. Mistura de idiomas na versão PT ("Residential Electrical", "Eletrica Comercial" sem acento).
5. Mensagem dispersa: elétrica + HVAC + **cursos para alunos** no mesmo site. O cliente classe A não quer ver "matrícula".
6. Pouca prova social real (portfólio e avaliações enxutos) e números genéricos sem comprovação.
7. Nenhuma oferta para construtoras ou house flipping, e nada sobre CFTV ou automação.

## 3. O que levei para o site da Vetra
| Ideia | Origem | Como aparece no site da Vetra |
|---|---|---|
| Telefone sempre à mão | Mr. Electric | Topbar + header + botões flutuantes (desktop) + **barra fixa Call / WhatsApp / Estimate no celular** |
| Leveza | JC Power | Zero frameworks, zero rastreadores, ícones embutidos (não quebram) |
| FAQ com intenção de busca | Mr. Electric | FAQ com as dúvidas reais (inclui "não fazemos HVAC") |
| Schema local | Ambos | `Electrician` com área atendida, horário e serviços |
| WhatsApp | JC Power | WhatsApp com mensagem pré-preenchida, e o formulário repassa os dados do lead |
| **Foco único e premium** | Corrige ambos | Sem cursos e sem HVAC; posicionamento "luxury homes + builders + flippers" |
| **Seção para construtoras** | Lacuna de ambos | Rough-in → final em 5 etapas, bids itemizados, preço por volume |
| **CFTV + automação** | Lacuna de ambos | Seção própria com mockup de app |
| Funil de leads | Melhora ambos | Página `quote.html` em 4 etapas, com qualificação (tipo de cliente, serviço, prazo, orçamento) |
