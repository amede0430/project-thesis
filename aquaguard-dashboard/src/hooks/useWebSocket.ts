import { useEffect, useRef, useState } from 'react';

interface SensorUpdate {
  type: string;
  sensor_id: number;
  name: string;
  status: string;
  location: string;
  latitude: number;
  longitude: number;
  sector: string;
}

export const useWebSocket = (url: string) => {
  const [lastMessage, setLastMessage] = useState<SensorUpdate | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Open' | 'Closed'>('Closed');
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(url);
      setConnectionStatus('Connecting');

      ws.current.onopen = () => {
        setConnectionStatus('Open');
        console.log('WebSocket connecté');
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'sensor_update') {
            setLastMessage(data);
          }
        } catch (error) {
          console.error('Erreur parsing WebSocket:', error);
        }
      };

      ws.current.onclose = () => {
        setConnectionStatus('Closed');
        console.log('WebSocket fermé, reconnexion dans 3s...');
        setTimeout(connectWebSocket, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };
    };

    connectWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url]);

  const sendMessage = (message: string) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(message);
    }
  };

  return { lastMessage, connectionStatus, sendMessage };
};