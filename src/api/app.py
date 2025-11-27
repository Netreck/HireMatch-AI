from fastapi import FastAPI
from .routes import router as match_router 

app = FastAPI(title="HireMatch-AI API", version="1.0")

app.include_router(match_router)  