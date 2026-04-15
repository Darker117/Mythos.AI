import Database from "@tauri-apps/plugin-sql";

let _db: Database | null = null;
let _loading: Promise<Database> | null = null;

/**
 * Returns a singleton SQLite connection.
 * The DB file lives in the OS app-data dir (e.g. %APPDATA%\com.mythos.ai\mythos.db on Windows).
 * Schema migrations are registered in Rust — see src-tauri/src/lib.rs.
 */
export async function getDb(): Promise<Database> {
  if (_db) return _db;
  if (_loading) return _loading;
  _loading = Database.load("sqlite:mythos.db").then((db) => {
    _db = db;
    return db;
  });
  return _loading;
}

/**
 * Fire-and-forget DB write. Logs errors but never throws —
 * the UI is already updated optimistically in zustand, so a DB
 * failure shouldn't crash the session.
 */
export function queueWrite(fn: (db: Database) => Promise<unknown>): void {
  getDb()
    .then(fn)
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("[db] write failed:", err);
    });
}
