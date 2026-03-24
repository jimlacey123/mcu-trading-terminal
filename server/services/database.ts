import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'trading.db');

// Ensure directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    callsign      TEXT    UNIQUE NOT NULL COLLATE NOCASE,
    cash_balance  REAL    NOT NULL DEFAULT 1000000.00,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS positions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id      INTEGER NOT NULL,
    instrument      TEXT    NOT NULL,
    direction       TEXT    NOT NULL CHECK(direction IN ('LONG','SHORT')),
    contracts       REAL    NOT NULL,
    entry_price     REAL    NOT NULL,
    notional_value  REAL    NOT NULL,
    margin_held     REAL    NOT NULL,
    opened_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS trades (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id    INTEGER NOT NULL,
    instrument    TEXT    NOT NULL,
    direction     TEXT    NOT NULL,
    contracts     REAL    NOT NULL,
    entry_price   REAL    NOT NULL,
    exit_price    REAL    NOT NULL,
    realized_pnl  REAL    NOT NULL,
    opened_at     DATETIME NOT NULL,
    closed_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(student_id) REFERENCES students(id)
  );

  CREATE TABLE IF NOT EXISTS resets (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    scope         TEXT    NOT NULL,
    callsign      TEXT,
    reset_at      DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log(`[DB] SQLite database initialized at ${DB_PATH}`);

// Prepared statements
const stmts = {
  getStudentByCallsign: db.prepare('SELECT * FROM students WHERE callsign = ? COLLATE NOCASE'),
  getStudentById: db.prepare('SELECT * FROM students WHERE id = ?'),
  createStudent: db.prepare('INSERT INTO students (callsign) VALUES (?)'),
  updateLastActive: db.prepare('UPDATE students SET last_active = CURRENT_TIMESTAMP WHERE id = ?'),
  updateCashBalance: db.prepare('UPDATE students SET cash_balance = ? WHERE id = ?'),

  getPositionsByStudent: db.prepare('SELECT * FROM positions WHERE student_id = ?'),
  getPositionById: db.prepare('SELECT * FROM positions WHERE id = ?'),
  createPosition: db.prepare(
    `INSERT INTO positions (student_id, instrument, direction, contracts, entry_price, notional_value, margin_held)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ),
  deletePosition: db.prepare('DELETE FROM positions WHERE id = ?'),
  deletePositionsByStudent: db.prepare('DELETE FROM positions WHERE student_id = ?'),

  createTrade: db.prepare(
    `INSERT INTO trades (student_id, instrument, direction, contracts, entry_price, exit_price, realized_pnl, opened_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ),
  getTradesByStudent: db.prepare(
    'SELECT * FROM trades WHERE student_id = ? ORDER BY closed_at DESC LIMIT ?'
  ),
  deleteTradesByStudent: db.prepare('DELETE FROM trades WHERE student_id = ?'),
  getRecentTrades: db.prepare(
    `SELECT t.*, s.callsign FROM trades t
     JOIN students s ON t.student_id = s.id
     ORDER BY t.closed_at DESC LIMIT ?`
  ),

  getAllStudents: db.prepare('SELECT * FROM students ORDER BY callsign'),
  getTradeCountByStudent: db.prepare(
    'SELECT student_id, COUNT(*) as count FROM trades GROUP BY student_id'
  ),
  getBestTradeByStudent: db.prepare(
    'SELECT student_id, MAX(realized_pnl) as best FROM trades GROUP BY student_id'
  ),
  getTotalTradeCount: db.prepare('SELECT COUNT(*) as count FROM trades'),
  getMostTraded: db.prepare(
    `SELECT instrument, COUNT(*) as cnt FROM trades
     GROUP BY instrument ORDER BY cnt DESC LIMIT 1`
  ),
  getLargestGain: db.prepare('SELECT MAX(realized_pnl) as val FROM trades'),
  getLargestLoss: db.prepare('SELECT MIN(realized_pnl) as val FROM trades'),
  getActiveToday: db.prepare(
    `SELECT COUNT(*) as count FROM students
     WHERE date(last_active) = date('now')`
  ),

  logReset: db.prepare('INSERT INTO resets (scope, callsign) VALUES (?, ?)'),
};

export function getStudentByCallsign(callsign: string) {
  return stmts.getStudentByCallsign.get(callsign) as any;
}

export function getStudentById(id: number) {
  return stmts.getStudentById.get(id) as any;
}

export function createStudent(callsign: string) {
  const result = stmts.createStudent.run(callsign);
  return stmts.getStudentById.get(result.lastInsertRowid) as any;
}

export function updateLastActive(studentId: number) {
  stmts.updateLastActive.run(studentId);
}

export function updateCashBalance(studentId: number, balance: number) {
  stmts.updateCashBalance.run(balance, studentId);
}

export function getPositionsByStudent(studentId: number) {
  return stmts.getPositionsByStudent.all(studentId) as any[];
}

export function getPositionById(positionId: number) {
  return stmts.getPositionById.get(positionId) as any;
}

export function createPosition(
  studentId: number,
  instrument: string,
  direction: string,
  contracts: number,
  entryPrice: number,
  notionalValue: number,
  marginHeld: number
) {
  const result = stmts.createPosition.run(
    studentId, instrument, direction, contracts, entryPrice, notionalValue, marginHeld
  );
  return stmts.getPositionById.get(result.lastInsertRowid) as any;
}

export function deletePosition(positionId: number) {
  stmts.deletePosition.run(positionId);
}

export function createTrade(
  studentId: number,
  instrument: string,
  direction: string,
  contracts: number,
  entryPrice: number,
  exitPrice: number,
  realizedPnl: number,
  openedAt: string
) {
  const result = stmts.createTrade.run(
    studentId, instrument, direction, contracts, entryPrice, exitPrice, realizedPnl, openedAt
  );
  return result.lastInsertRowid;
}

export function getTradesByStudent(studentId: number, limit = 100) {
  return stmts.getTradesByStudent.all(studentId, limit) as any[];
}

export function getRecentTrades(limit = 50) {
  return stmts.getRecentTrades.all(limit) as any[];
}

export function getAllStudents() {
  return stmts.getAllStudents.all() as any[];
}

export function getTradeCountMap(): Map<number, number> {
  const rows = stmts.getTradeCountByStudent.all() as any[];
  const map = new Map<number, number>();
  for (const r of rows) map.set(r.student_id, r.count);
  return map;
}

export function getBestTradeMap(): Map<number, number> {
  const rows = stmts.getBestTradeByStudent.all() as any[];
  const map = new Map<number, number>();
  for (const r of rows) map.set(r.student_id, r.best);
  return map;
}

export function getProfessorStats() {
  const students = getAllStudents();
  const totalTrades = (stmts.getTotalTradeCount.get() as any)?.count || 0;
  const mostTraded = stmts.getMostTraded.get() as any;
  const largestGain = (stmts.getLargestGain.get() as any)?.val || 0;
  const largestLoss = (stmts.getLargestLoss.get() as any)?.val || 0;
  const activeToday = (stmts.getActiveToday.get() as any)?.count || 0;

  return {
    totalStudents: students.length,
    activeToday,
    totalTrades,
    mostTradedInstrument: mostTraded?.instrument || 'N/A',
    largestGain,
    largestLoss,
  };
}

export function resetStudent(studentId: number) {
  const student = getStudentById(studentId);
  if (!student) return false;

  const resetTx = db.transaction(() => {
    stmts.deletePositionsByStudent.run(studentId);
    stmts.deleteTradesByStudent.run(studentId);
    stmts.updateCashBalance.run(1000000.00, studentId);
    stmts.logReset.run('individual', student.callsign);
  });
  resetTx();
  return true;
}

export function resetAllStudents() {
  const students = getAllStudents();
  const resetAllTx = db.transaction(() => {
    for (const s of students) {
      stmts.deletePositionsByStudent.run(s.id);
      stmts.deleteTradesByStudent.run(s.id);
      stmts.updateCashBalance.run(1000000.00, s.id);
    }
    stmts.logReset.run('all', null);
  });
  resetAllTx();
  return true;
}

export default db;
