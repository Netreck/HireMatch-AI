from fastapi import APIRouter
from .services.matching import pipeline_matching
from .services.analysis import comparar_curriculo_vaga
import asyncio
from pydantic import BaseModel

class RequestModel(BaseModel):
    curriculo: str
    vaga: str
router = APIRouter()


@router.post("/match")
def match(data: dict):
    return pipeline_matching(data["curriculo"])



@router.post("/analysis")
async def match(data: RequestModel):
    loop = asyncio.get_event_loop()
    resultado = await loop.run_in_executor(None, comparar_curriculo_vaga, data.curriculo, data.vaga)
    return resultado