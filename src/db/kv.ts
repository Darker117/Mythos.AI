import { getDb, queueWrite } from "./index";

interface KvRow {
  key: string;
  value: string;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const db = await getDb();
  const rows = await db.select<KvRow[]>("SELECT value FROM kv WHERE key = $1", [key]);
  if (rows.length === 0) return null;
  try {
    return JSON.parse(rows[0]!.value) as T;
  } catch {
    return null;
  }
}

export function kvSet<T>(key: string, value: T): void {
  const json = JSON.stringify(value);
  queueWrite(async (db) => {
    await db.execute(
      `INSERT INTO kv (key, value) VALUES ($1, $2)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      [key, json],
    );
  });
}
