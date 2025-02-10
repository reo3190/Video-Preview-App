import path from "path";
import fs from "fs";
import { BrowserWindow, app, ipcMain, Menu, dialog, shell } from "electron";
import { autoUpdater } from "electron-updater";
import {
  getVideoMeta,
  getVideoDuration,
  generateThumbnail,
  generateThumbnails,
  getCaputureData,
  convertMOVtoMP4,
} from "./utils/ffmpeg";
import { isErr } from "../hook/api";
import { getVideoList } from "./utils/video";
import os from "os";
const temp = fs.mkdtempSync(os.tmpdir() + "/_video-preview-app-");

//  /$$   /$$  /$$$$$$  /$$$$$$$$ /$$   /$$
// | $$$ /$$$ /$$__  $$|__  $$__/| $$$ | $$
// | $$$$$$$$| $$  | $$   | $$   | $$$$| $$
// | $$ $$ $$| $$$$$$$$   | $$   | $$ $$ $$
// | $$\_/ $$| $$__  $$   | $$   | $$  $$$$
// | $$  | $$| $$  | $$   | $$   | $$\  $$$
// | $$  | $$| $$  | $$ /$$$$$$$$| $$ \  $$
// \__/  \__/\__/  \__/ \_______/\__/  \__/

autoUpdater.autoInstallOnAppQuit = false;

app.setAboutPanelOptions({
  applicationName: "[SBL]Video Preview App", // アプリ名
  applicationVersion: app.getVersion(), // アプリのバージョン
  iconPath: "assets/icon.ico",
});

const isDebug =
  process.env.NODE_ENV === "development" || process.env.DEBUG_PROD === "true";

app.whenReady().then(async () => {
  // アプリの起動イベント発火で BrowserWindow インスタンスを作成
  const mainWindow = new BrowserWindow({
    width: 1200,
    minWidth: 1000,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      // webpack が出力したプリロードスクリプトを読み込み
      // preload: app.isPackaged
      //   ? path.join(__dirname, "preload.js")
      //   : path.join(__dirname, "../../.erb/dll/preload.js"),
    },
  });

  // mainWindow.setTitle("[SBL] Video Preview App");
  mainWindow.setAspectRatio(1.5);

  if (isDebug) {
    mainWindow.webContents.openDevTools({ mode: "detach" });
  }

  mainWindow.on("resize", () => {
    const size = mainWindow.getBounds();
    mainWindow.webContents.send("window-resize", size);
  });

  ipcMain.handle("get-window-size", async (_): Promise<Electron.Rectangle> => {
    const res = mainWindow.getBounds();
    return res;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: "deny" };
  });

  ipcMain.on(
    "update-menu",
    (_, page: String, files: Path[], folders: Path[]) => {
      const fileMenu = [
        {
          label: "開く",
          submenu: [
            {
              label: "ファイルを開く",
              click() {
                onCheckOpen(mainWindow, "openFile");
              },
            },
            {
              label: "フォルダを開く",
              click() {
                onCheckOpen(mainWindow, "openDirectory");
              },
            },
            {
              label: "履歴",
              submenu: [
                ...files.map((file) => ({
                  label: file,
                  click: () =>
                    mainWindow.webContents.send("open-path", file, "openFile"),
                })),
                { label: "--------------", enabled: false },
                ...folders.map((folder) => ({
                  label: folder,
                  click: () =>
                    mainWindow.webContents.send(
                      "open-path",
                      folder,
                      "openDirectory"
                    ),
                })),
              ],
            },
          ],
        },
      ];

      const helpMenu = [
        {
          label: "情報",
          submenu: [
            {
              label: "仕様書",
              click() {
                shell.openExternal(
                  "https://docs.google.com/document/d/14vYzHRcwSt6ENXp_PLFH5c5PQCTyWTPwJal_5KWObBE/edit?usp=sharing"
                );
              },
            },
            {
              label: `v ${app.getVersion()}`,
              enabled: false,
            },
          ],
        },
      ];

      const getTemplate = () => {
        switch (page) {
          case "/":
            return [
              {
                label: "書き出し",
                submenu: [
                  {
                    label: "一括で画像出力",
                    click() {
                      mainWindow.webContents.send("save-all-images");
                    },
                  },
                  {
                    label: "設定",
                    click() {
                      mainWindow.webContents.send("open-setting");
                    },
                  },
                ],
              },
            ];
          case "/play":
            return [
              {
                label: "書き出し",
                submenu: [
                  {
                    label: "画像出力",
                    click() {
                      mainWindow.webContents.send("save-images");
                    },
                  },
                  {
                    label: "設定",
                    click() {
                      mainWindow.webContents.send("open-setting");
                    },
                  },
                ],
              },
            ];
          default:
            return [];
        }
      };
      const template = getTemplate();

      const menu = Menu.buildFromTemplate([
        ...fileMenu,
        ...template,
        ...helpMenu,
      ]);
      Menu.setApplicationMenu(menu);
    }
  );

  // レンダラープロセスをロード
  mainWindow.loadFile("dist/index.html");

  autoUpdater.checkForUpdatesAndNotify();
});

app.on("will-quit", () => {
  try {
    if (fs.existsSync(temp)) {
      fs.rmSync(temp, { recursive: true, force: true });
      console.log(`Temporary directory ${temp} deleted successfully.`);
    }
  } catch (err) {
    console.error(`Failed to delete temporary directory ${temp}:`, err);
  }
});

