import { eq } from "drizzle-orm";
import { albums, db, musicFiles, settings } from "./db";
import fs from "fs";
import { parseFile, selectCover } from "music-metadata";
import path from "path";

export const getSettings = async () => {
  return db.select().from(settings).limit(1);
};

export const getAlbums = async () => {
  return await db.select().from(albums);
};

export const getAlbumSongs = async (id: number) => {
  const album = await db.select().from(albums).where(eq(albums.id, id));
  const songs = await db
    .select()
    .from(musicFiles)
    .where(eq(musicFiles.albumId, id));

  return {
    album,
    songs,
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

export const initializeData = async (musicFolder: any) => {
  await db.delete(musicFiles);
  await db.delete(albums);

  const files = readFilesRecursively(musicFolder);

  for (const file of files) {
    const metadata = await parseFile(file, {
      skipPostHeaders: true,
    });

    const coverArt = selectCover(metadata.common.picture);

    const art = coverArt
      ? `data:${coverArt.format};base64,${coverArt.data.toString("base64")}`
      : "/coverArt.png";

    let albumsFound: any = await db
      .select()
      .from(albums)
      .where(eq(albums.name, metadata.common.album));

    let album: any | undefined = albumsFound[0];

    if (!album) {
      const [newAlbumId] = (await db
        .insert(albums)
        .values({
          name: metadata.common.album,
          artist:
            metadata.common.albumartist ||
            metadata.common.artist ||
            "Various Artists",
          coverArt: art,
        })
        .returning({ id: albums.id })) as { id: number }[];

      album = { id: newAlbumId.id, name: metadata.common.album, coverArt: art };
    }

    await db.insert(musicFiles).values({
      filePath: file,
      name: metadata.common.title,
      artist: metadata.common.artist,
      albumId: album.id,
    });
  }
};

// const getMusicFiles = (userId) => {
//   return db.select(musicFiles).where({ userId });
// };

// const checkForFileChanges = (musicFolder, userId) => {
//   const dbFiles = db
//     .select(musicFiles)
//     .where({ userId })
//     .map((file) => file.filePath);
//   const folderFiles = fs
//     .readdirSync(musicFolder)
//     .filter((file) => file.endsWith(".mp3"))
//     .map((file) => path.join(musicFolder, file));

//   const newFiles = folderFiles.filter((file) => !dbFiles.includes(file));
//   const missingFiles = dbFiles.filter((file) => !folderFiles.includes(file));

//   newFiles.forEach((file) => db.insert(musicFiles, { filePath: file, userId }));
//   missingFiles.forEach((file) =>
//     db.delete(musicFiles).where({ filePath: file }),
//   );

//   return { newFiles, missingFiles };
// };
