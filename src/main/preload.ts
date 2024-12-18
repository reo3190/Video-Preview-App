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
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;
