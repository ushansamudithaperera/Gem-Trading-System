import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_classify_endpoint_no_file():
    response = client.post("/classify")
    assert response.status_code == 422  # missing file

def test_predict_price():
    payload = {
        "weight_carats": 2.5,
        "clarity": "VS1",
        "color": "G",
        "cut": "Excellent"
    }
    response = client.post("/predict-price", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "estimated_price" in data
    assert "confidence" in data
    assert data["estimated_price"] > 0

def test_predict_price_missing_optional():
    payload = {
        "weight_carats": 1.0,
        "clarity": "SI1",
        "color": "H"
    }
    response = client.post("/predict-price", json=payload)
    assert response.status_code == 200
    assert response.json()["estimated_price"] > 0