// すべてのウィンドウが閉じられたらアプリを終了する
app.once("window-all-closed", () => app.quit());

const onCheckOpen = (
  mainWindow: BrowserWindow,
  id: "openFile" | "openDirectory"
) => {
  mainWindow.webContents.send("check-open", id);
};

// ダウンロード完了後、アップデートのインストール
autoUpdater.on("update-downloaded", () => {
  dialog
    .showMessageBox({
      type: "info",
      title: "Update Ready",
      message:
        "最新のバージョンがダウンロードされました。アプリを再起動しますか？",
      buttons: ["今すぐ再起動", "後で"],
    })
    .then((result) => {
      if (result.response === 0) {
        try {
          autoUpdater.quitAndInstall();
        } catch (error) {
          dialog.showMessageBox({
            type: "info",
            title: "Update Available",
            message: error as string,
          });
        }
      }
    });
});

const selectDialog = async (
  target: "openFile" | "openDirectory"
): Promise<string> => {
  const options: Electron.OpenDialogOptions = {
    properties: [target],
    ...(target === "openFile" && {
      filters: [{ name: "Video Files", extensions: ["mp4", "mov"] }],
    }),
  };

  const result = await dialog.showOpenDialog(options);

  if (result.canceled || !result.filePaths.length) {
    throw new Error("保存先が選択されていません。");
  }

  return result.filePaths[0];
};

//  /$$$$$$$$ /$$$$$$$   /$$$$$$
// |__  $$__/| $$__  $$ /$$___ $$
//    | $$   | $$  | $$| $$   \_/
//    | $$   | $$$$$$$/| $$
//    | $$   | $$____/ | $$
//    | $$   | $$      | $$   /$$
//  /$$$$$$$$| $$      |  $$$$$$/
//  \_______/\__/       \______/

ipcMain.handle(
  "open-file-folder",
  async (_, id: OpenFileFolderType): Promise<string> => {
    const res = await selectDialog(id);
    return res;
  }
);

ipcMain.handle(
  "get-video-list",
  async (_, inputPath: string): Promise<Video[] | Err> => {
    const res = await getVideoList(inputPath);
    return res;
  }
);

// 動画からサムネイルを取得する処理
ipcMain.handle(
  "generate-thumbnail",
  async (_, videoPath: string): Promise<string | Err> => {
    const res = await generateThumbnail(videoPath, 0);
    return res;
  }
);

ipcMain.handle(
  "generate-thumbnail-at-time",
  async (_, videoPath): Promise<[string[], number] | Err> => {
    try {
      const totalTime = await getVideoDuration(videoPath);
      if (isErr(totalTime)) return totalTime;
      const thumbnails = await generateThumbnails(videoPath, totalTime);
      if (isErr(thumbnails)) return thumbnails;
      return [thumbnails, totalTime];
    } catch (err) {
      console.error("Error generating thumbnails:", err);
      throw err;
    }
  }
);

ipcMain.handle(
  "get-video-meta",
  async (_, videoPath: string): Promise<any | Err> => {
    const res = await getVideoMeta(videoPath);
    return res;
  }
);

ipcMain.handle(
  "get-caputure-data",
  async (
    _,
    videoPath: string,
    data: PaintData[]
  ): Promise<{ [key: number]: string }> => {
    return getCaputureData(videoPath, data);
  }
);

const isEmptyOrWhitespace = (str: string) => {
  return str.trim() === "";
};

ipcMain.handle(
  "save-composite-images",
  async (_, data: MarkersRender, filename: string, offset: number) => {
    try {
      const saveDir = await selectDialog("openDirectory");
      const reg = /#+/g;

      for (const [videoPath, marker] of Object.entries(data)) {
        const videoName = path.basename(videoPath, path.extname(videoPath));

        const folderPath = path.join(saveDir, videoName);
        fs.mkdirSync(folderPath, { recursive: true });

        for (const [key, base64] of Object.entries(marker)) {
          const frame = Number(key) + offset;
          let name = String(frame);
          if (!isEmptyOrWhitespace(filename)) {
            if (reg.test(filename)) {
              name = filename.replace(reg, (match) => {
                const numLength = match.length;
                const numberStr = String(frame).padStart(numLength, "0");
                return numberStr;
              });
            } else {
              name = filename + String(frame);
            }
          }

          const filePath = path.join(folderPath, `${name}.png`);

          const base64Data = base64.split(",")[1]; // data:image/png;base64, を除去
          const buffer = Buffer.from(base64Data, "base64");

          fs.writeFileSync(filePath, buffer);
        }
      }

      return { success: true, message: "画像を保存しました。" };
    } catch (error: any) {
      console.error(error);
      return { success: false, message: error.message };
    }
  }
);

ipcMain.handle("mov-to-mp4", async (_, videoPath: string): Promise<Path> => {
  const videoName = path.basename(videoPath, path.extname(videoPath));
  const saveFolder = path.join(temp, videoName);
  const saveFile = path.join(saveFolder, "tmp.mp4");

  if (fs.existsSync(saveFile)) {
    return saveFile;
  } else {
    fs.mkdirSync(saveFolder, { recursive: true });

    const res = await convertMOVtoMP4(videoPath, saveFile);
    if (isErr(res)) {
      throw new Error();
    }
    return saveFile;
  }
});
