import { exec, spawn } from "child_process";
import path from "path";
import { app } from "electron";
import { isErr } from "../../hook/api";

const basePath = app.isPackaged
  ? path.join(process.resourcesPath)
  : path.join(__dirname, "resources");

const ffmpegPath = path.join(basePath, "ffmpeg", "ffmpeg.exe");
const ffprobePath = path.join(basePath, "ffmpeg", "ffprobe.exe");

const getVideoDuration = (videoPath: string): Promise<number | Err> => {
  return new Promise((resolve, reject) => {
    // ffprobeコマンドの引数
    const args = [
      "-v",
      "error", // エラーメッセージのみを表示
      "-show_entries",
      "format=duration", // 動画の長さのみ取得
      "-of",
      "default=noprint_wrappers=1:nokey=1", // 余計な情報を排除
      videoPath,
    ];

    const command = spawn(ffprobePath, args);
    let output = "";

    // 標準出力からデータを取得
    command.stdout.on("data", (data) => {
      output += data.toString();
    });

    // エラー出力の処理
    command.stderr.on("data", (data) => {
      console.error("stderr:", data.toString());
    });

    command.on("close", (code) => {
      if (code === 0) {
        const duration = parseFloat(output.trim());
        if (!isNaN(duration)) {
          resolve(duration);
        } else {
          const err: Err = {
            error: "動画の長さを解析できませんでした",
            errorcode: "",
          };
          reject(err);
        }
      } else {
        const err: Err = {
          error: `ffprobe exited with code ${code}`,
          errorcode: "",
        };
        reject(err);
      }
    });
  });
};

// サムネイルを生成する関数
const generateThumbnails = async (
  videoPath: string,
  totalTime: number
): Promise<string[] | Err> => {
  return new Promise((resolve, reject) => {
    const thumbnailCount = 13;

    const promises = [];
    for (let i = 0; i < thumbnailCount; i++) {
      const time = (i / (thumbnailCount - 1)) * totalTime;
      promises.push(generateThumbnail(videoPath, time));
    }

    Promise.all(promises)
      .then((results) => {
        const _results = results.every((e) => !isErr(e));
        if (_results) {
          resolve(results as string[]);
        } else {
          const err: Err = {
            error: "生成に失敗したサムネが含まれます。",
            errorcode: "",
          };
          reject(err);
        }
      })
      .catch((error) => {
        const err: Err = { error: error, errorcode: "" };
        reject(err);
      });
  });
};

const generateThumbnail = async (
  videoPath: string,
  time: number
): Promise<string | Err> => {
  return new Promise((resolve, reject) => {
    const command = spawn(ffmpegPath, [
      "-i",
      videoPath,
      "-ss",
      time.toString(), // 秒数で指定
      "-vframes",
      "1",
      "-f",
      "image2pipe",
      "-vcodec",
      "png",
      "-vf",
      "scale=300:-1", // リサイズオプション（適宜調整）
      "-",
    ]);

    let outputBuffer = Buffer.alloc(0);
    command.stdout.on("data", (data) => {
      outputBuffer = Buffer.concat([outputBuffer, data]);
    });

    // command.stderr.on("data", (data) => {
    //   console.error(`stderr: ${data.toString()}`);
    // });

    command.on("close", (code) => {
      if (code !== 0) {
        const err: Err = {
          error: `ffmpeg exited with code ${code}`,
          errorcode: "",
        };
        reject(err);
      } else {
        const base64Data = outputBuffer.toString("base64");
        resolve(base64Data);
      }
    });
  });
};

export { getVideoDuration, generateThumbnails, generateThumbnail };
