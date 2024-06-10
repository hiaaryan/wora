import Database from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

const sqlite = new Database("resources/wora.db");
export const db: BetterSQLite3Database = drizzle(sqlite);

export const initDatabase = () => {
  sqlite.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        fullName TEXT,
        profilePicture TEXT,
        musicFolder TEXT
      );
      CREATE TABLE IF NOT EXISTS musicFiles (
        id INTEGER PRIMARY KEY,
        filePath TEXT
      );
  `);
};

export const settings = sqliteTable("settings", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  fullName: text("fullName"),
  profilePicture: text("profilePicture"),
  musicFolder: text("musicFolder"),
});
