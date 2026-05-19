from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models
from app.routers import router
from app.routers.auth import router as auth_router
from app.routers.insights import router as insights_router
from app.routers.whatsapp import router as whatsapp_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Klarity API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth")
app.include_router(insights_router, prefix="/api")
app.include_router(router, prefix="/api")
app.include_router(whatsapp_router, prefix="/api")

@app.get("/")
def health_check():
    return {"status": "Klarity API is running"}

import threading
import requests
import time

def keep_alive():
    while True:
        time.sleep(14 * 60)
        try:
            requests.get("https://klarity-backend-7nhh.onrender.com/")
            print("Keep-alive ping sent")
        except:
            pass

threading.Thread(target=keep_alive, daemon=True).start()
