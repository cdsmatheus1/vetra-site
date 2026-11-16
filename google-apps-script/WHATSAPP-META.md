# Aviso de pedido no WhatsApp pela API oficial da Meta

A cada pedido feito no site, o script do Google manda uma mensagem para o seu WhatsApp (689) 248-7410
pela API oficial do WhatsApp (WhatsApp Cloud API). As mensagens chegam de um número de teste da Meta.

Faça uma vez, logado no seu Facebook, de preferência pelo computador.

## 1. Criar o app na Meta
1. Abra **developers.facebook.com** e, se for a primeira vez, conclua o cadastro de desenvolvedor.
2. Clique em **Meus apps → Criar app**.
3. Dê um nome (ex.: `Vetra Avisos`), informe o email e escolha o caso de uso
   **Conectar-se com clientes pelo WhatsApp** (Connect with customers through WhatsApp).
4. Siga as telas até o app ser criado. Se pedir um portfólio empresarial, crie um com o nome Vetra Services.

## 2. Número de teste e seu número
1. No app, abra **WhatsApp → Configuração da API** (API Setup).
2. Clique em **Gerar token de acesso** (temporário, serve só para o teste inicial).
3. Em **De (From)** fica o número de teste da Meta. Anote o **ID do número de telefone** (Phone number ID).
4. Em **Para (To)**, adicione **+1 689 248 7410**. A Meta manda um código pelo WhatsApp para confirmar.
5. Clique em **Enviar mensagem**. Deve chegar no seu WhatsApp a mensagem de teste "hello_world".
6. **Responda essa mensagem** (qualquer coisa) e salve o contato do número de teste como "Vetra Site".

## 3. Criar o modelo de mensagem
A Meta só deixa a empresa iniciar conversas com modelos aprovados.
1. Abra o **Gerenciador do WhatsApp** (WhatsApp Manager) → **Modelos de mensagem** → **Criar modelo**.
2. Categoria: **Utilidade** (Utility). Nome: `novo_orcamento`. Idioma: **Português (BR)**.
3. No corpo, cole exatamente:

```
Novo pedido de orçamento pelo site da Vetra.

Cliente: {{1}}
Telefone: {{2}}
Serviços: {{3}}
Local: {{4}}
Prazo: {{5}}

Responder no WhatsApp: {{6}}

Os detalhes completos estão no seu email.
```

4. Exemplos para as variáveis (a Meta pede):
   `{{1}}` Maria Souza · `{{2}}` (407) 555-0123 · `{{3}}` CFTV e câmeras de segurança ·
   `{{4}}` Lake Nona · `{{5}}` Em até 2 semanas · `{{6}}` https://wa.me/14075550123
5. Envie para análise. A aprovação costuma sair em minutos.

## 4. Token permanente
O token do passo 2 expira rápido. Para o site, crie um permanente:
1. Abra **business.facebook.com → Configurações do negócio → Usuários do sistema**.
2. Clique em **Adicionar**, crie um usuário do sistema (ex.: `vetra-site`) com função **Administrador**.
3. Clique em **Atribuir ativos**: selecione o app e ative **Gerenciar app (controle total)**;
   selecione a conta do WhatsApp e ative **Gerenciar contas do WhatsApp Business (controle total)**.
4. Clique em **Gerar token**, escolha o app, validade **Nunca** e marque as permissões
   `business_management`, `whatsapp_business_messaging` e `whatsapp_business_management`.
5. Copie o token e guarde em lugar seguro. Não mande o token por chat nem email.

## 5. Colocar no script do Google
No Apps Script: **Configurações do projeto → Propriedades do script → Adicionar propriedade**:

| Propriedade | Valor |
|---|---|
| `WA_TOKEN` | o token permanente do passo 4 |
| `WA_PHONE_NUMBER_ID` | o ID do número de telefone do passo 2 |

Salve, escolha a função `testWhatsapp` no topo e clique em **Executar**. Deve chegar o aviso no seu WhatsApp.
Se der erro, o motivo aparece em **Registro de execução**.

## Observações
- O número de teste da Meta envia só para até 5 números confirmados no passo 2. Para avisos para você, basta.
- A Meta cobra mensagens de modelo conforme o país e a categoria; verifique a página de preços da Meta antes
  de usar um número próprio da empresa no lugar do número de teste.
- Se um dia quiser trocar para um número próprio da Vetra, basta registrar o número no app e trocar o
  `WA_PHONE_NUMBER_ID`.
