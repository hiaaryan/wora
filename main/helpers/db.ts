import Database from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { integer, sqliteTable, text, blob } from "drizzle-orm/sqlite-core";
import { app } from "electron";
import path from "path";

const sqlite = new Database(path.join(app.getPath("userData"), "wora.db"));
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
        filePath TEXT,
        name TEXT,
        artist TEXT,
        album TEXT,
        coverArt BLOB
      );
  `);
};

export const settings = sqliteTable("settings", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  fullName: text("fullName"),
  profilePicture: text("profilePicture"),
  musicFolder: text("musicFolder"),
});

export const musicFiles = sqliteTable("musicFiles", {
  id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  filePath: text("filePath"),
  name: text("name"),
  artist: text("artist"),
  album: text("album"),
  coverArt: blob("coverArt"),
});
