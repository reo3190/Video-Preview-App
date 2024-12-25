import path from "path";
import fs from "fs";
import { BrowserWindow, app, ipcMain } from "electron";
import { exec, spawn } from "child_process";
import {
  getVideoDuration,
  generateThumbnail,
  generateThumbnails,
  Convert2HLS_All,
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

ipcMain.handle(
  "convert-to-hls",
  async (
    _,
    filePaths: string[]
  ): Promise<Record<string, string | null> | Err> => {
    const outputFiles: string[] = [];

    filePaths.forEach((e) => {
      const hash = crypto.createHash("md5").update(e).digest("hex");
      const outputDir = path.join(app.getPath("userData"), "hls-cache", hash);
      const outputFile = path.join(outputDir, "output.m3u8");
      if (!fs.existsSync(path.join(app.getPath("userData"), "hls-cache"))) {
        fs.mkdirSync(path.join(app.getPath("userData"), "hls-cache"));
      }
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }
      outputFiles.push(outputFile);
    });

    const res = await Convert2HLS_All(filePaths, outputFiles);
    return res;
  }
);

import { Worker } from "worker_threads";

const workers: any[] = [];
const maxWorkers = 100; // 同時に実行する最大スレッド数

function startWorker(filePath: string, outputDir: string, outputFile: string) {
  const basePath = app.isPackaged
    ? path.join(process.resourcesPath)
    : path.join(__dirname, "resources");

  const ffmpegPath = path.join(basePath, "ffmpeg", "ffmpeg.exe");

  if (!fs.existsSync(path.join(app.getPath("userData"), "hls-cache"))) {
    fs.mkdirSync(path.join(app.getPath("userData"), "hls-cache"));
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(path.resolve(__dirname, "worker.js"), {
      workerData: { filePath, ffmpegPath, outputDir, outputFile },
    });

    worker.on("message", (message: any) => {
      console.log(`変換成功: ${filePath}`);
      resolve(message);
    });

    worker.on("error", (err: any) => {
      console.error(`エラー発生: ${filePath}`, err);
      reject(err);
    });

    worker.on("exit", (code: number) => {
      if (code !== 0) {
        console.error(`ワーカー異常終了: ${filePath}, code: ${code}`);
        reject(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}

ipcMain.handle(
  "_convert-to-hls",
  async (_, filePaths: string[]): Promise<string[]> => {
    let index = 0;
    const output: string[] = [];
    while (index < filePaths.length || workers.length > 0) {
      if (workers.length < maxWorkers && index < filePaths.length) {
        const filePath = filePaths[index++];
        console.log(`開始: ${filePath}`);
        const hash = crypto.createHash("md5").update(filePath).digest("hex");
        const outputDir = path.join(app.getPath("userData"), "hls-cache", hash);
        const outputFile = path.join(outputDir, "output.m3u8");
        const workerPromise = startWorker(filePath, outputDir, outputFile);
        workers.push(workerPromise);

        workerPromise.finally(() => {
          workers.splice(workers.indexOf(workerPromise), 1);
          output.push(outputFile);
        });
      }
      await Promise.race(workers); // 一つのタスクが終了するのを待つ
    }
    console.log("すべての動画が変換されました！");
    return output;
  }
);
