from fastapi import FastAPI
from .routes import router as match_router 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="HireMatch-AI API", version="1.0")



# Libera o frontend (localhost:8080)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # você pode trocar "*" por ["http://localhost:8080"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(match_router)  