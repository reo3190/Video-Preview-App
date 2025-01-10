import {
  createContext,
  useCallback,
  useState,
  useContext,
  ReactNode,
} from "react";
import { Filter } from "./api";
// ---------------------------------------------------------

export type VideoCacheMode = "add" | "get" | "remove" | "clear";

interface DataContext {
  windowSize: Electron.Rectangle;
  setWindowSize: (e: Electron.Rectangle) => void;
  inputPath: string;
  setInputPath: (e: string) => void;
  filter: Filter;
  setFilter: (update: Partial<Filter>) => void;
  videoList: Video[];
  setVideoList: (e: Video[]) => void;
  filteredVideoList: Video[];
  setFilteredVideoList: (e: Video[]) => void;
  curPage: number;
  setCurPage: (e: number) => void;
  curVideo: Video | null;
  setCurVideo: (e: Video) => void;
  lastLoad: number;
  setLastLoad: (e: number) => void;
  videoCache: Map<string, Blob>;
  editVideoCache: (
    mode: VideoCacheMode,
    key: string,
    value?: Blob
  ) => Blob | null;
  imgCache: Map<string, string>;
  editImgCache: (
    mode: VideoCacheMode,
    key: string,
    value?: string
  ) => string | null;
  paintTool: PaintTool;
  setPaintTool: (tool: PaintToolName, update: Partial<PaintToolConfig>) => void;
  activePaintTool: PaintToolName;
  setActivePaintTool: (e: PaintToolName) => void;
  paintConfig: PaintConfig;
  setPaintConfig: (update: Partial<PaintConfig>) => void;
  videoMarkers: Markers;
  setVideoMarkers: (path: string, marker: Marker) => void;
}

const defaultContext: DataContext = {
  windowSize: { x: 0, y: 0, width: 0, height: 0 },
  setWindowSize: () => {},
  inputPath: "L:\\02_check\\02_cut\\mk_F",
  setInputPath: () => {},
  filter: {
    date: "all",
    dateList: [],
    check: "all",
    checkList: [],
    wordInput: "",
    wordList: [],
  },
  setFilter: () => {},
  videoList: [],
  setVideoList: () => {},
  filteredVideoList: [],
  setFilteredVideoList: () => {},
  curPage: 0,
  setCurPage: () => {},
  curVideo: null,
  setCurVideo: () => {},
  lastLoad: 0,
  setLastLoad: () => {},
  videoCache: new Map<string, Blob>(),
  editVideoCache: () => null,
  imgCache: new Map<string, string>(),
  editImgCache: () => null,
  paintTool: {
    pen: { size: 10, color: "#000000", opacity: 1 },
    eraser: { size: 10, color: "", opacity: 1 },
    text: { size: 10, color: "#000000", opacity: 1 },
    clear: { size: 0, color: "", opacity: 0 },
  },
  setPaintTool: () => {},
  activePaintTool: "pen",
  setActivePaintTool: () => {},
  paintConfig: { smooth: 0, pressure: 0 },
  setPaintConfig: () => {},
  videoMarkers: {},
  setVideoMarkers: () => {},
};

const datactx = createContext<DataContext>(defaultContext);

