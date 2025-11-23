import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  email?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);
  private connectedClients = new Map<string, AuthenticatedSocket>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake auth
      const token = client.handshake.auth.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });

      // Attach user info to socket
      client.userId = payload.sub;
      client.email = payload.email;

      // Store connected client
      this.connectedClients.set(client.id, client);

      this.logger.log(
        `Client connected: ${client.id} (User: ${client.email})`,
      );
      this.logger.log(`Total connected clients: ${this.connectedClients.size}`);

      // Send initial connection confirmation
      client.emit('connected', {
        message: 'Successfully connected to real-time updates',
        userId: client.userId,
      });
    } catch (error) {
      this.logger.error(
        `Client ${client.id} connection failed: ${error.message}`,
      );
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.connectedClients.delete(client.id);
    this.logger.log(
      `Client disconnected: ${client.id} (User: ${client.email})`,
    );
    this.logger.log(`Total connected clients: ${this.connectedClients.size}`);
  }

  @SubscribeMessage('subscribe')
  handleSubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { channels } = data;

    if (!channels || !Array.isArray(channels)) {
      return {
        event: 'error',
        data: { message: 'Invalid channels format' },
      };
    }

    // Join requested channels (rooms)
    channels.forEach((channel) => {
      client.join(channel);
      this.logger.log(
        `Client ${client.id} joined channel: ${channel}`,
      );
    });

    return {
      event: 'subscribed',
      data: { channels, message: 'Successfully subscribed to channels' },
    };
  }

  @SubscribeMessage('unsubscribe')
  handleUnsubscribe(
    @MessageBody() data: { channels: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { channels } = data;

    if (!channels || !Array.isArray(channels)) {
      return {
        event: 'error',
        data: { message: 'Invalid channels format' },
      };
    }

    // Leave requested channels (rooms)
    channels.forEach((channel) => {
      client.leave(channel);
      this.logger.log(
        `Client ${client.id} left channel: ${channel}`,
      );
    });

    return {
      event: 'unsubscribed',
      data: { channels, message: 'Successfully unsubscribed from channels' },
    };
  }

  // Broadcast methods to be called by services

  broadcastSatelliteUpdate(satelliteData: any) {
    this.server.to('satellites').emit('satellite:update', satelliteData);
    this.logger.debug('Broadcasted satellite update');
  }

  broadcastSpaceWeatherUpdate(weatherData: any) {
    this.server.to('space-weather').emit('space-weather:update', weatherData);
    this.logger.debug('Broadcasted space weather update');
  }

  broadcastTerminatorUpdate(terminatorData: any) {
    this.server.to('terminator').emit('terminator:update', terminatorData);
    this.logger.debug('Broadcasted terminator update');
  }

  broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
    this.logger.debug(`Broadcasted ${event} to all clients`);
  }

  getConnectedClientsCount(): number {
    return this.connectedClients.size;
  }
}
