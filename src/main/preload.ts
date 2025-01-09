import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

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

  getWindowSize: async (): Promise<Electron.Rectangle> => {
    return await ipcRenderer.invoke("get-window-size");
  },
  onWindowResize: (callback: (size: Electron.Rectangle) => void) => {
    ipcRenderer.on("window-resize", (_, size) => callback(size));
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

  convert2HLS: async (
    filePath: string[]
  ): Promise<Record<string, string | null> | Err> => {
    const response = await ipcRenderer.invoke("convert-to-hls", filePath);
    return response;
  },

  _convert2HLS: async (filePath: string[]): Promise<string[]> => {
    const response = await ipcRenderer.invoke("_convert-to-hls", filePath);
    return response;
  },
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;
