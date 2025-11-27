from fastapi import APIRouter
from .services.matching import process_curriculo

router = APIRouter()

@router.post("/match")
def match(data: dict):
    return process_curriculo(data["curriculo"])