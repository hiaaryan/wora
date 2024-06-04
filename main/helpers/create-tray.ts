import { BrowserWindow, Tray, ipcMain } from "electron";
import path from "path";

const isProd = process.env.NODE_ENV === "production";

let tray = null;
let nowPlayingWindow = null;

export const createTray = () => {
  tray = new Tray(path.join("resources", "Tray.png"));
  tray.setToolTip("Wora");

  tray.on("click", (_: any, bounds: any) => {
    const { x } = bounds;

    const width = nowPlayingWindow.getBounds().width;

    const xPos = x - Math.round(width / 2) + 10;
    const yPos = 55;

    nowPlayingWindow.setPosition(xPos, yPos, false);

    if (nowPlayingWindow) {
      nowPlayingWindow.isVisible()
        ? nowPlayingWindow.hide()
        : nowPlayingWindow.show();
    }
  });
};

export const createNowPlayingWindow = () => {
  nowPlayingWindow = new BrowserWindow({
    width: 385,
    height: 150,
    show: false,
    frame: false,
    transparent: true,
    vibrancy: "fullscreen-ui",
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
    },
  });

  ipcMain.on("player-update", (_, data) => {
    nowPlayingWindow.webContents.send("tray-update", data);
  });

  if (isProd) {
    nowPlayingWindow.loadURL("app://./tray");
  } else {
    const port = process.argv[2];
    nowPlayingWindow.loadURL(`http://localhost:${port}/tray`);
  }

  nowPlayingWindow.on("blur", () => {
    nowPlayingWindow.hide();
  });
};
