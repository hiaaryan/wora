import { and, eq, ilike, like, sql } from "drizzle-orm";
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

export const getLibraryStats = async () => {
  const songCount = await db.select({ count: sql`count(*)` }).from(songs);
  const albumCount = await db.select({ count: sql`count(*)` }).from(albums);
  const playlistCount = await db
    .select({ count: sql`count(*)` })
    .from(playlists);

  return {
    songs: songCount[0].count,
    albums: albumCount[0].count,
    playlists: playlistCount[0].count,
  };
};

export const getSettings = async () => {
  const throwSettings = await db.select().from(settings).limit(1);
  return throwSettings[0];
};

export const updateSettings = async (data: any) => {
  const currentSettings = await db.select().from(settings);

  if (currentSettings[0].profilePicture) {
    try {
      fs.unlinkSync(currentSettings[0].profilePicture);
    } catch (error) {
      console.error("Error deleting old profile picture:", error);
    }
  }

  const update = await db.update(settings).set({
    name: data.name,
    profilePicture: data.profilePicture,
  });

  return true;
};

export const getSongs = async () => {
  return await db.select().from(songs).orderBy(songs.name);
};

export const getAlbums = async (page: number, limit: number = 15) => {
  return await db
    .select()
    .from(albums)
    .orderBy(albums.name)
    .limit(limit)
    .offset((page - 1) * limit);
};

export const getPlaylists = async () => {
  return await db.select().from(playlists);
};

export const getAlbumsWithSongs = async () => {
  const albumsWithSongs = await db.query.albums.findMany({
    with: { songs: true },
  });

  return { albumsWithSongs };
};

export const getPlaylistWithSongs = async (id: number) => {
  const playlistWithSongs = await db.query.playlists.findFirst({
    where: eq(playlists.id, id),
    with: {
      songs: {
        with: {
          song: {
            with: { album: true },
          },
        },
      },
    },
  });

  return {
    ...playlistWithSongs,
    songs: playlistWithSongs.songs.map((playlistSong) => ({
      ...playlistSong.song,
      album: playlistSong.song.album,
    })),
  };
};

export const getAlbumWithSongs = async (id: number) => {
  const albumWithSongs = await db.query.albums.findFirst({
    where: eq(albums.id, id),
    with: {
      songs: {
        with: { album: true },
      },
    },
  });

  return albumWithSongs;
};

export const getAlbumSongs = async (id: number) => {
  const album = await db.query.albums.findFirst({
    where: eq(albums.id, id),
    with: { songs: true },
  });

  return { album };
};

export const isSongFavorite = async (file: string) => {
  const song = await db.query.songs.findFirst({
    where: eq(songs.filePath, file),
  });

  const isFavourite = await db.query.playlistSongs.findFirst({
    where: and(
      eq(playlistSongs.playlistId, 1),
      eq(playlistSongs.songId, song.id),
    ),
  });

  if (isFavourite) {
    return true;
  } else {
    return false;
  }
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

export const searchDB = async (query: string) => {
  const lowerSearch = query.toLowerCase();

  const searchAlbums = await db.query.albums.findMany({
    where: like(albums.name, `%${lowerSearch}%`),
    limit: 5,
  });

  const searchPlaylists = await db.query.playlists.findMany({
    where: like(playlists.name, `%${lowerSearch}%`),
    limit: 5,
  });

  const searchSongs = await db.query.songs.findMany({
    where: like(songs.name, `%${lowerSearch}%`),
    with: {
      album: {
        columns: {
          id: true,
          coverArt: true,
        },
      },
    },
    limit: 5,
  });

  return {
    searchAlbums,
    searchPlaylists,
    searchSongs,
  };
};

export const createPlaylist = async (data: any) => {
  let description: string;
  let coverArt: string;

  if (data.description) {
    description = data.description;
  } else {
    description = "An epic playlist created by you.";
  }

  if (data.coverArt) {
    coverArt = data.coverArt;
  } else {
    coverArt = null;
  }

  const playlist = await db.insert(playlists).values({
    name: data.name,
    description: description,
    coverArt: coverArt,
  });

  return playlist;
};

export const updatePlaylist = async (data: any) => {
  let description: string;
  let coverArt: string;

  if (data.data.description) {
    description = data.data.description;
  } else {
    description = "An epic playlist created by you.";
  }

  if (data.coverArt) {
    coverArt = data.data.coverArt;
  } else {
    coverArt = "/coverArt.png";
  }

  console.log(data);

  const playlist = await db
    .update(playlists)
    .set({
      name: data.data.name,
      description: description,
      coverArt: coverArt,
    })
    .where(eq(playlists.id, data.id));

  return playlist;
};

export const addSongToPlaylist = async (playlistId: number, songId: number) => {
  const checkIfExists = await db.query.playlistSongs.findFirst({
    where: and(
      eq(playlistSongs.playlistId, playlistId),
      eq(playlistSongs.songId, songId),
    ),
  });

  if (checkIfExists) {
    return false;
  }

  const playlistSong = await db.insert(playlistSongs).values({
    playlistId,
    songId,
  });

  return true;
};

export const removeSongFromPlaylist = async (
  playlistId: number,
  songId: number,
) => {
  const playlistSong = await db
    .delete(playlistSongs)
    .where(
      and(
        eq(playlistSongs.playlistId, playlistId),
        eq(playlistSongs.songId, songId),
      ),
    );

  return true;
};

export const getRandomLibraryItems = async () => {
  const randomAlbums = await db
    .select()
    .from(albums)
    .orderBy(sql`RANDOM()`)
    .limit(10);

  const randomSongs = await db.query.songs.findMany({
    with: { album: true },
    limit: 10,
    orderBy: sql`RANDOM()`,
  });

  return {
    albums: randomAlbums,
    songs: randomSongs,
  };
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

const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"];

function findFirstImageInDirectory(dir: string): string | null {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (
      stat.isFile() &&
      imageExtensions.includes(path.extname(file).toLowerCase())
    ) {
      return filePath;
    }
  }

  return null;
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

    const albumFolder = path.dirname(file);

    const albumImage = findFirstImageInDirectory(albumFolder);

    let art: string;

    if (albumImage) {
      const imageData = fs.readFileSync(albumImage);
      const imageExt = path.extname(albumImage).slice(1);
      art = `data:image/${imageExt};base64,${imageData.toString("base64")}`;
    } else {
      // If no image is found, fall back to the current method
      const coverArt = selectCover(metadata.common.picture);
      art = coverArt
        ? `data:${coverArt.format};base64,${coverArt.data.toString("base64")}`
        : "/coverArt.png";
    }

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
      coverArt: null,
      description: "Songs liked by you.",
    });
  }

  const getSettings = await db
    .select()
    .from(settings)
    .where(eq(settings.id, 1));

  if (getSettings[0]) {
    await db
      .update(settings)
      .set({
        musicFolder,
      })
      .where(eq(settings.id, 1));
    return;
  } else {
    await db.insert(settings).values({
      musicFolder,
    });
  }
};
