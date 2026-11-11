# API de Avaliações

## Rotas

| Método | Rota          | Descrição            | Papéis       |
|--------|---------------|----------------------|--------------|
| POST   | `/avaliacoes` | cadastrar avaliação  | ADMIN        |
| GET    | `/avaliacoes` | listar avaliações    | ADMIN, USER  |

Os papéis são lidos da claim `https://social-insper.com/roles` do access token do Auth0.

## Entidade `Avaliacao`

| Campo            | Tipo          | Observação                                   |
|------------------|---------------|----------------------------------------------|
| `id`             | Integer       | gerado automaticamente                       |
| `emailAvaliador` | String        | obrigatório, e-mail válido                   |
| `emailAvaliado`  | String        | obrigatório, e-mail válido                   |
| `comentarios`    | String        | até 2000 caracteres                          |
| `nota`           | Double        | obrigatória, de 0 a 10                       |
| `dataAvaliacao`  | LocalDateTime | definida pelo servidor no momento do cadastro |

Exemplo de corpo do `POST /avaliacoes`:

```json
{
  "emailAvaliador": "professor@insper.edu.br",
  "emailAvaliado": "aluno@al.insper.edu.br",
  "comentarios": "Ótima apresentação do projeto.",
  "nota": 9.5
}
```

Requisições inválidas (e-mail mal formatado, nota fora de 0–10) retornam `400`.
Sem token retornam `401`; com papel insuficiente, `403`.

A coleção `Avaliacao_API.postman_collection.json` tem exemplos das duas rotas.

# Deploy do BackEnd


## 1. Criar a rede Docker
```
docker network create -d bridge rede
```



## 2. Subir a instância do postgres
```
docker run -d --name postgres-aula -e POSTGRES_DB=auladb -e POSTGRES_USER=usuario -e POSTGRES_PASSWORD=senha --network=rede -p 5432:5432 postgres
```

### 3. Mude os parâmetros do GitHub Action

no arquivo /.github/workflows/deploy.yml existem 3 valores,
mude os nomes de usuário para o seu usuário do DockerHub

```
env:
  DOCKER_IMAGE: ezambomsantana/avaliacao-ci
  CONTAINER_NAME: avaliacao
  DOCKER_USER: ezambomsantana
```


### 4. Crie os secrets

No seu fork do repositório, crie os segredos necessários, são
os mesmo que criamos no começo da disciplina.

```
DOCKERHUB_TOKEN
HOST_TEST
KEY_TEST
```


### 4. Mude as configs do Auth0

No arquivo `application.properties`, estão as configs do Auth0,
mude para apontar para a conta de vocês.