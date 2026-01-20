from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

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

# Registrar rotas da API primeiro
app.include_router(match_router, prefix="/api")

# Servir build do frontend, se existir.
static_dir = Path(__file__).resolve().parents[2] / "app" / "dist"
if static_dir.exists():
    # Montar arquivos estáticos (JS, CSS, assets) em /assets
    assets_dir = static_dir / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # Rota catch-all para SPA - serve index.html para todas as rotas não-API
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Se for uma requisição para /api, não deve chegar aqui
        # Serve index.html para qualquer outra rota (SPA routing)
        _ = full_path  # usado para capturar qualquer path
        index_file = static_dir / "index.html"
        if index_file.exists():
            return FileResponse(index_file)
        return {"error": "Frontend not found"}
