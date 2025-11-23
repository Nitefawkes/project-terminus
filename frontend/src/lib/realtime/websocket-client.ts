import { io, Socket } from 'socket.io-client';
import { TokenStorage } from '@/lib/api/token-storage';

export interface SatellitePosition {
  name: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  timestamp: Date;
}

export interface SpaceWeatherData {
  kpIndex: number;
  solarWind: {
    speed: number;
    density: number;
  };
  magneticField: {
    bt: number;
    bz: number;
  };
  xrayFlux: {
    short: number;
    long: number;
    class: string;
  };
  timestamp: Date;
}

export interface TerminatorData {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    properties: {
      fill: string;
      fillOpacity: number;
    };
  }>;
  sunPosition: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

type EventCallback = (...args: any[]) => void;

class WebSocketClient {
  private socket: Socket | null = null;
  private isConnecting: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 2000;
  private eventHandlers: Map<string, Set<EventCallback>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeConnection();
    }
  }

  private initializeConnection() {
    if (this.isConnecting || this.socket?.connected) {
      return;
    }

    const token = TokenStorage.getAccessToken();
    if (!token) {
      console.warn('WebSocket: No access token available, skipping connection');
      return;
    }

    this.isConnecting = true;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const wsUrl = apiUrl.replace(/^http/, 'ws');

    this.socket = io(`${wsUrl}/realtime`, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      transports: ['websocket', 'polling'],
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket: Connected to real-time server');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit('connect');
    });

    this.socket.on('connected', (data) => {
      console.log('WebSocket: Connection confirmed', data);
      this.emit('connected', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket: Disconnected', reason);
      this.isConnecting = false;
      this.emit('disconnect', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket: Connection error', error);
      this.isConnecting = false;
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('WebSocket: Max reconnection attempts reached');
        this.emit('connection_failed', error);
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket: Error', error);
      this.emit('error', error);
    });

    // Real-time data events
    this.socket.on('satellite:update', (data) => {
      this.emit('satellite:update', data);
    });

    this.socket.on('space-weather:update', (data) => {
      this.emit('space-weather:update', data);
    });

    this.socket.on('terminator:update', (data) => {
      this.emit('terminator:update', data);
    });
  }

  connect() {
    if (!this.socket || !this.socket.connected) {
      this.initializeConnection();
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  subscribe(channels: string[]): Promise<any> {
    if (!this.socket || !this.socket.connected) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('subscribe', { channels }, (response: any) => {
        if (response.event === 'error') {
          reject(new Error(response.data.message));
        } else {
          console.log('WebSocket: Subscribed to channels', channels);
          resolve(response);
        }
      });
    });
  }

  unsubscribe(channels: string[]): Promise<any> {
    if (!this.socket || !this.socket.connected) {
      return Promise.reject(new Error('WebSocket not connected'));
    }

    return new Promise((resolve, reject) => {
      this.socket!.emit('unsubscribe', { channels }, (response: any) => {
        if (response.event === 'error') {
          reject(new Error(response.data.message));
        } else {
          console.log('WebSocket: Unsubscribed from channels', channels);
          resolve(response);
        }
      });
    });
  }

  on(event: string, callback: EventCallback) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(callback);
  }

  off(event: string, callback: EventCallback) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(callback);
    }
  }

  private emit(event: string, ...args: any[]) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((callback) => callback(...args));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): 'connected' | 'connecting' | 'disconnected' {
    if (this.socket?.connected) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }
}

// Singleton instance
export const websocketClient = new WebSocketClient();
