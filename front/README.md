# Front-end de Avaliações (React + Vite)

Aplicação React que **lista** e **cadastra** avaliações, autenticada com o **Auth0**.

- Todos os usuários autenticados com papel `ADMIN` ou `USER` veem a lista de avaliações.
- Apenas usuários com papel `ADMIN` veem o formulário de cadastro.
- O access token do Auth0 é enviado no header `Authorization: Bearer <token>` para a API.
- Os papéis são lidos da claim `https://social-insper.com/roles` do token.

Para executar a aplicação, instale as dependências:

```
npm install
```

Depois execute (o back-end deve estar rodando em `http://localhost:8080`; o Vite faz proxy de `/api`):

```
npm run dev
```

A configuração do Auth0 está em `src/main.jsx`. Em produção (Vercel), o redirecionamento de `/api/avaliacoes` para o back-end está em `vercel.json`.
