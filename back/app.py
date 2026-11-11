import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configuração de CORS - Libera todas as origens e métodos
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"], "allow_headers": ["Content-Type", "Authorization"]}})

# Configuração do banco de dados
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_NAME = os.getenv('DB_NAME', 'football_db')
DB_PORT = os.getenv('DB_PORT', '27017')

MONGO_URI = f"mongodb://{DB_HOST}:{DB_PORT}"

# Conexão com MongoDB
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
times_collection = db['times']

# Função auxiliar para converter ObjectId para string
def time_to_dict(time_doc):
    return {
        'id': str(time_doc['_id']),
        'nome': time_doc['nome'],
        'estadio': time_doc['estadio'],
        'cidade': time_doc['cidade'],
        'pontos': time_doc.get('pontos', 0),
        'gols_feitos': time_doc.get('gols_feitos', 0),
        'gols_levados': time_doc.get('gols_levados', 0)
    }

# Rotas da API

@app.route('/times', methods=['GET'])
def listar_times():
    """Lista todos os times cadastrados"""
    times = list(times_collection.find())
    return jsonify([time_to_dict(time) for time in times])

@app.route('/times/<time_id>', methods=['GET'])
def obter_time(time_id):
    """Obtém um time específico pelo ID"""
    try:
        time = times_collection.find_one({'_id': ObjectId(time_id)})
    except:
        return jsonify({'erro': 'ID inválido'}), 400

    if not time:
        return jsonify({'erro': 'Time não encontrado'}), 404

    return jsonify(time_to_dict(time))

@app.route('/times', methods=['POST'])
def criar_time():
    """Cria um novo time"""
    dados = request.get_json()

    if not dados or not all(k in dados for k in ['nome', 'estadio', 'cidade']):
        return jsonify({'erro': 'Campos obrigatórios: nome, estadio, cidade'}), 400

    novo_time = {
        'nome': dados['nome'],
        'estadio': dados['estadio'],
        'cidade': dados['cidade'],
        'pontos': 0,
        'gols_feitos': 0,
        'gols_levados': 0
    }

    resultado = times_collection.insert_one(novo_time)

    return jsonify({
        'id': str(resultado.inserted_id),
        'nome': novo_time['nome'],
        'estadio': novo_time['estadio'],
        'cidade': novo_time['cidade'],
        'pontos': novo_time['pontos'],
        'gols_feitos': novo_time['gols_feitos'],
        'gols_levados': novo_time['gols_levados']
    }), 201
    
@app.route('/health', methods=['GET'])
def health():
    """Verifica a saúde da API"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
