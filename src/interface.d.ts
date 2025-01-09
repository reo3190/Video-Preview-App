import { StrokeOptions } from "perfect-freehand";
export interface IElectronAPI {
  getWindowSize: () => Promise<Electron.Rectangle>;
  onWindowResize: (callback: (size: Electron.Rectangle) => void) => void;
  getVideoList: (e: string) => Promise<Video[] | Err>;
  getThumbnail: (e: string) => Promise<string | Err>;
  _getThumbnail: (e: string) => Promise<[string[], number] | Err>;
  convert2HLS: (e: string[]) => Promise<Record<string, string | null> | Err>;
  _convert2HLS: (e: string[]) => Promise<string[]>;
}

type Weaken<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? any : T[P];
};

declare global {
  interface Window {
    electron: IElectronAPI;
  }

  interface Video {
    name: string;
    path: string;
    extension: string;
    directory: string[];
    thumbnail: string;
  }

  interface Filter {
    date: string;
    dateList: string[];
    check: string;
    checkList: string[];
    wordInput: string;
    wordList: string[];
  }

  type PaintToolName = "pen" | "eraser" | "text" | "clear";

  interface PaintToolConfig {
    size: number;
    color: string;
    opacity: number;
  }

  type PaintTool = Record<PaintToolName, PaintToolConfig>;

  interface PaintConfig {
    smooth: number;
    pressure: number;
  }

  interface PaintPoint {
    x: number;
    y: number;
    pressure?: number;
  }

  interface PaintElement {
    id: number;
    tool: PaintToolName;
    points?: PaintPoint[];
    size?: number;
    color?: string;
    opacity?: number;
    option?: StrokeOptions;
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    text?: string;
    font?: string;
    offsetX?: number;
    offsetY?: number;
    position?: string | null;
  }

  type Markers = Record<string, number[]>;

  interface Succ {
    success: string;
  }

  interface Err {
    error: string;
    errorcode: string;
  }
}

export {};
