import {
  contextBridge,
  ipcRenderer,
  IpcRendererEvent,
  webUtils,
} from "electron";

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

  showFilePath: (file: File, isFile: Boolean) => {
    const p = webUtils.getPathForFile(file);
    if (isFile) {
      const allowedExtensions = ["mp4", "mov"];
      const ext = p.split(".").pop()?.toLowerCase();

      if (!ext || !allowedExtensions.includes(ext)) {
        return null;
      }

      return p;
    } else {
      return p;
    }
  },

  onCheckCanClose: (callback: () => () => void) => {
    const listener = (_: IpcRendererEvent) => callback();
    ipcRenderer.on("check-can-close", listener);

    return () => {
      ipcRenderer.removeListener("check-can-close", listener);
    };
  },

  sendCloseResponse: (canClose: boolean) =>
    ipcRenderer.send("check-can-close-response", canClose),

  updateMenu: (menuItems: string, files: Path[], folders: Path[]) =>
    ipcRenderer.send("update-menu", menuItems, files, folders),

  getWindowSize: async (): Promise<Electron.Rectangle> => {
    return await ipcRenderer.invoke("get-window-size");
  },

  onWindowResize: (callback: (size: Electron.Rectangle) => () => void) => {
    const listener = (_: IpcRendererEvent, size: Electron.Rectangle) =>
      callback(size);
    ipcRenderer.on("window-resize", listener);

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

  onProgress: (callback: (e: number) => () => void) => {
    const listener = (_: IpcRendererEvent, e: number) => callback(e);
    ipcRenderer.on("task-progress", listener);

    return () => {
      ipcRenderer.removeListener("task-progress", listener);
    };
  },

  onComplete: (callback: () => () => void) => {
    const listener = () => callback();
    ipcRenderer.on("task-complete", listener);

    return () => {
      ipcRenderer.removeListener("task-complete", listener);
    };
  },

  onSaveImages: (callback: () => () => void) => {
    const listener = () => callback();
    ipcRenderer.on("save-images", listener);

    return () => {
      ipcRenderer.removeListener("save-images", listener);
    };
  },

  onSaveAllImages: (callback: () => () => void) => {
    const listener = () => callback();
    ipcRenderer.on("save-all-images", listener);

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

  saveCompositeImages: async (
    data: MarkersRender,
    filename: string,
    offset: number
  ) => {
    const response = await ipcRenderer.invoke(
      "save-composite-images",
      data,
      filename,
      offset
    );
  },

  MOV2MP4: async (videoPath: Path): Promise<Path> => {
    const response = await ipcRenderer.invoke("mov-to-mp4", videoPath);
    return response;
  },

  onOpenSetting: (callback: () => () => void) => {
    const listener = () => callback();
    ipcRenderer.on("open-setting", listener);

    // リスナーを管理する仕組みを追加
    return () => {
      ipcRenderer.removeListener("open-setting", listener);
    };
  },

  onOpenFile: (callback: (p: Path, id: OpenFileFolderType) => () => void) => {
    const listener = (_: IpcRendererEvent, p: Path, id: OpenFileFolderType) =>
      callback(p, id);
    ipcRenderer.on("open-path", listener);
    return () => {
      ipcRenderer.removeListener("open-path", listener);
    };
  },

  list2sequence: async (
    nameList: string[],
    list: string[],
    name: string,
    metaList: (Meta | null)[]
  ): Promise<Video | Err> => {
    const response = await ipcRenderer.invoke(
      "list-to-sequence",
      nameList,
      list,
      name,
      metaList
    );
    return response;
  },
};

contextBridge.exposeInMainWorld("electron", electronHandler);

export type ElectronHandler = typeof electronHandler;
