from fastapi import APIRouter, Response
from .services.matching import pipeline_matching
from .services.analysis import comparar_curriculo_vaga
from .services.adapt import gerar_curriculo_adaptado
import asyncio
from pydantic import BaseModel

class RequestModel(BaseModel):
    curriculo: str
    vaga: str

class AdaptRequestModel(BaseModel):
    curriculo: str
    vaga: str
router = APIRouter()

@router.options("/{path:path}")
async def options_handler(path: str):
    # Handle CORS preflight requests explicitly to avoid validation errors on bodyless OPTIONS calls.
    return Response(status_code=200)


@router.post("/match")
def match(data: dict):
    return pipeline_matching(data["curriculo"])



@router.post("/analysis")
async def match(data: RequestModel):
    loop = asyncio.get_event_loop()
    resultado = await loop.run_in_executor(None, comparar_curriculo_vaga, data.curriculo, data.vaga)
    return resultado


@router.post("/adapt")
async def adapt(data: AdaptRequestModel):
    loop = asyncio.get_event_loop()
    resultado = await loop.run_in_executor(None, gerar_curriculo_adaptado, data.curriculo, data.vaga)
    return resultado
