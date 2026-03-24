import { Server, Socket } from 'socket.io';

let io: Server | null = null;
const connectedClients = new Map<string, { callsign?: string; socket: Socket }>();

export function initSocketHandler(socketIo: Server): void {
  io = socketIo;

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);
    connectedClients.set(socket.id, { socket });

    socket.on('subscribe', (data: { callsign: string }) => {
      if (data?.callsign) {
        connectedClients.set(socket.id, { callsign: data.callsign, socket });
        console.log(`[Socket] ${socket.id} subscribed as ${data.callsign}`);
      }
    });

    socket.on('disconnect', () => {
      connectedClients.delete(socket.id);
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  console.log('[Socket] Handler initialized');
}

export function emitPriceUpdate(prices: any[], timestamp: string): void {
  if (!io) return;
  io.emit('priceUpdate', { prices, timestamp });
}

export function emitLeaderboardUpdate(leaderboard: any[]): void {
  if (!io) return;
  io.emit('leaderboardUpdate', { leaderboard });
}

export function emitStudentUpdate(
  studentId: number,
  cashBalance: number,
  positions: any[]
): void {
  if (!io) return;
  // Emit to all clients — they'll filter by their own student ID
  io.emit('studentUpdate', { studentId, cashBalance, positions });
}

export function getConnectionCount(): number {
  return connectedClients.size;
}

export function getIo(): Server | null {
  return io;
}
