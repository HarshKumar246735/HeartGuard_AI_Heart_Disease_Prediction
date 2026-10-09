import json
import os
from pathlib import Path

import joblib
import pandas as pd
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

load_dotenv()
ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT / os.getenv("MODEL_PATH", "model/heart_model.joblib")
METRICS_PATH = MODEL_PATH.parent / "metrics.json"

app = FastAPI(title="HeartGuard ML Service", version="1.0.0")

_model = None


def get_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            raise HTTPException(status_code=503, detail="Model file not found. Run training/train_model.py first.")
        _model = joblib.load(MODEL_PATH)
    return _model


class PredictRequest(BaseModel):
    """Feature names match the training dataset (UCI Cleveland)."""
    age: int = Field(ge=18, le=100)
    sex: int = Field(ge=0, le=1, description="1 = male, 0 = female")
    cp: int = Field(ge=1, le=4, description="Chest pain type: 1 typical, 2 atypical, 3 non-anginal, 4 asymptomatic")
    trestbps: float = Field(ge=80, le=250, description="Resting blood pressure (mmHg)")
    chol: float = Field(ge=100, le=600, description="Serum cholesterol (mg/dL)")
    fbs: int = Field(ge=0, le=1, description="Fasting blood sugar > 120 mg/dL")
    thalach: float = Field(ge=60, le=220, description="Maximum heart rate achieved (bpm)")
    exang: int = Field(ge=0, le=1, description="Exercise-induced angina")


@app.get("/health")
def health():
    loaded = MODEL_PATH.exists()
    metrics = json.loads(METRICS_PATH.read_text()) if METRICS_PATH.exists() else None
    return {"status": "ok", "model_loaded": loaded, "metrics": metrics}


@app.post("/predict")
def predict(req: PredictRequest):
    model = get_model()
    row = pd.DataFrame([req.model_dump()])
    probability = float(model.predict_proba(row)[0][1])
    return {
        "prediction": "Higher Risk" if probability >= 0.5 else "Lower Risk",
        "probability": round(probability, 4),
    }
