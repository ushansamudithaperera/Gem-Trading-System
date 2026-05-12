from typing import Optional, Dict, Any
import math
import logging

logger = logging.getLogger(__name__)

# Base price per carat for different clarity/color combinations (mock)
CLARITY_MULTIPLIER = {
    "IF": 2.0,
    "VVS1": 1.8,
    "VVS2": 1.6,
    "VS1": 1.4,
    "VS2": 1.2,
    "SI1": 1.0,
    "SI2": 0.8,
    "I1": 0.6
}

COLOR_MULTIPLIER = {
    "D": 1.5,
    "E": 1.4,
    "F": 1.3,
    "G": 1.2,
    "H": 1.0,
    "I": 0.9,
    "J": 0.8
}

CUT_MULTIPLIER = {
    "Excellent": 1.4,
    "Very Good": 1.2,
    "Good": 1.0,
    "Fair": 0.8,
    "Poor": 0.6
}

def predict_price(weight_carats: float, clarity: str, color: str, cut: Optional[str] = None) -> Dict[str, float]:
    """
    Mock price prediction using base rate + multipliers.
    Actual model would be trained on historical transaction data.
    """
    logger.info(f"Predicting price for {weight_carats}ct, clarity={clarity}, color={color}, cut={cut}")
    
    # Base price per carat for rough estimate ($1000 per carat baseline)
    base_price_per_carat = 1000.0
    
    clarity_mult = CLARITY_MULTIPLIER.get(clarity.upper(), 1.0)
    color_mult = COLOR_MULTIPLIER.get(color.upper(), 1.0)
    cut_mult = CUT_MULTIPLIER.get(cut, 1.0) if cut else 1.0
    
    # Logarithmic scaling for larger stones (diminishing returns)
    size_factor = math.log(weight_carats + 1) / math.log(2)
    size_adjustment = 1 + (size_factor - 1) * 0.5  # scale factor between 0.5 and 1.5
    
    estimated_price = (base_price_per_carat * weight_carats * clarity_mult * color_mult * cut_mult * size_adjustment)
    estimated_price = round(estimated_price, 2)
    
    # Confidence based on completeness of data
    confidence = 0.7
    if cut:
        confidence += 0.1
    if clarity in CLARITY_MULTIPLIER and color in COLOR_MULTIPLIER:
        confidence += 0.1
    confidence = min(0.95, confidence)
    
    return {
        "estimated_price": estimated_price,
        "confidence": round(confidence, 2)
    }