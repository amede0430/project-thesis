// ThingSpeak API integration
const THINGSPEAK_CHANNEL_ID = '3210058';
const THINGSPEAK_API_KEY = 'COOLQGZFSE397158';
const THINGSPEAK_BASE_URL = 'https://api.thingspeak.com';

export interface ThingSpeakFeed {
  created_at: string;
  entry_id: number;
  field1: string; // accX
  field2: string; // accY
  field3: string; // accZ
}

export interface ThingSpeakResponse {
  channel: {
    id: number;
    name: string;
    description: string;
    created_at: string;
    updated_at: string;
    last_entry_id: number;
  };
  feeds: ThingSpeakFeed[];
}

export interface AcousticData {
  timestamp: string;
  accX: number;
  accY: number;
  accZ: number;
}

export const thingSpeakService = {
  /**
   * Fetch acoustic sensor data from ThingSpeak
   */
  async fetchAcousticData(results: number = 40): Promise<AcousticData[]> {
    try {
      const url = `${THINGSPEAK_BASE_URL}/channels/${THINGSPEAK_CHANNEL_ID}/feeds.json?api_key=${THINGSPEAK_API_KEY}&results=${results}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`ThingSpeak API error: ${response.status}`);
      }

      const data: ThingSpeakResponse = await response.json();
      
      return data.feeds
        .filter(feed => feed.field1 && feed.field2 && feed.field3)
        .map(feed => ({
          timestamp: feed.created_at,
          accX: parseFloat(feed.field1),
          accY: parseFloat(feed.field2),
          accZ: parseFloat(feed.field3),
        }));
    } catch (error) {
      console.error('Error fetching ThingSpeak data:', error);
      throw error;
    }
  },

  /**
   * Fetch latest acoustic reading
   */
  async fetchLatestReading(): Promise<AcousticData | null> {
    const data = await this.fetchAcousticData(1);
    return data.length > 0 ? data[0] : null;
  },
};
