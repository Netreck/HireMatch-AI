from pinecone import Pinecone
from dotenv import load_dotenv
import os
import ast
import pandas as pd
from pathlib import Path

# Carregar variáveis do .env
load_dotenv()

# Chave do Pinecone
key = os.getenv("pinecone_key")

pc = Pinecone(api_key=key)
index_name = "hirematch-jobs"

# ==========================================
# 1. Criar índice se não existir
# ==========================================
if index_name not in pc.list_indexes().names():
    print("Criando índice...")
    pc.create_index(
        name=index_name,
        dimension=3072,  # use 1536 se estiver usando text-embedding-3-small
        metric="cosine",
        spec={
            "serverless": {
                "cloud": "aws",
                "region": "us-east-1"
            }
        }
    )

print("Conectando ao índice...")
index = pc.Index(index_name)

# ==========================================
# 2. Caminho correto do CSV
# ==========================================
BASE_DIR = Path(__file__).resolve().parent  # DataBase-Pinecone/
CSV_PATH = BASE_DIR.parent / "processed" / "jobs_with_embeddings.csv"

print("CSV encontrado em:", CSV_PATH)

df = pd.read_csv(CSV_PATH)

# ==========================================
# 3. Preparar vetores
# ==========================================
vectors = []

for _, row in df.iterrows():
    embedding = row["embedding"]

    # converter string para lista de floats
    if isinstance(embedding, str):
        embedding = ast.literal_eval(embedding)

    vectors.append({
        "id": str(row["id"]),
        "values": embedding,
        "metadata": {
            "title": row["title"],
            "description": row["description"],
            "company_name": row["company_name"],
            "url": row["url"],
            "tech_stacks_found": row["tech_stacks_found"],
            "soft_skills_found": row["soft_skills_found"]
        }
    })

print(f"Total de vetores preparados: {len(vectors)}")

# ==========================================
# 4. Enviar para o Pinecone em BATCHES
# ==========================================
BATCH_SIZE = 50  # seguro para evitar limite de 4MB

print("Iniciando upload em batches...")

for i in range(0, len(vectors), BATCH_SIZE):
    batch = vectors[i:i + BATCH_SIZE]
    print(f"→ Enviando batch {i} até {i + len(batch)}...")
    index.upsert(vectors=batch)

print("Upload concluído com sucesso!")