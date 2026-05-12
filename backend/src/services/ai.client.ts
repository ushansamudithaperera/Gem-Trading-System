import { logger } from '../config/logger';
import { env } from '../config/env';

// AI microservice client (Python FastAPI) - optional free tier on Hugging Face / Render
export class AIClient {
  private baseUrl: string | null = null;
  
  constructor() {
    if (env.AI_SERVICE_URL) {
      this.baseUrl = env.AI_SERVICE_URL;
      logger.info(`AI client initialized: ${this.baseUrl}`);
    } else {
      logger.warn('AI service not configured, using mock predictions');
    }
  }
  
  /**
   * Classify gemstone type from image
   */
  async classifyGem(imageUrl: string): Promise<{ type: string; confidence: number }> {
    if (!this.baseUrl) {
      return this.mockClassify();
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      return await response.json() as { type: string; confidence: number };
    } catch (error) {
      logger.error(`AI classify failed: ${error}`);
      return this.mockClassify();
    }
  }
  
  /**
   * Predict price based on gem parameters
   */
  async predictPrice(weightCarats: number, clarity: string, color: string, cut?: string): Promise<{ estimatedPrice: number; confidence: number }> {
    if (!this.baseUrl) {
      return this.mockPrice(weightCarats);
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/predict-price`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weight_carats: weightCarats, clarity, color, cut }),
      });
      return await response.json() as { estimatedPrice: number; confidence: number };
    } catch (error) {
      logger.error(`AI price prediction failed: ${error}`);
      return this.mockPrice(weightCarats);
    }
  }
  
  private mockClassify(): { type: string; confidence: number } {
    return { type: 'ROUGH', confidence: 0.75 };
  }
  
  private mockPrice(weightCarats: number): { estimatedPrice: number; confidence: number } {
    const pricePerCarat = Math.random() * 500 + 100;
    return { estimatedPrice: weightCarats * pricePerCarat, confidence: 0.6 };
  }
}

export const aiClient = new AIClient();