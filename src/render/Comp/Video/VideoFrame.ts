type VideoFrameOptions = {
  id?: string;
  frameRate?: number;
  callback?: (frame: number) => void; // コールバック関数の型指定
};

const FrameRates = {
  film: 24,
  NTSC: 29.97,
  NTSC_Film: 23.98,
  NTSC_HD: 59.94,
  PAL: 25,
  PAL_HD: 50,
  web: 30,
  high: 60,
} as const;

class VideoFrame {
  private video: HTMLVideoElement;
  private frameRate: number;
  private callback?: (frame: number) => void;

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
    return Math.floor(this.video.currentTime * this.frameRate) + 1;
  }

  private startFrameTracking(): void {
    const updateFrame = () => {
      if (this.callback) {
        this.callback(this.get()); // 現在のフレーム番号をコールバックで返す
      }
      requestAnimationFrame(updateFrame); // 次のフレームの更新
    };

    requestAnimationFrame(updateFrame); // 初回のフレーム更新を開始
  }

  seekForward(frames: number = 1, callback?: () => void): boolean {
    const timeShift = frames / this.frameRate;
    this.video.currentTime = Math.min(
      this.video.currentTime + timeShift,
      this.video.duration
    );

    if (callback) callback();
    return true;
  }

  seekBackward(frames: number = 1, callback?: () => void): boolean {
    const timeShift = frames / this.frameRate;
    this.video.currentTime = Math.max(this.video.currentTime - timeShift, 0);

    if (callback) callback();
    return true;
  }

  getFrameRate(): number {
    return this.frameRate;
  }

  setFrameRate(frameRate: number): void {
    if (frameRate <= 0) {
      throw new Error("Frame rate must be greater than 0");
    }
    this.frameRate = frameRate;
  }
}

export { VideoFrame, FrameRates };
