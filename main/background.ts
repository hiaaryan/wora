import path from "path";
import { Menu, Tray, app, dialog, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { protocol } from "electron";
import { AutoClient } from "discord-auto-rpc";
import {
  addToFavourites,
  getAlbumSongs,
  getAlbumWithSongs,
  getAlbums,
  getAlbumsWithSongs,
  getPlaylistWithSongs,
  getPlaylists,
  getSettings,
  getSongs,
  initializeData,
  isSongFavorite,
  searchDB,
} from "./helpers/db/connectDB";
import { initDatabase } from "./helpers/db/createDB";
import { parseFile, selectCover } from "music-metadata";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

// @hiaaryan: Allow Streaming Music Files on Custom Protocol
protocol.registerSchemesAsPrivileged([
  {
    scheme: "music",
    privileges: {
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

let settings: any;

// @hiaaryan: Initialize Database on Startup
(async () => {
  initDatabase();
  settings = await getSettings();

  if (settings[0]) {
    await initializeData(settings[0].musicFolder);
  }
})();

(async () => {
  await app.whenReady();

  // @hiaaryan: Using Depreciated API [Seeking Not Supported with Newer API]
  protocol.registerFileProtocol("music", (request, callback) => {
    const url = request.url.replace("music://", "");
    callback({ path: url });
  });

  const mainWindow = createWindow("main", {
    width: 1500,
    height: 900,
    titleBarStyle: "hidden",
    transparent: true,
    trafficLightPosition: { x: 20, y: 15 },
    icon: path.join(__dirname, "resources/icon.icns"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
    },
  });

  mainWindow.setMinimumSize(1500, 900);
  mainWindow.setTitle("Wora");

  if (settings[0]) {
    if (isProd) {
      await mainWindow.loadURL("app://./home");
    } else {
      const port = process.argv[2];
      await mainWindow.loadURL(`http://localhost:${port}/home`);
    }
  } else {
    if (isProd) {
      await mainWindow.loadURL("app://./setup");
    } else {
      const port = process.argv[2];
      await mainWindow.loadURL(`http://localhost:${port}/setup`);
    }
  }
})();

// @hiaaryan: Initialize Discord RPC
const client = new AutoClient({ transport: "ipc" });
ipcMain.on("set-rpc-state", (_, { details, state, timestamp }) => {
  const setActivity = () => {
    const activity = {
      details,
      state,
      largeImageKey: "logo",
      largeImageText: `v${app.getVersion()}`,
      instance: false,
    };

    if (timestamp) {
      (activity as any).startTimestamp = Date.now();
    }

    client.setActivity(activity);
  };
  setActivity();
});
client.endlessLogin({ clientId: "1243707416588320800" });

// @hiaaryan: Called to Set Music Folder
ipcMain.handle("setMusicFolder", async () => {
  const diag = await dialog
    .showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
    })
    .then(async (result) => {
      if (result.canceled) {
        return result;
      }

      await initializeData(result.filePaths[0]);
    })
    .catch((err) => {
      console.log(err);
    });

  return diag;
});

// @hiaaryan: Set Tray for Wora
let tray = null;
app.whenReady().then(() => {
  tray = new Tray("./resources/TrayTemplate.png");
  const contextMenu = Menu.buildFromTemplate([
    { label: "About", type: "normal", role: "about" },
    {
      label: "Quit",
      type: "normal",
      role: "quit",
      accelerator: "Cmd+Q",
    },
  ]);
  tray.setToolTip("Wora");
  tray.setContextMenu(contextMenu);
});

// @hiaaryan: IPC Handlers from Renderer
ipcMain.handle("getAllAlbums", async () => {
  const albums = await getAlbums();
  return albums;
});

ipcMain.handle("getAllPlaylists", async () => {
  const playlists = await getPlaylists();
  return playlists;
});

ipcMain.handle("getAlbumsWithSongs", async () => {
  const albumsWithSongs = await getAlbumsWithSongs();
  return albumsWithSongs;
});

ipcMain.handle("getAlbumWithSongs", async (_, id: number) => {
  const albumWithSongs = await getAlbumWithSongs(id);
  return albumWithSongs;
});

ipcMain.handle("getPlaylistWithSongs", async (_, id: number) => {
  const playlistWithSongs = await getPlaylistWithSongs(id);
  return playlistWithSongs;
});

ipcMain.handle("getSongMetadata", async (_, file: string) => {
  const metadata = await parseFile(file, {
    skipPostHeaders: true,
  });

  const coverArt = selectCover(metadata.common.picture);
  const art = coverArt
    ? `data:${coverArt.format};base64,${coverArt.data.toString("base64")}`
    : "/coverArt.png";

  const favourite = await isSongFavorite(file);

  return { metadata, art, favourite };
});

ipcMain.on("addToFavourites", async (_, id: number) => {
  return addToFavourites(id);
});

ipcMain.handle("search", async (_, query: string) => {
  const results = await searchDB(query);
  return results;
});

app.on("window-all-closed", () => {
  app.quit();
});
