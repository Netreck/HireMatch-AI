# src/services/analysis.py

import os
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, Any

from pydantic import BaseModel, Field
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import PydanticOutputParser


# ======================================================
# A. LOAD ENV + CREATE MODEL INSTANCE
# ======================================================
def load_openai_key() -> str:
    load_dotenv()
    key = os.getenv("openai")
    if not key:
        raise ValueError("API key 'openai' não encontrada no .env")
    return key


def create_llm() -> ChatOpenAI:
    api_key = load_openai_key()
    return ChatOpenAI(
        model="gpt-4.1-nano",
        temperature=0,
        api_key=api_key
    )


# ======================================================
# B. DEFINE JSON SCHEMA (Pydantic)
# ======================================================
class ResumeFeedback(BaseModel):
    pontos_fortes: list[str] = Field(description="Pontos fortes do candidato")
    pontos_a_melhorar: list[str] = Field(description="Pontos fracos")
    sugestoes: list[str] = Field(description="Sugestões práticas de melhoria")


def create_output_parser() -> PydanticOutputParser:
    return PydanticOutputParser(pydantic_object=ResumeFeedback)


# ======================================================
# C. BUILD PROMPT
# ======================================================
def build_prompt(curriculo: str, vaga: str, parser: PydanticOutputParser) -> str:
    return f"""
Você é um especialista em análise de compatibilidade entre currículos e vagas.  
Sua tarefa é comparar **exclusivamente** o conteúdo fornecido no CURRÍCULO e na VAGA.

REGRAS CRÍTICAS (NÃO QUEBRAR):
- Não invente informações.  
-  Não deduza experiências ou habilidades que **não estão explicitamente escritas** no currículo.
-  Não adicione tecnologias, experiências, cargos ou competências inexistentes.
-  Não gere interpretações subjetivas ou suposições.

-  Utilize **somente** as informações literais presentes no currículo para montar pontos fortes, pontos a melhorar e sugestões.
- Se faltar informação, **assuma falta**, não preencha.
-  Liste apenas correspondências reais entre currículo e vaga.
-  Pontos devem ser curtos, técnicos e objetivos.
- Se não houver itens suficientes para alguma seção, retorne menos itens — ou nenhum.

FORMATO DO RETORNO (OBRIGATÓRIO):
Retorne **apenas um JSON válido** seguindo estritamente:

{parser.get_format_instructions()}

 Diretrizes por seção:
- **Pontos Fortes**: apenas matches reais e literais entre currículo e vaga.  
- **Pontos a Melhorar**: lacunas reais onde o currículo não atende a requisitos da vaga.  
- **Sugestões**: melhorias práticas no currículo (sem inventar habilidades).

 Nunca inclua explicações, justificativas ou qualquer texto fora do JSON.

================================================================

CURRÍCULO (conteúdo literal a ser analisado):
\"\"\"{curriculo}\"\"\"

VAGA (conteúdo literal da vaga):
\"\"\"{vaga}\"\"\"

================================================================

Saída esperada:
Retorne **somente o JSON válido**, sem markdown, sem comentários e sem texto adicional.
"""

# ======================================================
# D. MAIN FUNCTION: COMPARA CURRÍCULO VS VAGA
# ======================================================
def comparar_curriculo_vaga(curriculo: str, vaga: str) -> Dict[str, Any]:
    llm = create_llm()
    parser = create_output_parser()

    prompt = build_prompt(curriculo, vaga, parser)
    resposta = llm.invoke(prompt)

    parsed = parser.parse(resposta.content)
    return parsed.model_dump()


# ======================================================
# (NO MAIN EXECUTION — service-only file)
# ======================================================