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
  createSequence,
} from "./utils/ffmpeg";
import { isErr } from "../hook/api";
import { getVideoList } from "./utils/video";
import os from "os";
const tempName = "_video-preview-app-";
const temp = fs.mkdtempSync(`${os.tmpdir()}/${tempName}`);

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

let mWindow: BrowserWindow | null = null;
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

  mWindow = mainWindow;

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
      const filePaths = getMenuPath(files, mainWindow, "openFile");
      const folderPaths = getMenuPath(folders, mainWindow, "openDirectory");
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
                ...folderPaths,

                {
                  label: "───────────────",
                  enabled: false,
                },
                ...filePaths,
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
              label: "リリースノート",
              click() {
                shell.openExternal(
                  "https://docs.google.com/document/d/12hY9ZCxzecBJ0xf84Qmzb5B1HMy9fXDy627zxR3SK1A/edit?usp=sharing"
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

  mainWindow.on("close", async (e) => {
    e.preventDefault(); // 一旦閉じるのをキャンセル

    // フロントに状態を問い合わせる
    mainWindow.webContents.send("check-can-close");

    // ipcMainで応答を待つ（Promiseで一時停止）
    const canClose = await new Promise((resolve) => {
      ipcMain.once("check-can-close-response", (event, result) => {
        resolve(result);
      });
    });

    if (canClose) {
      mainWindow.destroy(); // 強制的に閉じる
    }
  });

  // レンダラープロセスをロード
  mainWindow.loadFile("dist/index.html");

  autoUpdater.checkForUpdatesAndNotify();
});

app.on("will-quit", async () => {
  try {
    if (fs.existsSync(temp)) {
      fs.rmSync(temp, { recursive: true, force: true });
      console.log(`Temporary directory ${temp} deleted successfully.`);
    }

    fs.readdirSync(os.tmpdir()).forEach((file) => {
      const filePath = path.join(os.tmpdir(), file);

      if (file.startsWith(tempName) && fs.statSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      }
    });
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

const getMenuPath = (
  paths: Path[],
  mainWindow: BrowserWindow,
  id: OpenFileFolderType
): {
  label: string;
  click: () => void;
}[] => {
  const ret = paths
    .filter((path) => fs.existsSync(path)) // 存在するパスのみ残す
    .slice(0, 10) // 最大10件までに制限
    .map((path) => ({
      label: path.replace(/\\/g, "/"),
      click: () => mainWindow.webContents.send("open-path", path, id),
    }));

  return ret;
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

      // const count = Object.keys(data).length;

      // for (const [index, [videoName, marker]] of Object.entries(
      //   data
      // ).entries()) {
      for (const [videoName, marker] of Object.entries(data)) {
        // const videoName = path.basename(videoPath, path.extname(videoPath));
        // mWindow?.setProgressBar(index / count);
        // console.log(mWindow ? "true" : "false");
        // mWindow?.webContents.send("task-progress", index / count);

        const folderPath = path.join(saveDir, videoName);
        fs.mkdirSync(folderPath, { recursive: true });

        for (const [key, base64] of Object.entries(marker)) {
          const frame = Number(key) + offset;
          let imgName = String(frame);
          if (!isEmptyOrWhitespace(filename)) {
            if (reg.test(filename)) {
              imgName = filename.replace(reg, (match) => {
                const numLength = match.length;
                const numberStr = String(frame).padStart(numLength, "0");
                return numberStr;
              });
            } else {
              imgName = filename + String(frame);
            }
          }

          const filePath = path.join(folderPath, `${imgName}.png`);

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

const generateRandomName = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
};

ipcMain.handle(
  "list-to-sequence",
  async (
    _,
    nameList: string[],
    list: string[],
    name: string,
    metaList: (Meta | null)[]
  ): Promise<Video | Err> => {
    // const videoName = path.basename(videoPath, path.extname(videoPath));
    const fileName = generateRandomName();
    const saveFolder = path.join(temp, "_sequence", fileName);
    const saveFile = path.join(saveFolder, `seq.mp4`);
    const saveText = path.join(saveFolder, "list.txt");

    if (!fs.existsSync(saveFolder)) {
      fs.mkdirSync(saveFolder, { recursive: true });
    }

    const text = list
      .map((item) => `file '${item.replace(/\\/g, "/")}'`)
      .join("\n");
    try {
      fs.writeFileSync(saveText, text);
    } catch (err) {
      const ret: Err = { error: "", errorcode: "" };
      return ret;
    }

    let timeline = 1;
    const marker: Marker = {};
    metaList.forEach((e, i) => {
      if (e) {
        marker[timeline] = [[[]], 0, { w: 0, h: 0 }];
        const total = e[2] * e[1];
        timeline += total;
      }
    });

    // const nameList = list.map((e) => {
    //   return path.basename(e);
    // });

    const ret = await createSequence(saveText, saveFile);
    if (isErr(ret)) {
      return ret;
    } else {
      const video: Video = {
        name: name,
        path: saveFile,
        extension: ".mp4",
        directory: ["sequence"],
        seq: marker,
        seqVideo: nameList,
      };

      return video;
    }
  }
);
