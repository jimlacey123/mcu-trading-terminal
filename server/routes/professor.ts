import { Router, Request, Response } from 'express';
import {
  getProfessorStats,
  getRecentTrades,
  getStudentById,
  resetStudent,
  resetAllStudents,
} from '../services/database';
import { buildLeaderboard } from './leaderboardHelper';
import { emitLeaderboardUpdate } from '../services/socketHandler';

const router = Router();

// Get leaderboard
router.get('/leaderboard', (_req: Request, res: Response) => {
  const leaderboard = buildLeaderboard();
  res.json(leaderboard);
});

// Get professor stats
router.get('/professor/stats', (_req: Request, res: Response) => {
  const stats = getProfessorStats();
  res.json(stats);
});

// Get recent trade activity
router.get('/professor/activity', (_req: Request, res: Response) => {
  const limit = 50;
  const trades = getRecentTrades(limit);
  res.json(trades);
});

// Reset individual student
router.post('/professor/reset/:studentId', (req: Request, res: Response) => {
  const studentId = parseInt(String(req.params.studentId));
  if (isNaN(studentId)) {
    res.status(400).json({ error: 'Invalid student ID' });
    return;
  }

  if (!req.body.confirm) {
    res.status(400).json({ error: 'Confirmation required' });
    return;
  }

  const student = getStudentById(studentId);
  if (!student) {
    res.status(404).json({ error: 'Student not found' });
    return;
  }

  const success = resetStudent(studentId);
  if (success) {
    console.log(`[Professor] Reset account for ${student.callsign}`);
    try {
      const leaderboard = buildLeaderboard();
      emitLeaderboardUpdate(leaderboard);
    } catch (e) {
      // Non-critical
    }
    res.json({ success: true, message: `Account reset for ${student.callsign}` });
  } else {
    res.status(500).json({ error: 'Reset failed' });
  }
});

// Reset all students
router.post('/professor/reset-all', (req: Request, res: Response) => {
  if (req.body.confirm !== 'RESET') {
    res.status(400).json({ error: 'Must send { confirm: "RESET" } to confirm' });
    return;
  }

  const success = resetAllStudents();
  if (success) {
    console.log('[Professor] All accounts reset');
    try {
      const leaderboard = buildLeaderboard();
      emitLeaderboardUpdate(leaderboard);
    } catch (e) {
      // Non-critical
    }
    res.json({ success: true, message: 'All accounts reset to $1,000,000' });
  } else {
    res.status(500).json({ error: 'Reset failed' });
  }
});

export default router;
