import path from "path";
import fs from "fs";
import { BrowserWindow, app, ipcMain, Menu, dialog } from "electron";
import { exec, spawn } from "child_process";
import {
  getVideoMeta,
  getVideoDuration,
  generateThumbnail,
  generateThumbnails,
  Convert2HLS_All,
  saveFrameImage,
  getCaputureData,
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

  const menuTemplate = [
    {
      label: "開く",
      submenu: [
        {
          label: "ファイル",
          click() {},
        },
        {
          label: "フォルダ",
          click() {},
        },
      ],
    },
    {
      label: "書き出し",
      submenu: [
        {
          label: "画像",
          click() {
            mainWindow.webContents.send("save-images");
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

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
import { TbArrowWaveLeftDown } from "react-icons/tb";

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
    // data.forEach((d, i) => {
    return getCaputureData(videoPath, data);
    // });
  }
);

ipcMain.handle(
  "save-composite-images",
  async (
    _,
    videoPath: string,
    data: {
      [x: number]: string;
    }
  ) => {
    try {
      // ダイアログで保存先を選択させる
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (result.canceled || !result.filePaths.length) {
        throw new Error("保存先が選択されていません。");
      }

      // 保存先ディレクトリのパス
      const saveDir = result.filePaths[0];

      // videoPathからファイル名（拡張子なし）を取得
      const videoName = path.basename(videoPath, path.extname(videoPath));

      // 新しいフォルダを作成
      const folderPath = path.join(saveDir, videoName);
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
      }

      // dataオブジェクトの中のbase64をファイルとして保存
      for (const [key, base64] of Object.entries(data)) {
        const filePath = path.join(folderPath, `${key}.png`);

        // base64データをバイナリに変換
        const base64Data = base64.split(",")[1]; // data:image/png;base64, を除去
        const buffer = Buffer.from(base64Data, "base64");

        // ファイルとして保存
        fs.writeFileSync(filePath, buffer);
      }

      return { success: true, message: "画像を保存しました。" };
    } catch (error) {
      console.error(error);
      // return { success: false, message: error.message };
    }
  }
);

// ipcMain.handle(
//   "save-images-select-video",
//   async (_, videoPath: string, data: PaintData[]): Promise<void> => {
//     try {
//       const result = await dialog.showOpenDialog({
//         properties: ["openDirectory"], // フォルダ選択
//         title: "Select Save Folder",
//       });

//       if (!result.canceled) {
//         const savePath = result.filePaths[0];
//         if (!fs.existsSync(savePath)) {
//           fs.mkdirSync(savePath, { recursive: true });
//         }

//         data.forEach((d, i) => {
//           const outputImagePath = path.join(savePath, `image_${d.frame}.png`);
//           saveFrameImage(videoPath, d, savePath);
//         });
//       }
//     } catch (error) {
//       console.error("Error selecting save path:", error);
//     }
//   }
// );

// ipcMain.handle("select-video", async (_, path: string): Promise => {
//   const fileData = fs.readFileSync(path); // バイナリデータとして読み込む
//   return fileData.toString("base64"); // Base64に変換して返す
// });
