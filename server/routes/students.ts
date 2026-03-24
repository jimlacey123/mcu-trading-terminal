import { Router, Request, Response } from 'express';
import {
  getStudentByCallsign,
  createStudent,
  updateLastActive,
  getPositionsByStudent,
  getTradesByStudent,
} from '../services/database';
import { getCachedPrice } from '../services/priceCache';
import { calculateUnrealizedPnl, inferContractSize } from '../utils/pnlCalculations';

const router = Router();

// Get or create student by callsign
router.get('/student/:callsign', (req: Request, res: Response) => {
  const callsign = String(req.params.callsign);

  if (!callsign || callsign.trim().length === 0) {
    res.status(400).json({ error: 'Callsign is required' });
    return;
  }

  let student = getStudentByCallsign(callsign.trim());

  if (!student) {
    student = createStudent(callsign.trim());
    console.log(`[Students] Created new student: ${callsign}`);
  } else {
    updateLastActive(student.id);
  }

  res.json(student);
});

// Get positions with unrealized P&L
router.get('/student/:id/positions', (req: Request, res: Response) => {
  const studentId = parseInt(String(req.params.id));
  if (isNaN(studentId)) {
    res.status(400).json({ error: 'Invalid student ID' });
    return;
  }

  const positions = getPositionsByStudent(studentId);

  const positionsWithPnl = positions.map((pos: any) => {
    const cached = getCachedPrice(pos.instrument);
    const currentPrice = cached?.price || pos.entry_price;
    const contractSize = inferContractSize(pos.notional_value, pos.entry_price, pos.contracts);

    const unrealized_pnl = calculateUnrealizedPnl(
      pos.instrument,
      pos.direction,
      pos.entry_price,
      currentPrice,
      pos.contracts,
      contractSize
    );

    return {
      ...pos,
      current_price: currentPrice,
      unrealized_pnl,
    };
  });

  res.json(positionsWithPnl);
});

// Get trade history
router.get('/student/:id/trades', (req: Request, res: Response) => {
  const studentId = parseInt(String(req.params.id));
  if (isNaN(studentId)) {
    res.status(400).json({ error: 'Invalid student ID' });
    return;
  }

  const limit = parseInt(req.query.limit as string) || 100;
  const trades = getTradesByStudent(studentId, limit);
  res.json(trades);
});

export default router;
