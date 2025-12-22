import type { AcousticData } from './thingspeak';

const API_BASE_URL = 'http://localhost:8000';

export interface VibrationAnalysisRequest {
  data: AcousticData[];
  sampling_rate?: number;
}

export interface VibrationAnalysisResponse {
  vibration_signal: number[];
  timestamps: string[];
  rms: number;
  peak: number;
  frequency: number;
  status: 'normal' | 'warning' | 'anomaly';
  spectrogram: number[][];
  spectrogram_freqs: number[];
  spectrogram_times: number[];
}

export const vibrationService = {
  /**
   * Analyse les données acoustiques et retourne le signal vibratoire
   */
  async analyzeVibration(
    acousticData: AcousticData[],
    samplingRate: number = 100
  ): Promise<VibrationAnalysisResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vibration/analyze`, {
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
      console.error('Error analyzing vibration:', error);
      throw error;
    }
  },

  /**
   * Health check de l'API
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vibration/health`);
      const data = await response.json();
      return data.status === 'ok';
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  },
};
