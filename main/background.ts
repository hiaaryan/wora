import path from "path";
import { app, dialog, globalShortcut, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import fs from "fs";
import { protocol, net } from "electron";
import { createNowPlayingWindow, createTray } from "./helpers/create-tray";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
let client = new (require("discord-rpc-revamp").Client)();

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

protocol.registerSchemesAsPrivileged([
  {
    scheme: "music",
    privileges: {
      secure: true,
      allowServiceWorkers: true,
      supportFetchAPI: true,
      bypassCSP: true,
      stream: true,
    },
  },
]);

(async () => {
  await app.whenReady();

  protocol.handle("music", (request) => {
    return net.fetch("file://" + request.url.slice("music://".length));
  });

  const mainWindow = createWindow("main", {
    width: 1500,
    height: 900,
    frame: false,
    transparent: true,
    icon: path.join(__dirname, "resources/icon.icns"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
    },
  });

  mainWindow.setMinimumSize(1500, 900);
  mainWindow.setTitle("Wora");

  ipcMain.on("closeApp", () => {
    mainWindow.close();
  });

  ipcMain.on("minimizeApp", () => {
    mainWindow.minimize();
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
  }

  createTray();
  createNowPlayingWindow();

  ipcMain.on("tray-command", (_, data) => {
    mainWindow.webContents.send("player-command", data);
  });
})();

client.connect({ clientId: "1243707416588320800" }).catch(console.error);

ipcMain.on("set-rpc-state", (_, { details, state }) => {
  client
    .setActivity({
      details,
      state,
      largeImageKey: "logo",
      largeImageText: `v${app.getVersion()}`,
    })
    .catch((error: any) => {
      console.log(error.message);
    });
});

app.on("window-all-closed", () => {
  app.quit();
});

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

const callFiles = async (dirPath: string) => {
  return readFilesRecursively(dirPath);
};

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

ipcMain.on("openDialog", () => {
  dialog
    .showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
    })
    .then((result) => {
      console.log(callFiles(result.filePaths[0]));
    })
    .catch((err) => {
      console.log(err);
    });
});
