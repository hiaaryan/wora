import { and, eq } from "drizzle-orm";
import { albums, songs, settings, playlistSongs, playlists } from "./schema";
import fs from "fs";
import { parseFile, selectCover } from "music-metadata";
import path from "path";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { sqlite } from "./createDB";

const db: BetterSQLite3Database<typeof schema> = drizzle(sqlite, {
  schema,
});

export const getSettings = async () => {
  return db.select().from(settings).limit(1);
};

export const getSongs = async () => {
  return await db.select().from(songs).orderBy(songs.name);
};

export const getAlbums = async () => {
  return await db.select().from(albums).orderBy(albums.name);
};

export const getAlbumsWithSongs = async () => {
  const albumsWithSongs = await db.query.albums.findMany({
    with: { songs: true },
  });

  return { albumsWithSongs };
};

export const getAlbumWithSongs = async (id: number) => {
  const albumWithSongs = await db.query.albums.findFirst({
    where: eq(albums.id, id),
    with: { songs: true },
  });

  return { albumWithSongs };
};

export const addToFavourites = async (songId: number) => {
  // @hiaaryan: Check if Song Exists in Liked Songs
  const existingEntry = await db
    .select()
    .from(playlistSongs)
    .where(
      and(eq(playlistSongs.playlistId, 1), eq(playlistSongs.songId, songId)),
    );

  if (!existingEntry[0]) {
    // Add the song to the "Liked Songs" playlist
    await db.insert(playlistSongs).values({
      playlistId: 1,
      songId,
    });
  } else {
    // Remove the song from the "Liked Songs" playlist
    await db
      .delete(playlistSongs)
      .where(
        and(eq(playlistSongs.playlistId, 1), eq(playlistSongs.songId, songId)),
      );
  }
};

export const getAlbumSongs = async (id: number) => {
  const album = await db.query.albums.findFirst({
    where: eq(albums.id, id),
    with: { songs: true },
  });

  return { album };
};

const audioExtensions = [
  ".mp3",
  ".mpeg",
  ".opus",
  ".ogg",
  ".oga",
  ".wav",
  ".aac",
  ".caf",
  ".m4a",
  ".m4b",
  ".mp4",
  ".weba",
  ".webm",
  ".dolby",
  ".flac",
];

function readFilesRecursively(dir: string): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(readFilesRecursively(filePath));
    } else if (audioExtensions.includes(path.extname(filePath).toLowerCase())) {
      results.push(filePath);
    }
  });
  return results;
}

export const initializeData = async (musicFolder: string) => {
  const currentFiles = readFilesRecursively(musicFolder);
  const dbFiles = await db.select().from(songs);

  // @hiaaryan: Detect Deleted Files
  const deletedFiles = dbFiles.filter(
    (dbFile) => !currentFiles.includes(dbFile.filePath),
  );
  for (const file of deletedFiles) {
    await db.transaction(async (tx) => {
      await tx.delete(playlistSongs).where(eq(playlistSongs.songId, file.id));
      await tx.delete(songs).where(eq(songs.filePath, file.filePath));
    });
  }

  // @hiaaryan: Detect New or Updated Files
  for (const file of currentFiles) {
    const dbFile = dbFiles.find((dbFile) => dbFile.filePath === file);
    const metadata = await parseFile(file, {
      skipPostHeaders: true,
    });
    const coverArt = selectCover(metadata.common.picture);
    const art = coverArt
      ? `data:${coverArt.format};base64,${coverArt.data.toString("base64")}`
      : "/coverArt.png";

    let albumsFound = await db
      .select()
      .from(albums)
      .where(eq(albums.name, metadata.common.album));

    let album: any = albumsFound[0];

    if (!album) {
      // @hiaaryan: Create New Album
      const [newAlbumId] = (await db
        .insert(albums)
        .values({
          name: metadata.common.album,
          artist:
            metadata.common.albumartist ||
            metadata.common.artist ||
            "Various Artists",
          year: metadata.common.year,
          coverArt: art,
        })
        .returning({ id: albums.id })) as { id: number }[];

      album = { id: newAlbumId.id, name: metadata.common.album, coverArt: art };
    } else {
      // @hiaaryan: Update Album if Artist or CoverArt is different
      if (
        album.artist !==
          (metadata.common.albumartist || metadata.common.artist) ||
        album.year !== metadata.common.year ||
        album.coverArt !== art
      ) {
        await db
          .update(albums)
          .set({
            artist:
              metadata.common.albumartist ||
              metadata.common.artist ||
              "Various Artists",
            year: metadata.common.year,
            coverArt: art,
          })
          .where(eq(albums.id, album.id));
      }
    }

    if (!dbFile) {
      // @hiaaryan: Add New File
      await db.insert(songs).values({
        filePath: file,
        name: metadata.common.title,
        artist: metadata.common.artist,
        duration: Math.round(metadata.format.duration),
        albumId: album.id,
      });
    } else if (
      dbFile.name !== metadata.common.title ||
      dbFile.artist !== metadata.common.artist ||
      dbFile.duration !== Math.round(metadata.format.duration) ||
      dbFile.albumId !== album.id
    ) {
      // @hiaaryan: Update File
      await db
        .update(songs)
        .set({
          name: metadata.common.title,
          artist: metadata.common.artist,
          duration: Math.round(metadata.format.duration),
          albumId: album.id,
        })
        .where(eq(songs.filePath, file));
    }
  }

  // @hiaryan: Detect Empty Albums
  const allAlbums = await db.select().from(albums);
  for (const album of allAlbums) {
    const songsInAlbum = await db
      .select()
      .from(songs)
      .where(eq(songs.albumId, album.id));
    if (songsInAlbum.length === 0) {
      await db.delete(albums).where(eq(albums.id, album.id));
    }
  }

  // @hiaaryan: Create Default Playlist
  const defaultPlaylist = await db
    .select()
    .from(playlists)
    .where(eq(playlists.id, 1));
  if (!defaultPlaylist[0]) {
    await db.insert(playlists).values({
      name: "Favourites",
      coverArt: "/coverArt.png",
      description: "Songs Liked by You 🎧",
    });
  }

  await db.delete(settings);
  await db.insert(settings).values({
    fullName: "Aaryan Kapoor",
    profilePicture: "/ak.jpeg",
    musicFolder,
  });
};
