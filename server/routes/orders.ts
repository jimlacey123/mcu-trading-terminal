import { Router, Request, Response } from 'express';
import {
  getStudentById,
  getPositionsByStudent,
  createPosition,
  deletePosition,
  getPositionById,
  updateCashBalance,
  createTrade,
  getTradesByStudent,
} from '../services/database';
import { getCachedPrice } from '../services/priceCache';
import {
  calculateNotionalValue,
  calculateMarginRequired,
  calculateUnrealizedPnl,
  inferContractSize,
} from '../utils/pnlCalculations';
import { emitStudentUpdate, emitLeaderboardUpdate } from '../services/socketHandler';
import { buildLeaderboard } from './leaderboardHelper';

const router = Router();

// Place an order
router.post('/order', (req: Request, res: Response) => {
  const { studentId, instrument, direction, size, quantity } = req.body;

  // Validate inputs
  if (!studentId || !instrument || !direction || !size || !quantity) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  if (!['LONG', 'SHORT'].includes(direction)) {
    res.status(400).json({ error: 'Direction must be LONG or SHORT' });
    return;
  }

  if (!['FULL', 'MINI'].includes(size)) {
    res.status(400).json({ error: 'Size must be FULL or MINI' });
    return;
  }

  const qty = parseInt(quantity);
  if (isNaN(qty) || qty < 1 || qty > 50) {
    res.status(400).json({ error: 'Quantity must be between 1 and 50' });
    return;
  }

  const student = getStudentById(studentId);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const cached = getCachedPrice(instrument);
  if (!cached) {
    res.status(400).json({ error: 'No price available for instrument' });
    return;
  }

  const entryPrice = cached.price;
  const notionalValue = calculateNotionalValue(instrument, entryPrice, qty, size);
  const marginRequired = calculateMarginRequired(notionalValue);

  if (marginRequired > student.cash_balance) {
    res.status(400).json({
      error: 'INSUFFICIENT MARGIN',
      required: marginRequired,
      available: student.cash_balance,
    });
    return;
  }

  // Deduct margin and create position
  const newBalance = student.cash_balance - marginRequired;
  updateCashBalance(studentId, newBalance);

  const position = createPosition(
    studentId,
    instrument,
    direction,
    qty,
    entryPrice,
    notionalValue,
    marginRequired
  );

  console.log(
    `[Order] ${student.callsign} opened ${direction} ${qty}x ${size} ${instrument} @ ${entryPrice}`
  );

  // Emit updates
  const positions = getPositionsByStudent(studentId);
  emitStudentUpdate(studentId, newBalance, positions);

  try {
    const leaderboard = buildLeaderboard();
    emitLeaderboardUpdate(leaderboard);
  } catch (e) {
    // Non-critical
  }

  res.json({
    success: true,
    position: { ...position, current_price: entryPrice, unrealized_pnl: 0 },
    newBalance,
  });
});

// Close a position
router.post('/close/:positionId', (req: Request, res: Response) => {
  const positionId = parseInt(String(req.params.positionId));
  if (isNaN(positionId)) {
    res.status(400).json({ error: 'Invalid position ID' });
    return;
  }

  const position = getPositionById(positionId);
  if (!position) {
    res.status(404).json({ error: 'Position not found' });
    return;
  }

  const student = getStudentById(position.student_id);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const cached = getCachedPrice(position.instrument);
  if (!cached) {
    res.status(400).json({ error: 'No current price available' });
    return;
  }

  const exitPrice = cached.price;
  const contractSize = inferContractSize(
    position.notional_value,
    position.entry_price,
    position.contracts
  );

  const realizedPnl = calculateUnrealizedPnl(
    position.instrument,
    position.direction,
    position.entry_price,
    exitPrice,
    position.contracts,
    contractSize
  );

  // Return margin + P&L to cash
  const newBalance = student.cash_balance + position.margin_held + realizedPnl;
  updateCashBalance(position.student_id, newBalance);

  // Log trade
  createTrade(
    position.student_id,
    position.instrument,
    position.direction,
    position.contracts,
    position.entry_price,
    exitPrice,
    realizedPnl,
    position.opened_at
  );

  // Remove position
  deletePosition(positionId);

  console.log(
    `[Order] ${student.callsign} closed ${position.direction} ${position.contracts}x ${position.instrument} P&L: ${realizedPnl.toFixed(2)}`
  );

  // Emit updates
  const positions = getPositionsByStudent(position.student_id);
  emitStudentUpdate(position.student_id, newBalance, positions);

  try {
    const leaderboard = buildLeaderboard();
    emitLeaderboardUpdate(leaderboard);
  } catch (e) {
    // Non-critical
  }

  res.json({
    success: true,
    realizedPnl,
    newBalance,
  });
});

export default router;
