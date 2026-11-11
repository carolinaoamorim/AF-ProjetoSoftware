import os
import json
import redis
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

# Configuração do banco de dados
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_NAME = os.getenv('DB_NAME', 'football_db')
DB_PORT = os.getenv('DB_PORT', '27017')

MONGO_URI = f"mongodb://{DB_HOST}:{DB_PORT}"

# Conexão com MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
times_collection = db['times']

# Configuração do Redis
REDIS_HOST = os.getenv('REDIS_HOST', 'localhost')
REDIS_PORT = os.getenv('REDIS_PORT', '6379')
REDIS_DB = os.getenv('REDIS_DB', '0')

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=int(REDIS_PORT),
    db=int(REDIS_DB),
    decode_responses=True
)

def processar_partida(partida_data):
    """
    Processa uma partida e atualiza os dados do time.

    Formato esperado:
    {
        "time_id": "id_do_time",
        "pontos": 3,
        "gols_feitos": 2,
        "gols_levados": 1
    }
    """
    try:
        time_id = partida_data['time_id']
        pontos = partida_data['pontos']
        gols_feitos = partida_data['gols_feitos']
        gols_levados = partida_data['gols_levados']

        # Atualizar os dados do time no MongoDB
        times_collection.update_one(
            {'_id': ObjectId(time_id)},
            {
                '$inc': {
                    'pontos': pontos,
                    'gols_feitos': gols_feitos,
                    'gols_levados': gols_levados
                }
            }
        )

        print(f"Partida processada para o time {time_id}: +{pontos} pontos, +{gols_feitos} gols feitos, +{gols_levados} gols levados")

    except Exception as e:
        print(f"Erro ao processar partida: {e}")

def consumir_fila():
    """
    Consome mensagens da fila 'partidas' no Redis e processa cada uma.
    """
    print("Iniciando consumidor de partidas...")

    try:
        # Verificar conexão com Redis
        redis_client.ping()
        print("Conectado ao Redis com sucesso!")
    except Exception as e:
        print(f"Erro ao conectar ao Redis: {e}")
        return

    while True:
        try:
            # Bloqueia e aguarda uma mensagem da fila
            # Timeout de 0 significa espera indefinida
            mensagem = redis_client.blpop('partidas', timeout=0)

            if mensagem:
                # mensagem é uma tupla: (chave, valor)
                chave, valor = mensagem

                # Parsear JSON
                partida_data = json.loads(valor)

                # Processar a partida
                processar_partida(partida_data)

        except json.JSONDecodeError as e:
            print(f"Erro ao parsear JSON: {e}")
        except Exception as e:
            print(f"Erro ao consumir fila: {e}")

if __name__ == '__main__':
    consumir_fila()
