import { db, musicFiles, settings } from "./db";
import fs from "fs";
import { parseFile, selectCover } from "music-metadata";
import path from "path";

export const initializeUser = (
  fullName: string,
  profilePicture: string,
  musicFolder: string,
) => {
  db.insert(settings).values({ fullName, profilePicture, musicFolder });
};

export const getSettings = async () => {
  return db.select().from(settings).limit(1);
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
  const files = readFilesRecursively(musicFolder);
  await db.delete(musicFiles);

  files.forEach(async (file: any) => {
    const metadata = await parseFile(file, {
      skipPostHeaders: true,
    });

    const coverArt = selectCover(metadata.common.picture);

    const art = coverArt
      ? `data:${coverArt.format};base64,${coverArt.data.toString("base64")}`
      : "/coverArt.png";

    await db.insert(musicFiles).values({
      filePath: file,
      name: metadata.common.title,
      artist: metadata.common.artist,
      album: metadata.common.album,
      coverArt: art,
    });
  });

  await db.delete(settings);

  await db.insert(settings).values({
    fullName: "Aaryan Kapoor",
    profilePicture: "/ak.jpeg",
    musicFolder,
  });
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
