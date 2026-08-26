import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/app.config';
import { AuthService } from '../modules/auth/services/auth.service';
import { AuthRepository } from '../modules/auth/repositories/auth.repository';
import { NotificationService } from '../modules/notifications/services/notification.service';
import { NotificationRepository } from '../modules/notifications/repositories/notification.repository';

export const initWebSocket = (io: SocketIOServer) => {
  const authRepository = new AuthRepository();
  const authService = new AuthService(authRepository);
  const notificationRepo = new NotificationRepository();
  const notificationService = new NotificationService(notificationRepo);

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, config.jwt.secret) as any;
      const user = await authService.validateUser(decoded.userId);
      if (!user) return next(new Error('Invalid user'));

      socket.data.user = { id: user.id, name: user.name };
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    console.log(`User connected: ${user.name} (${socket.id})`);

    // Join user-specific room
    socket.join(`user:${user.id}`);

    // Game result subscription
    socket.on('subscribe:game', (gameId: string) => {
      socket.join(`game:${gameId}`);
      console.log(`User ${user.name} subscribed to game ${gameId}`);
    });

    socket.on('unsubscribe:game', (gameId: string) => {
      socket.leave(`game:${gameId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${user.name}`);
    });
  });

  // Emit game result updated
  const emitGameResultUpdated = (gameId: string, roundData: any) => {
    io.to(`game:${gameId}`).emit('GAME_RESULT_UPDATED', roundData);
  };

  // Emit notification created
  const emitNotificationCreated = (userId: string, notification: any) => {
    io.to(`user:${userId}`).emit('NOTIFICATION_CREATED', notification);
  };

  // Emit game status changed
  const emitGameStatusChanged = (gameId: string, status: string) => {
    io.to(`game:${gameId}`).emit('GAME_STATUS_CHANGED', { gameId, status });
  };

  // Emit support message
  const emitSupportMessage = (ticketId: string, message: any) => {
    io.to(`ticket:${ticketId}`).emit('SUPPORT_MESSAGE', message);
  };

  return {
    emitGameResultUpdated,
    emitNotificationCreated,
    emitGameStatusChanged,
    emitSupportMessage,
  };
};
