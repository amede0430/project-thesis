import type { AcousticData } from './thingspeak';

const API_BASE_URL = 'http://localhost:8000';

export interface MLPredictionRequest {
  data: AcousticData[];
  sampling_rate?: number;
}

export interface MLPredictionResponse {
  prediction: string;
  confidence: number;
  spectrogram_image: string; // Base64
  probabilities: Record<string, number>;
}

export const mlService = {
  /**
   * Fait une prédiction avec le modèle ML
   */
  async predict(
    acousticData: AcousticData[],
    samplingRate: number = 100
  ): Promise<MLPredictionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ml/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: acousticData,
          sampling_rate: samplingRate,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error making prediction:', error);
      throw error;
    }
  },

  /**
   * Health check de l'API ML
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ml/health`);
      const data = await response.json();
      return data.model_loaded === true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },
};
