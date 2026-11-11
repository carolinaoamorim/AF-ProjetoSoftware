# Deploy  do BackEnd


## 1. Criar a rede Docker
```
docker network create -d bridge rede
```



## 2. Subir a instância do postgres
```
docker run -d --name postgres-aula -e POSTGRES_DB=auladb -e POSTGRES_USER=usuario -e POSTGRES_PASSWORD=senha --network=rede -p 5432:5432 postgres
```

## 2.1 Subir Redis (opcional)
Para usar cache com Redis em vez de HashMap, execute:
```
docker run -d --name redis-aula --network=rede -p 6379:6379 redis:latest
```

Variáveis de ambiente para configurar Redis:
```
REDIS_HOST=localhost  # ou o IP do container Redis
REDIS_PORT=6379       # porta padrão do Redis
```



### 3. Mude os parâmetros do GitHub Action

no arquivo /.github/workflows/deploy.yml existem 3 valores,
mude os nomes de usuário para o seu usuário do DockerHub

```
env:
  DOCKER_IMAGE: ezambomsantana/partida-ci
  CONTAINER_NAME: partida
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