export const useDataContext = () => useContext(datactx);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [windowSize, setWindowSize] = useState<Electron.Rectangle>(
    defaultContext.windowSize
  );
  const [inputPath, setInputPath] = useState<string>(defaultContext.inputPath);
  const [filter, setFilter] = useState<Filter>(defaultContext.filter);
  const [videoList, setVideoList] = useState<Video[]>(defaultContext.videoList);
  const [filteredVideoList, setFilteredVideoList] = useState<Video[]>(
    defaultContext.filteredVideoList
  );
  const [curPage, setCurPage] = useState<number>(defaultContext.curPage);
  const [curVideo, setCurVideo] = useState<Video | null>(
    defaultContext.curVideo
  );
  const [lastLoad, setLastLoad] = useState<number>(defaultContext.lastLoad);
  const videoCache = useState<Map<string, Blob>>(new Map())[0];
  const imgCache = useState<Map<string, string>>(new Map())[0];
  const [paintTool, setPaintTool] = useState<PaintTool>(
    defaultContext.paintTool
  );
  const [activePaintTool, setActivePaintTool] = useState<PaintToolName>(
    defaultContext.activePaintTool
  );
  const [paintConfig, setPaintConfig] = useState<PaintConfig>(
    defaultContext.paintConfig
  );
  const [videoMarkers, setVideoMarkers] = useState<Record<string, Marker>>(
    defaultContext.videoMarkers
  );

  const updateWindowSize = useCallback((size: Electron.Rectangle): void => {
    setWindowSize(size);
  }, []);

  const updateInputPath = useCallback((path: string): void => {
    setInputPath(path);
  }, []);

  const updateFilter = useCallback((update: Partial<Filter>): void => {
    setFilter((prev) => ({
      ...prev,
      ...update,
    }));
  }, []);

  const updateVideoList = useCallback((e: Video[]): void => {
    setVideoList(e);
  }, []);

  const updateFilteredVideoList = useCallback((e: Video[]): void => {
    setFilteredVideoList(e);
  }, []);

  const updateCurPage = useCallback((e: number): void => {
    setCurPage(e);
  }, []);

  const updateCurVideo = useCallback((e: Video): void => {
    setCurVideo(e);
  }, []);

  const updateLastLoad = useCallback((e: number): void => {
    setLastLoad(e);
  }, []);

  const editVideoCache = useCallback(
    (mode: VideoCacheMode, key: string, value?: Blob): Blob | null => {
      switch (mode) {
        case "add":
          if (!value) return null;
          videoCache.set(key, value);
          return null;
        case "get":
          return videoCache.get(key) || null;
        case "remove":
          videoCache.delete(key);
          return null;
        case "clear":
          videoCache.clear();
          return null;
      }
    },
    [videoCache]
  );

  const editImgCache = useCallback(
    (mode: VideoCacheMode, key: string, value?: string): string | null => {
      switch (mode) {
        case "add":
          if (!value) return null;
          imgCache.set(key, value);
          return null;
        case "get":
          return imgCache.get(key) || null;
        case "remove":
          imgCache.delete(key);
          return null;
        case "clear":
          imgCache.clear();
          return null;
      }
    },
    [videoCache]
  );

  const updatePaintTool = useCallback(
    (tool: PaintToolName, update: Partial<PaintToolConfig>): void => {
      setPaintTool((prev) => ({
        ...prev,
        [tool]: { ...prev[tool], ...update },
      }));
    },
    []
  );

  const updateActivePaintTool = useCallback((e: PaintToolName): void => {
    setActivePaintTool(e);
  }, []);

  const updatePaintConfig = useCallback(
    (update: Partial<PaintConfig>): void => {
      setPaintConfig((prev) => ({
        ...prev,
        ...update,
      }));
    },
    []
  );

  const updateVideoMarkers = useCallback((path: string, marker: Marker) => {
    setVideoMarkers((pre) => ({ ...pre, [path]: marker }));
  }, []);

  return (
    <datactx.Provider
      value={{
        windowSize,
        setWindowSize: updateWindowSize,
        inputPath,
        setInputPath: updateInputPath,
        filter,
        setFilter: updateFilter,
        videoList,
        setVideoList: updateVideoList,
        filteredVideoList,
        setFilteredVideoList: updateFilteredVideoList,
        curPage,
        setCurPage: updateCurPage,
        curVideo,
        setCurVideo: updateCurVideo,
        lastLoad,
        setLastLoad: updateLastLoad,
        videoCache,
        editVideoCache,
        imgCache,
        editImgCache,
        paintTool,
        setPaintTool: updatePaintTool,
        activePaintTool,
        setActivePaintTool: updateActivePaintTool,
        paintConfig,
        setPaintConfig: updatePaintConfig,
        videoMarkers,
        setVideoMarkers: updateVideoMarkers,
      }}
    >
      {children}
    </datactx.Provider>
  );
};

//----------------------------------------------------------------------------------------------------
