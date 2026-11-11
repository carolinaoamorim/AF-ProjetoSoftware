FROM python:3.11-slim

WORKDIR /app

# Copiar requirements e instalar dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY app.py .
COPY worker.py .

# Expor porta
EXPOSE 5000

# Variáveis de ambiente padrão
ENV DB_HOST=mongo
ENV DB_NAME=football_db
ENV DB_PORT=27017

# Comando para iniciar a aplicação
CMD ["python", "app.py"]
