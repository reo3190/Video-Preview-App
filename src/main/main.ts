import path from "path";
import { BrowserWindow, app, ipcMain } from "electron";
import { exec, spawn } from "child_process";
import {
  getVideoDuration,
  generateThumbnail,
  generateThumbnails,
} from "./utils/ffmpeg";
import { isErr } from "../hook/api";
import { getVideoList } from "./utils/video";

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

  mainWindow.webContents.openDevTools({ mode: "detach" });

  // レンダラープロセスをロード
  mainWindow.loadFile("dist/index.html");
});

// すべてのウィンドウが閉じられたらアプリを終了する
app.once("window-all-closed", () => app.quit());

//  /$$$$$$$$ /$$$$$$$   /$$$$$$
// |__  $$__/| $$__  $$ /$$___ $$
//    | $$   | $$  | $$| $$   \_/
//    | $$   | $$$$$$$/| $$
//    | $$   | $$____/ | $$
//    | $$   | $$      | $$   /$$
//  /$$$$$$$$| $$      |  $$$$$$/
//  \_______/\__/       \______/

ipcMain.handle(
  "get-video-list",
  async (_, inputPath: string): Promise<Video[] | Err> => {
    const res = getVideoList(inputPath);
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
