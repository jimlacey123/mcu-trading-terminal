import { Router, Request, Response } from 'express';
import { getConnectionCount } from '../services/socketHandler';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    connections: getConnectionCount(),
  });
});

export default router;
