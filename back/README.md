# API de Cadastro de Times de Futebol

## Funcionalidades

- Cadastro de times com informações de stadio e cidade
- Rastreamento de estatísticas: pontos, gols feitos e gols levados
- Processamento automático de partidas via fila Redis
- Atualização automática de estatísticas dos times

## Como Executar

1. Crie a rede Docker (se não foi criada ainda)

```
docker network create -d bridge rede
```

2. Certifique-se de que MongoDB está rodando em sua máquina

```
docker run -p 27017:27017 --network=rede --name mongo mongo
```

2. Instale as dependências:

```bash
pip install -r requirements.txt
```

3. Mude os parâmetros do GitHub Action

no arquivo /.github/workflows/deploy.yml existem 3 valores,
mude os nomes de usuário para o seu usuário do DockerHub

```
env:
  DOCKER_IMAGE: ezambomsantana/time-ci
  CONTAINER_NAME: time
  DOCKER_USER: ezambomsantana
```

## Funcionalidades de Estatísticas

### Campos de Estatísticas dos Times

Cada time agora possui:
- `pontos`: Total de pontos acumulados
- `gols_feitos`: Total de gols marcados
- `gols_levados`: Total de gols sofridos

### Processamento de Partidas via Redis

O sistema processa partidas através de uma fila Redis chamada `partidas`.

#### Formato dos Dados

As partidas devem ser enviadas como JSON para a fila Redis no seguinte formato:

```json
{
  "time_id": "id_do_time_mongodb",
  "pontos": 3,
  "gols_feitos": 2,
  "gols_levados": 1
}
```

#### Executar o Worker

Para iniciar o consumidor de partidas (em desenvolvimento):

```bash
python worker.py
```

Ou com Docker Compose:

```bash
docker-compose up time-worker
```

#### Exemplo de Uso

1. Crie um time via API:
```bash
curl -X POST http://localhost:5001/times \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Flamengo",
    "estadio": "Maracanã",
    "cidade": "Rio de Janeiro"
  }'
```

2. Copie o `id` retornado e use no script de exemplo:
```bash
python exemplo_partida.py
```

3. Execute o worker:
```bash
python worker.py
```

4. Verifique os dados atualizados:
```bash
curl http://localhost:5001/times/ID_DO_TIME
```

