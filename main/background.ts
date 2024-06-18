import path from "path";
import { Menu, Tray, app, dialog, ipcMain } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { protocol, net } from "electron";
import { AutoClient } from "discord-auto-rpc";
import {
  getAlbumSongs,
  getAlbums,
  getSettings,
  initializeData,
} from "./helpers/dbConnect";
import { initDatabase } from "./helpers/db";

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
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

(async () => {
  await app.whenReady();

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

  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
  }
})();

(async () => {
  initDatabase();
  const settings = await getSettings();

  if (settings[0]) {
    await initializeData(settings[0].musicFolder);
  }
})();

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

ipcMain.handle("set-music-folder", async () => {
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

ipcMain.handle("get-settings", async () => {
  const settings = await getSettings();
  return settings[0];
});

ipcMain.handle("get-albums", async () => {
  const albums = await getAlbums();
  return albums;
});

ipcMain.handle("get-album-songs", async (_, id: number) => {
  const data = await getAlbumSongs(id);
  return data;
});

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

app.on("window-all-closed", () => {
  app.quit();
});
