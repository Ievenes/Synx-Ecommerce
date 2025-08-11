# API Backend Lambda

Projeto em Node.js que oferece uma API REST para cadastro de **usuários**, **produtos** e **endereços**. A aplicação utiliza Express, PostgreSQL e autenticação via JWT. A documentação interativa encontra-se em `/api-docs` (Swagger UI).

## Pré‑requisitos

* Node.js 14 ou superior
* Banco de dados PostgreSQL acessível

## Instalação

1. Clone este repositório e acesse a pasta do projeto.
2. Instale as dependências com `npm install`.
3. Crie um arquivo `.env` preenchendo as variáveis abaixo:

```
DATABASE_URL=postgres://usuario:senha@host:porta/banco
JWT_SECRET=chave-secreta
JWT_EXPIRATION=1h
PORT=3000 # opcional
```

## Executando o servidor

Após configurar o `.env`, inicie a API com o comando:

```
node index.js
```

A rota raiz `/` irá responder com uma mensagem de sucesso indicando que o servidor está ativo.

Para executar a suíte de testes:

```
npm test
```

## Autenticação

Algumas rotas exigem token JWT. Após realizar login, envie nos headers:

```
Authorization: Bearer <token>
```

## Principais Endpoints

### Usuários

- `POST /usuarios/login` – autentica um usuário.
  - **Body**: `{ email, senha }`
  - **Resposta**: `{ token, usuario: { ... } }`
- `GET /usuarios` – lista os usuários cadastrados.
- `POST /usuarios` – cria um novo usuário.
  - **Body**: `{ nome_completo, email, senha, nivel_acesso?, telefone?, cpf?, data_nascimento?, genero?, foto_perfil? }`
- `PUT /usuarios/:id` – atualiza um usuário *(requer autenticação)*.
- `DELETE /usuarios/:id` – remove um usuário *(requer autenticação)*.
- `PUT /usuarios/:id/nivel` – altera o nível de acesso *(requer autenticação)*.

### Endereços

- `GET /enderecos` – lista todos os endereços.
- `GET /enderecos/:id` – busca um endereço pelo ID.
- `GET /enderecos/usuario/:id_usuario` – endereços de um usuário.
- `POST /enderecos` – cadastra um endereço.
  - **Body**: `{ id_usuario, rua, numero, complemento?, bairro, cidade, estado, cep }`
- `PUT /enderecos/:id` – atualiza um endereço *(requer autenticação)*.
- `DELETE /enderecos/:id` – exclui um endereço *(requer autenticação)*.

### Produtos

- `GET /produtos` – lista todos os produtos.
- `POST /produtos` – cria um produto.
  - **Body**: `{ codigo, nome, preco, categoria?, descricao?, imagem? }`
- `PUT /produtos/:id` – atualiza um produto *(requer autenticação)*.
- `DELETE /produtos/:id` – remove um produto *(requer autenticação)*.

---

Todas as respostas são em JSON. Mensagens de erro trazem o campo `erro` e o respectivo código HTTP.

### Estrutura do Projeto

* `routes/` – define as rotas da API.
* `controllers/` – lógica de cada recurso.
* `middleware/` – autenticação JWT e validações.
* `validators/` – regras simples de validação dos campos.
* `tests/` – testes automatizados com Jest e Supertest.

