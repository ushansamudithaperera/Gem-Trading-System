from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

from .gem_classifier import classify_gem_image
from .price_predictor import predict_price

load_dotenv()

app = FastAPI(title="Gem Trading AI Service", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PricePredictionRequest(BaseModel):
    weight_carats: float
    clarity: str
    color: str
    cut: Optional[str] = None

class PricePredictionResponse(BaseModel):
    estimated_price: float
    confidence: float

class ClassificationResponse(BaseModel):
    gem_type: str
    confidence: float
    attributes: Optional[dict] = None

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/classify", response_model=ClassificationResponse)
async def classify(file: UploadFile = File(...)):
    """
    Classify gemstone type from uploaded image
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")
    
    contents = await file.read()
    result = classify_gem_image(contents)
    return result

@app.post("/predict-price", response_model=PricePredictionResponse)
async def predict(request: PricePredictionRequest):
    """
    Predict price based on gem parameters
    """
    result = predict_price(
        weight_carats=request.weight_carats,
        clarity=request.clarity,
        color=request.color,
        cut=request.cut
    )
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)