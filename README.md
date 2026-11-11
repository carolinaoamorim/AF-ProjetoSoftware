# AF – Projeto de Software 2026.2

Por Carolina Oliveira Amorim

- **back/**: Spring Boot + Postgres + Auth0 (resource server). Deploy na EC2 via GitHub Actions.
- **front/**: React + Vite + Auth0. Deploy na Vercel (Root Directory = `front`).

| O quê | Valor |
|---|---|
| EC2 | `98.92.208.21` (IP interno `172.31.11.1`) |
| API no ar | `http://98.92.208.21:8080/avaliacoes` |
| Front | `https://af-projeto-software.vercel.app` |
| Auth0 domain | `dev-a3l68wtd82inod7x.us.auth0.com` |
| Auth0 audience (API) | `https://af-api` |
| Claim das roles | `https://social-insper.com/roles` |
| Banco | `postgres-aula` na EC2 (porta 5432, `auladb`, `usuario`/`senha`) |

**Para os "a mais" da prova (PUT/DELETE/GET por id com 404, filtro, validação, regra de negócio, média): veja o [COMO_MEXER.md](COMO_MEXER.md).**

| Rota | Quem pode |
|---|---|
| `GET /avaliacoes` (`?emailAvaliado=x&notaMin=7`), `/avaliacoes/{id}`, `/avaliacoes/media?email=x` | ADMIN e USER |
| `POST /avaliacoes`, `PUT /avaliacoes/{id}`, `DELETE /avaliacoes/{id}` | ADMIN |

Antes de entregar, apague as rotas que o enunciado não pede (controller + `WebSecurityConfig`).

---

## Checklist da prova (o que trocar)

### 1. Back – entidade nova
Em `back/src/main/java/br/edu/insper/avaliacao/avaliacao/`:
- [ ] **Entity** (`Avaliacao.java`): trocar os campos pelos do enunciado (validações `@NotBlank`, `@Email`, `@DecimalMin/@DecimalMax`).
- [ ] **Repository**: trocar o nome da entidade.
- [ ] **Service**: regras do enunciado (ex.: data definida pelo servidor, "não pode avaliar a si mesmo").
- [ ] **Controller**: `@RequestMapping("/NOVA_ROTA")`, `@Valid` no `@RequestBody`.
- [ ] Se trocar o nome do pacote/classes, renomear pelo IntelliJ (Refactor → Rename) para não quebrar imports.

### 2. Back – permissões
Em `back/src/main/java/br/edu/insper/avaliacao/config/WebSecurityConfig.java`:
- [ ] Trocar `/avaliacoes` pela rota nova.
- [ ] Ajustar quem pode o quê: `hasRole("ADMIN")` / `hasAnyRole("ADMIN", "USER")`.
- [ ] Rotas novas (ex.: `DELETE /x/{id}`) → `requestMatchers(HttpMethod.DELETE, "/x/**")`. O GET precisa de `"/x", "/x/**"` para cobrir `/x/{id}` e `/x/media`. Tabela de receitas no comentário do próprio arquivo.

### 3. Deploy do back
Em `.github/workflows/deploy.yml` (na RAIZ do repo):
- [ ] `DOCKER_IMAGE` (tudo minúsculo) e `CONTAINER_NAME`.
- [ ] `HOST_PORT` livre na EC2 (conferir com `docker ps -a`).
- [ ] Secrets no GitHub (Settings → Secrets and variables → Actions):
  `DOCKERHUB_TOKEN`, `HOST_TEST` (`98.92.208.21`), `KEY_TEST` (conteúdo do `.pem`), `DB_HOST` (`172.31.11.1`).
- [ ] Push na `main` → aba **Actions** verde → `curl -i http://98.92.208.21:8080/ROTA` deve dar **401**.

### 4. Front
- [ ] `front/src/config.js`: `API` com a rota nova (e Auth0, se mudar de tenant).
- [ ] `front/src/Avaliacoes.jsx`: `[1] VAZIO`, inputs do form `[4.1]`, `<th>/<td>` da tabela `[4.3]` (passo a passo no [front/README.md](front/README.md)).
- [ ] `front/vercel.json`: trocar `/api/avaliacoes` e o destino pela rota nova (e porta, se mudou). As duas regras (com e sem `/:path*`) são necessárias.
- [ ] Testar local: `cd front && npm install && npm run dev` → `http://localhost:5173`.

### 5. Auth0 (só se criar conta/tenant novo)
- [ ] API com identifier = audience.
- [ ] Application SPA com Callback / Logout / Web Origins = `http://localhost:5173` e a URL da Vercel (sem `/` no final).
- [ ] Roles `ADMIN` e `USER`, atribuídas aos usuários.
- [ ] Action post-login com as roles no claim `https://social-insper.com/roles`, **deployada e no fluxo** (Actions → Triggers → post-login → Apply).
- [ ] Trocar `issuer-uri` (com `/` no final) e `audience` em `application.properties`, e domain/clientId/audience em `front/src/config.js`.

### Mudanças no Auth0 durante a prova

| Se acontecer | O que fazer no Auth0 |
|---|---|
| A prova pede uma role nova (ex.: `GERENTE`) | User Management → Roles → criar a role e atribuir a um usuário. Depois, **Log Out e Log In** no front |

---

## Comandos úteis

```bash
ssh -i projsoft26b.pem ubuntu@98.92.208.21
docker ps -a                  # containers e portas
docker logs avaliacao         # erro real da aplicação
docker image prune -a         # liberar disco (imagens sem uso)
```

## Se der erro

| Erro | Causa / solução |
|---|---|
| Workflow não roda | `deploy.yml` precisa estar em `.github/workflows/` **na raiz** |
| `repository name must be lowercase` | `DOCKER_IMAGE` todo minúsculo |
| `port is already allocated` | `docker ps -a`, parar/remover o container da porta ou trocar `HOST_PORT` |
| `Service not found: https://...` no login | API com esse identifier não existe no Auth0 |
| `Callback URL mismatch` | URL do front faltando nas *Allowed Callback URLs* (sem `/` no final) |
| 401 logada | `issuer-uri` / `audience` do back diferentes do token |
| 400 sem dizer o motivo | faltam `server.error.include-*` no `application.properties` |
| 403 logada | token sem roles: atribuir role ao usuário, conferir Action no fluxo, **Log Out e Log In** |
| Front: `ERR_CONNECTION_REFUSED` em localhost | `npm run dev` não está rodando |