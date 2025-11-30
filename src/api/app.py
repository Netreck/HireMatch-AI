from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .routes import router as match_router

app = FastAPI(title="HireMatch-AI API", version="1.0")

# CORS liberado para o frontend rodando no container ou local.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(match_router)

# Servir build do frontend, se existir.
static_dir = Path(__file__).resolve().parents[2] / "app" / "dist"
if static_dir.exists():
    app.mount("/", StaticFiles(directory=static_dir, html=True), name="static")
