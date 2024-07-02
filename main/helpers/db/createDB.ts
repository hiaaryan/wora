import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

export const sqlite = new Database(
  path.join(app.getPath("userData"), "wora.db"),
);

export const initDatabase = () => {
  sqlite.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        name TEXT,
        profilePicture TEXT,
        musicFolder TEXT
      );
      CREATE TABLE IF NOT EXISTS albums (
        id INTEGER PRIMARY KEY,
        name TEXT,
        artist TEXT,
        year INTEGER,
        coverArt BLOB
      );
      CREATE TABLE IF NOT EXISTS songs (
        id INTEGER PRIMARY KEY,
        filePath TEXT,
        name TEXT,
        artist TEXT,
        duration INTEGER,
        albumId INTEGER,
        FOREIGN KEY (albumId) REFERENCES albums(id)
      );
      CREATE TABLE IF NOT EXISTS playlists (
        id INTEGER PRIMARY KEY,
        name TEXT,
        description TEXT,
        coverArt BLOB
      );
      CREATE TABLE IF NOT EXISTS playlistSongs (
        playlistId INTEGER,
        songId INTEGER,
        FOREIGN KEY (playlistId) REFERENCES playlists(id),
        Foreign KEY (songId) REFERENCES songs(id)
      );
  `);
};
