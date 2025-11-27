import os
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings

# ---------------------------------------------------
# Carrega variáveis de ambiente
# ---------------------------------------------------
load_dotenv()

# ---------------------------------------------------
# Função principal: recebe o texto do currículo e
# retorna (1) o texto original + (2) o embedding
# ---------------------------------------------------
def process_curriculo(curriculo: str):
    api_key = os.getenv("openai")

    if not api_key:
        raise ValueError("OPENAI_API_KEY não encontrado no ambiente (.env).")

    # Criar cliente de embeddings (somente dentro da função!)
    embeddings = OpenAIEmbeddings(
        model="text-embedding-3-large",
        api_key=api_key
    )

    # Criar embedding do currículo
    curriculo_embedding = embeddings.embed_query(curriculo)

    # Retornar apenas o necessário
    return {
        "curriculo": curriculo,
        "embedding": curriculo_embedding
    }