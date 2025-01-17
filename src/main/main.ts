import path from "path";
import fs from "fs";
import { BrowserWindow, app, ipcMain, Menu, dialog } from "electron";
import { exec, spawn } from "child_process";
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
import * as crypto from "crypto";

//  /$$   /$$  /$$$$$$  /$$$$$$$$ /$$   /$$
// | $$$ /$$$ /$$__  $$|__  $$__/| $$$ | $$
// | $$$$$$$$| $$  | $$   | $$   | $$$$| $$
// | $$ $$ $$| $$$$$$$$   | $$   | $$ $$ $$
// | $$\_/ $$| $$__  $$   | $$   | $$  $$$$
// | $$  | $$| $$  | $$   | $$   | $$\  $$$
// | $$  | $$| $$  | $$ /$$$$$$$$| $$ \  $$
// \__/  \__/\__/  \__/ \_______/\__/  \__/

app.whenReady().then(() => {
  // アプリの起動イベント発火で BrowserWindow インスタンスを作成
  const mainWindow = new BrowserWindow({
    webPreferences: {
      // webpack が出力したプリロードスクリプトを読み込み
      preload: path.join(__dirname, "preload.js"),
    },
  });
  mainWindow.setAspectRatio(1.5);

  mainWindow.webContents.openDevTools({ mode: "detach" });

  mainWindow.on("resize", () => {
    const size = mainWindow.getBounds();
    mainWindow.webContents.send("window-resize", size);
  });

  ipcMain.handle("get-window-size", async (_): Promise<Electron.Rectangle> => {
    const res = mainWindow.getBounds();
    return res;
  });

  ipcMain.on("update-menu", (_, page: string) => {
    const base = [
      {
        label: "開く",
        submenu: [
          {
            label: "ファイルを開く",
            click() {
              // onOpenFile(mainWindow);
              onCheckOpen(mainWindow, "openFile");
            },
          },
          {
            label: "フォルダを開く",
            click() {
              // onOpenFolder(mainWindow);
              onCheckOpen(mainWindow, "openDirectory");
            },
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
              ],
            },
          ];
        default:
          return [];
      }
    };
    const template = getTemplate();

    const menu = Menu.buildFromTemplate([...base, ...template]);
    Menu.setApplicationMenu(menu);
  });

  // レンダラープロセスをロード
  mainWindow.loadFile("dist/index.html");
});

// すべてのウィンドウが閉じられたらアプリを終了する
app.once("window-all-closed", () => app.quit());

const onCheckOpen = (
  mainWindow: BrowserWindow,
  id: "openFile" | "openDirectory"
) => {
  mainWindow.webContents.send("check-open", id);
};

const selectDialog = async (
  target: "openFile" | "openDirectory"
): Promise<string> => {
  const result = await dialog.showOpenDialog({
    properties: [target],
  });

  if (result.canceled || !result.filePaths.length) {
    throw new Error("保存先が選択されていません。");
  }

  return result.filePaths[0];
};

// const onOpenFile = async (mainWindow: BrowserWindow) => {
//   const res = await selectDialog("openFile");
//   mainWindow.webContents.send("open-file", res);
// };

// const onOpenFolder = async (mainWindow: BrowserWindow) => {
//   const res = await selectDialog("openDirectory");
//   mainWindow.webContents.send("open-folder", res);
// };

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
  async (_, id: "openFile" | "openDirectory"): Promise<string> => {
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

ipcMain.handle("save-composite-images", async (_, data: MarkersRender) => {
  try {
    const saveDir = await selectDialog("openDirectory");

    for (const [videoPath, marker] of Object.entries(data)) {
      const videoName = path.basename(videoPath, path.extname(videoPath));

      const folderPath = path.join(saveDir, videoName);
      fs.mkdirSync(folderPath, { recursive: true });

      for (const [key, base64] of Object.entries(marker)) {
        const filePath = path.join(folderPath, `${key}.png`);

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
});

import os from "os";
const temp = fs.mkdtempSync(os.tmpdir() + "/_video-preview-app-");

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
