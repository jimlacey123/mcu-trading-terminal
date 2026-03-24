import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';

import healthRouter from './routes/health';
import pricesRouter from './routes/prices';
import studentsRouter from './routes/students';
import ordersRouter from './routes/orders';
import professorRouter from './routes/professor';

import { startPricePolling } from './services/priceCache';
import { initSocketHandler, emitPriceUpdate } from './services/socketHandler';

const app = express();
const server = createServer(app);
const PORT = parseInt(process.env.PORT || '3000');

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use('/api', healthRouter);
app.use('/api', pricesRouter);
app.use('/api', studentsRouter);
app.use('/api', ordersRouter);
app.use('/api', professorRouter);

// Serve static files in production
const clientDistPath = path.join(process.cwd(), 'client', 'dist');
app.use(express.static(clientDistPath));

// SPA fallback — serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Initialize Socket.io
initSocketHandler(io);

// Start price polling — emit to all clients on each update
startPricePolling((prices) => {
  emitPriceUpdate(prices, new Date().toISOString());
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║    MCU WARGAME TRADING TERMINAL — SERVER         ║
║    Port: ${PORT}                                     ║
║    Status: ONLINE                                ║
╚══════════════════════════════════════════════════╝
  `);
});

export default server;
