"""
Exemplo de como enviar uma partida para a fila Redis.

Este script demonstra como publicar dados de partidas que serão processados
pelo worker.py e atualizarão as estatísticas dos times.
"""

import redis
import json

# Conectar ao Redis
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

# Exemplo 1: Enviar uma partida onde o time venceu 2x1
partida_1 = {
    "time_id": "ID_DO_TIME_AQUI",  # Substitua com um ID válido de um time
    "pontos": 3,                    # 3 pontos por vitória
    "gols_feitos": 2,
    "gols_levados": 1
}

redis_client.rpush('partidas', json.dumps(partida_1))
print(f"Partida enviada: {partida_1}")

# Exemplo 2: Enviar uma partida onde o time empatou 1x1
partida_2 = {
    "time_id": "ID_DO_TIME_AQUI",  # Substitua com um ID válido de um time
    "pontos": 1,                    # 1 ponto por empate
    "gols_feitos": 1,
    "gols_levados": 1
}

redis_client.rpush('partidas', json.dumps(partida_2))
print(f"Partida enviada: {partida_2}")

# Exemplo 3: Enviar uma partida onde o time perdeu 0x2
partida_3 = {
    "time_id": "ID_DO_TIME_AQUI",  # Substitua com um ID válido de um time
    "pontos": 0,                    # 0 pontos por derrota
    "gols_feitos": 0,
    "gols_levados": 2
}

redis_client.rpush('partidas', json.dumps(partida_3))
print(f"Partida enviada: {partida_3}")

print("\nPara processar as partidas, execute: python worker.py")
