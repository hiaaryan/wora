import path from "path";
import { app, dialog, ipcMain } from "electron";
import serve from "electron-serve";
import * as DiscordRPC from "discord-rpc";
import { createWindow } from "./helpers";

const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}

(async () => {
  await app.whenReady();

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

  console.log(__dirname);

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
    // mainWindow.webContents.openDevTools();
  }
})();

const clientId = "1243707416588320800";
const rpc = new DiscordRPC.Client({ transport: "ipc" });
rpc.login({ clientId: clientId }).catch(console.error);

ipcMain.on("set-rpc-state", (_, { details, state }) => {
  try {
    rpc.setActivity({
      details,
      state,
      largeImageKey: "logo",
      largeImageText: `v${process.env.npm_package_version}`,
    });
  } catch (error) {
    console.log("discord rpc failed to initialize...");
  }
});

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("openDialog", () => {
  dialog
    .showOpenDialog({
      properties: ["openDirectory", "createDirectory"],
    })
    .then((result) => {
      console.log(result.canceled);
      console.log(result.filePaths);
    })
    .catch((err) => {
      console.log(err);
    });
});

ipcMain.on("message", async (event, arg) => {
  event.reply("message", `${arg} World!`);
});
