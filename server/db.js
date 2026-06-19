import Database from 'better-sqlite3'

const DB_PATH = process.env.DB_PATH || './data.db'

const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     TEXT    NOT NULL,
    description TEXT    NOT NULL,
    person      TEXT    NOT NULL DEFAULT '',
    tracker     TEXT    NOT NULL,
    asked_date  TEXT    NOT NULL,
    due_date    TEXT,
    is_done     INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_requests_user_tracker ON requests(user_id, tracker);

  CREATE TABLE IF NOT EXISTS trackers (
    user_id TEXT NOT NULL,
    name    TEXT NOT NULL,
    PRIMARY KEY (user_id, name)
  );
`)

const DEFAULT_TRACKERS = ['Personal', 'Work']

// Server-local YYYY-MM-DD (mirrors frontend dateUtils.today()/formatDate).
function today() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function rowToItem(row) {
  return {
    id: row.id,
    description: row.description,
    person: row.person,
    tracker: row.tracker,
    askedDate: row.asked_date,
    dueDate: row.due_date || null,
    isDone: row.is_done === 1,
  }
}

// --- trackers ---

export function listTrackers(userId) {
  const rows = db.prepare('SELECT name FROM trackers WHERE user_id = ? ORDER BY rowid').all(userId)
  if (rows.length === 0) {
    const insert = db.prepare('INSERT INTO trackers (user_id, name) VALUES (?, ?)')
    const seed = db.transaction(() => DEFAULT_TRACKERS.forEach(name => insert.run(userId, name)))
    seed()
    return [...DEFAULT_TRACKERS]
  }
  return rows.map(r => r.name)
}

export function addTracker(userId, name) {
  db.prepare('INSERT OR IGNORE INTO trackers (user_id, name) VALUES (?, ?)').run(userId, name)
  return listTrackers(userId)
}

export function removeTracker(userId, name) {
  db.prepare('DELETE FROM trackers WHERE user_id = ? AND name = ?').run(userId, name)
  return listTrackers(userId)
}

// --- requests ---

export function listRequests(userId, tracker, filter = 'open') {
  let where = 'user_id = ? AND tracker = ?'
  const params = [userId, tracker]
  if (filter === 'open') where += ' AND is_done = 0'
  else if (filter === 'closed') where += ' AND is_done = 1'
  const rows = db
    .prepare(`SELECT * FROM requests WHERE ${where} ORDER BY due_date IS NULL, due_date`)
    .all(...params)
  return rows.map(rowToItem)
}

export function createRequest(userId, { description, person, tracker, dueDate }) {
  const info = db
    .prepare(
      `INSERT INTO requests (user_id, description, person, tracker, asked_date, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(userId, description, person || '', tracker, today(), dueDate || null)
  const row = db.prepare('SELECT * FROM requests WHERE id = ?').get(info.lastInsertRowid)
  return rowToItem(row)
}

export function updateRequest(userId, id, updates) {
  const sets = []
  const params = []
  if (updates.description !== undefined) { sets.push('description = ?'); params.push(updates.description) }
  if (updates.person !== undefined) { sets.push('person = ?'); params.push(updates.person) }
  if (updates.dueDate !== undefined) { sets.push('due_date = ?'); params.push(updates.dueDate || null) }
  if (updates.isDone !== undefined) { sets.push('is_done = ?'); params.push(updates.isDone ? 1 : 0) }

  if (sets.length > 0) {
    params.push(userId, id)
    db.prepare(`UPDATE requests SET ${sets.join(', ')} WHERE user_id = ? AND id = ?`).run(...params)
  }
  const row = db.prepare('SELECT * FROM requests WHERE user_id = ? AND id = ?').get(userId, id)
  return row ? rowToItem(row) : null
}
