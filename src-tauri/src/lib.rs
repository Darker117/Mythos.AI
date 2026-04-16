use tauri_plugin_sql::{Migration, MigrationKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let migrations = vec![
    Migration {
      version: 1,
      description: "initial schema",
      sql: "
        CREATE TABLE IF NOT EXISTS adventures (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          genre TEXT NOT NULL DEFAULT '',
          description TEXT NOT NULL DEFAULT '',
          setting TEXT NOT NULL DEFAULT '',
          system_prompt TEXT NOT NULL DEFAULT '',
          memory TEXT NOT NULL DEFAULT '',
          plot_json TEXT NOT NULL DEFAULT '{}',
          tags_json TEXT NOT NULL DEFAULT '[]',
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          adventure_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          input_mode TEXT,
          timestamp INTEGER NOT NULL,
          seq INTEGER NOT NULL,
          FOREIGN KEY (adventure_id) REFERENCES adventures(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_messages_adv ON messages(adventure_id, seq);

        CREATE TABLE IF NOT EXISTS story_cards (
          id TEXT PRIMARY KEY,
          adventure_id TEXT NOT NULL,
          trigger TEXT NOT NULL,
          content TEXT NOT NULL,
          type TEXT NOT NULL,
          name TEXT NOT NULL,
          notes TEXT NOT NULL DEFAULT '',
          enabled INTEGER NOT NULL DEFAULT 1,
          FOREIGN KEY (adventure_id) REFERENCES adventures(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_cards_adv ON story_cards(adventure_id);

        CREATE TABLE IF NOT EXISTS kv (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      ",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 2,
      description: "add world state, events, and summarization tracking",
      sql: "
        ALTER TABLE adventures ADD COLUMN world_state_json TEXT NOT NULL DEFAULT '{}';
        ALTER TABLE adventures ADD COLUMN events_json TEXT NOT NULL DEFAULT '[]';
        ALTER TABLE adventures ADD COLUMN summarized_up_to INTEGER NOT NULL DEFAULT 0;
      ",
      kind: MigrationKind::Up,
    },
  ];

  tauri::Builder::default()
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:mythos.db", migrations)
        .build(),
    )
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
