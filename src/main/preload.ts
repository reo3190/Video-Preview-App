import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  webUtils,
} from "electron";
import { getCaputureData } from "./utils/ffmpeg";

export type Channels = "ipc-example";

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },

  showFilePath: (file: File) => {
    // レンダラープロセスより渡されたFileオブジェクトから絶対パスを取得
    return webUtils.getPathForFile(file);
  },

  updateMenu: (menuItems: string) => ipcRenderer.send("update-menu", menuItems),

  getWindowSize: async (): Promise<Electron.Rectangle> => {
    return await ipcRenderer.invoke("get-window-size");
  },

  onWindowResize: (callback: (size: Electron.Rectangle) => () => void) => {
    const listener = (_: IpcRendererEvent, size: Electron.Rectangle) =>
      callback(size);
    ipcRenderer.on("window-resize", listener);

    // リスナーを管理する仕組みを追加
    return () => {
      ipcRenderer.removeListener("window-resize", listener);
    };
  },

  onCheckOpen: (callback: (id: string) => () => void) => {
    const listener = (_: IpcRendererEvent, id: string) => callback(id);
    ipcRenderer.on("check-open", listener);

    return () => {
      ipcRenderer.removeListener("check-open", listener);
    };
  },

  openFileFolder: async (id: "openFile" | "openDirectory"): Promise<string> => {
    const response = await ipcRenderer.invoke("open-file-folder", id);
    return response;
  },

  // onOpenFile: (callback: (path: string) => () => void) => {
  //   const listener = (_: IpcRendererEvent, path: string) => callback(path);
  //   ipcRenderer.on("open-file", listener);

  //   return () => {
  //     ipcRenderer.removeListener("open-file", listener);
  //   };
  // },

  // onOpenFolder: (callback: (path: string) => () => void) => {
  //   const listener = (_: IpcRendererEvent, path: string) => callback(path);
  //   ipcRenderer.on("open-folder", listener);

  //   return () => {
  //     ipcRenderer.removeListener("open-folder", listener);
  //   };
  // },

  getVideoMeta: async (videoPath: string): Promise<any | Err> => {
    const response = await ipcRenderer.invoke("get-video-meta", videoPath);
    return response;
  },

  getVideoList: async (inputPath: string): Promise<Video[] | Err> => {
    const response = await ipcRenderer.invoke("get-video-list", inputPath);
    return response;
  },

  getThumbnail: async (videoPath: string): Promise<string | Err> => {
    const response = await ipcRenderer.invoke("generate-thumbnail", videoPath);
    return response;
  },

  _getThumbnail: async (
    videoPath: string
  ): Promise<[string[], number] | Err> => {
    const response = await ipcRenderer.invoke(
      "generate-thumbnail-at-time",
      videoPath
    );
    return response;
  },

  onSaveImages: (callback: () => () => void) => {
    const listener = () => callback();
    ipcRenderer.on("save-images", listener);

    // リスナーを管理する仕組みを追加
    return () => {
      ipcRenderer.removeListener("save-images", listener);
    };
  },

  onSaveAllImages: (callback: () => () => void) => {
    const listener = () => callback();
    ipcRenderer.on("save-all-images", listener);

    // リスナーを管理する仕組みを追加
    return () => {
      ipcRenderer.removeListener("save-all-images", listener);
    };
  },

  saveImagesSelectVideo: async (
    videoPath: string,
    data: PaintData[]
  ): Promise<any> => {
    const response = await ipcRenderer.invoke(
      "save-images-select-video",
      videoPath,
      data
    );
    return response;
  },

  getCaputureData: async (
    videoPath: string,
    data: PaintData[]
  ): Promise<{ [key: number]: string }> => {
    const response = await ipcRenderer.invoke(
      "get-caputure-data",
      videoPath,
      data
    );
    return response;
  },

  saveCompositeImages: async (data: MarkersRender) => {
    const response = await ipcRenderer.invoke("save-composite-images", data);
  },

  MOV2MP4: async (videoPath: Path): Promise<Path> => {
    const response = await ipcRenderer.invoke("mov-to-mp4", videoPath);
    return response;
  },
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;
