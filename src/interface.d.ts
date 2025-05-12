import React, { RefObject } from "react";
import { StrokeOptions } from "perfect-freehand";
import { Location } from "react-router-dom";

export interface IElectronAPI {
  onProgress: (callback: (e: number) => void) => () => void;
  onComplete: (callback: () => void) => () => void;
  onCheckCanClose: (callback: () => void) => () => void;
  sendCloseResponse: (e: boolean) => void;
  showFilePath: (e: File, f: Boolean) => string | null;
  updateMenu: (e: string, a: Path[], b: Path[]) => void;
  getWindowSize: () => Promise<Electron.Rectangle>;
  onWindowResize: (callback: (size: Electron.Rectangle) => void) => () => void;
  onCheckOpen: (
    callback: (id: OpenFileFolderType) => Promise<void>
  ) => () => void;
  openFileFolder: (id: "openFile" | "openDirectory") => Promise<string>;
  getVideoMeta: (e: string) => Promise<any | Err>;
  getVideoList: (e: string) => Promise<Video[] | Err>;
  getThumbnail: (e: string) => Promise<string | Err>;
  _getThumbnail: (e: string) => Promise<[string[], number] | Err>;
  onSaveImages: (callback: () => Promise<void>) => () => void;
  onSaveAllImages: (callback: () => Promise<void>) => () => void;
  saveImagesSelectVideo: (a: string, b: PaintData[]) => Promise<any>;
  getCaputureData: (
    a: string,
    b: PaintData[]
  ) => Promise<{ [key: number]: string }>;
  saveCompositeImages: (a: MarkersRender, b: string, c: number) => void;
  MOV2MP4: (e: Path) => Promise<Path>;
  onOpenSetting: (callback: () => void) => () => void;
  onOpenFile: (
    callback: (p: Path, id: OpenFileFolderType) => Promise<void>
  ) => () => void;
  list2sequence: (
    a: string[],
    b: string[],
    c: string,
    d: (Meta | null)[]
  ) => Promise<Video | Err>;
}

type Weaken<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? any : T[P];
};

declare global {
  interface Window {
    electron: IElectronAPI;
  }

  type Path = string;
  type Base64 = string;
  type Frame = number;
  type Time = number;
  type FPS = number;

  type CacheMode = "add" | "get" | "remove" | "clear";

  type OpenFileFolderType = "openFile" | "openDirectory";

  type TabType = "FOLDER" | "EDIT";

  interface Size {
    w: number;
    h: number;
  }

  interface Video {
    name: string;
    path: string;
    extension: string;
    directory: string[];
    //paint
    // paintNum: number;
    // sequence
    seq?: Marker;
    seqVideo?: string[];
  }

  interface Filter {
    date: string;
    dateList: string[];
    check: string;
    checkList: string[];
    wordInput: string;
    wordList: string[];
  }

  type Filter4EditParts = "paint" | "seq" | "all";
  interface Filter4Edit {
    select: Filter4EditParts;
    wordInput: string;
    wordList: string[];
  }

  type PaintToolName = "pen" | "eraser" | "text" | "clear" | "mouse";

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

  type Marker = Record<Frame, [PaintElement[][], number, Size]>;
  type Markers = Record<Path, Marker>;

  type MarkerRender = Record<Frame, Base64>;
  type MarkersRender = Record<string, MarkerRender>;

  interface PaintData {
    frame: number;
    sec: number;
    paint: HTMLCanvasElement;
  }

  interface VideoTag {
    date: string | null;
    check: string | null;
  }

  type ContextType = {
    setLoad: (e: boolean) => void;
    initVideoList: (p: string, v: Video | null, vv: Video[]) => void;
    videoMarkers: Markers;
    editVideoMetaCache: editVideoMetaCache;
    editMovPathCache: editMovPathCache;
    navi: (to: String, reload: Boolean) => void;
    loc: Location<any> | null;
    setCurVideo: (e: Video | null) => void;
    setTab: (e: TabType) => void;
  };

  type Meta = [Size, FPS, number];

  type editVideoMetaCache = (
    mode: CacheMode,
    key: string,
    value?: Meta
  ) => Meta | null;

  type editMovPathCache = (
    mode: CacheMode,
    key: string,
    value?: string
  ) => string | null;

  type videojsSource = {
    sources: [{ src: Path; type: string }];
  };

  type Keybind = {
    altKey?: boolean;
    ctrlKey?: boolean;
    metaKey?: boolean;
    shiftKey?: boolean;
    key: KeyboardEvent["key"];
  };

  type KeybindProps = {
    keybind: string;
    onKeyDown?: (event: KeyboardEvent) => void;
    targetRef?: RefObject<HTMLElement>;
  };

  type ShortCuts = Record<string, Keybind>;

  interface Succ {
    success: string;
  }

  interface Err {
    error: string;
    errorcode: string;
  }
}

export {};
