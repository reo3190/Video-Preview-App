import { time2frame } from "../../../hook/api";

type VideoFrameOptions = {
  id?: string;
  frameRate?: number;
  callback?: (frame: number, time: number) => void;
};

class VideoFrame {
  private video: HTMLVideoElement;
  private frameRate: number;
  private callback?: (frame: number, time: number) => void;

  constructor(options: VideoFrameOptions = {}) {
    this.frameRate = options.frameRate || 24;
    this.video = (
      options.id
        ? document.getElementById(options.id)
        : document.getElementsByTagName("video")[0]
    ) as HTMLVideoElement;

    if (!this.video) {
      throw new Error("Video element not found");
    }

    this.callback = options.callback;

    // 動画の再生状態に関係なく常にフレームを更新する
    this.startFrameTracking();
  }

  private get(): number {
    return time2frame(this.video.currentTime, this.frameRate) + 1;
  }

  private startFrameTracking(): void {
    const updateFrame = () => {
      if (this.callback) {
        this.callback(this.get(), this.video.currentTime); // 現在のフレーム番号をコールバックで返す
      }
      requestAnimationFrame(updateFrame); // 次のフレームの更新
    };

    requestAnimationFrame(updateFrame); // 初回のフレーム更新を開始
  }
}

export { VideoFrame };
