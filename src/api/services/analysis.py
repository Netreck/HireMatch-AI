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

Sua tarefa:
Comparar **CURRÍCULO** e **VAGA** e retornar **somente um JSON válido** exatamente no formato:

{parser.get_format_instructions()}

Instruções importantes:
- Não invente informações sobre a vaga ou o curriculo
- Caso não tenha nao precise forçar ter muitos pontos positivos/negativos/sugestao se necessario nao coloque nenhum
- De sugestoes de onde focar o curriculo para melhorar as chances/compatibilidade com a vaga
- Se possivel seja "pessoal" citando um ou outro ponto especifico do curriculo que combina com a vaga
- Pontos curtos
- Seja direto, objetivo e técnico.
- Liste apenas informações realmente relevantes para a vaga.
- Pontos fortes: correspondências claras entre currículo e vaga.
- Pontos a melhorar: lacunas reais de requisitos.
- Sugestões: ações práticas que aumentariam a compatibilidade.
- NÃO gere explicações, apenas o JSON final.

-------------------------
CURRÍCULO:
{curriculo}

VAGA:
{vaga}
-------------------------

Retorne APENAS o JSON, sem texto adicional.
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