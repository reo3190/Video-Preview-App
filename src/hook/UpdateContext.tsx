import {
  createContext,
  useCallback,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import { useNavigate, useLocation, To } from "react-router-dom";
// ---------------------------------------------------------

interface DataContext {
  windowSize: Electron.Rectangle;
  setWindowSize: (e: Electron.Rectangle) => void;
  load: boolean;
  setLoad: (e: boolean) => void;
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
  setCurVideo: (e: Video | null) => void;
  lastLoad: number;
  setLastLoad: (e: number) => void;
  imgCache: Map<string, string>;
  editImgCache: (mode: CacheMode, key: string, value?: string) => string | null;
  videoMetaCache: Map<string, [Size, FPS]>;
  editVideoMetaCache: (
    mode: CacheMode,
    key: string,
    value?: [Size, FPS]
  ) => [Size, FPS] | null;
  paintTool: PaintTool;
  setPaintTool: (tool: PaintToolName, update: Partial<PaintToolConfig>) => void;
  activePaintTool: PaintToolName;
  setActivePaintTool: (e: PaintToolName) => void;
  paintConfig: PaintConfig;
  setPaintConfig: (update: Partial<PaintConfig>) => void;
  videoMarkers: Markers;
  setVideoMarkers: (path: string, marker: Marker) => void;
  initVideoMarkers: (p: string, v: Video | null, vv: Video[]) => void;
  movPathCache: Map<string, string>;
  editMovPathCache: (
    mode: CacheMode,
    key: string,
    value?: string
  ) => string | null;
  outputFileName: string;
  setOutputFileName: (e: string) => void;
  outputFrameOffset: number;
  setOutputFrameOffset: (e: number) => void;
  context: ContextType;
}

const defaultContext: DataContext = {
  windowSize: { x: 0, y: 0, width: 0, height: 0 },
  setWindowSize: () => {},
  load: false,
  setLoad: () => {},
  inputPath: "",
  // inputPath: "",
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
  imgCache: new Map<string, string>(),
  editImgCache: () => null,
  videoMetaCache: new Map<string, [Size, FPS]>(),
  editVideoMetaCache: () => null,
  paintTool: {
    pen: { size: 10, color: "#000000", opacity: 1 },
    eraser: { size: 10, color: "", opacity: 1 },
    text: { size: 5, color: "#000000", opacity: 1 },
    clear: { size: 0, color: "", opacity: 0 },
    mouse: { size: 0, color: "", opacity: 0 },
  },
  setPaintTool: () => {},
  activePaintTool: "mouse",
  setActivePaintTool: () => {},
  paintConfig: { smooth: 0, pressure: 0 },
  setPaintConfig: () => {},
  videoMarkers: {},
  setVideoMarkers: () => {},
  initVideoMarkers: () => {},
  movPathCache: new Map<string, string>(),
  editMovPathCache: () => null,
  outputFileName: "",
  setOutputFileName: () => {},
  outputFrameOffset: 0,
  setOutputFrameOffset: () => {},
  context: {
    setLoad: () => {},
    initVideoMarkers: () => {},
    videoMarkers: {},
    editVideoMetaCache: () => null,
    editMovPathCache: () => null,
    navi: () => {},
    loc: null,
  },
};

const datactx = createContext<DataContext>(defaultContext);

export const useDataContext = () => useContext(datactx);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [windowSize, setWindowSize] = useState<Electron.Rectangle>(
    defaultContext.windowSize
  );
  const [load, setLoad] = useState<boolean>(defaultContext.load);
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
  const imgCache = useState<Map<string, string>>(new Map())[0];
  const videoMetaCache = useState<Map<string, [Size, FPS]>>(new Map())[0];
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
  const movPathCache = useState<Map<string, string>>(new Map())[0];
  const [outputFileName, setOutputFileName] = useState<string>(
    defaultContext.outputFileName
  );
  const [outputFrameOffset, setOutputFrameOffset] = useState<number>(
    defaultContext.outputFrameOffset
  );
  const [context, setContext] = useState<ContextType>(defaultContext.context);

  const updateWindowSize = useCallback((size: Electron.Rectangle): void => {
    setWindowSize(size);
  }, []);

  const updateLoad = useCallback((e: boolean): void => {
    setLoad(e);
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
    updateCurPage(0);
  }, []);

  const updateFilteredVideoList = useCallback((e: Video[]): void => {
    setFilteredVideoList(e);
  }, []);

  const updateCurPage = useCallback((e: number): void => {
    setCurPage(e);
  }, []);

  const updateCurVideo = useCallback((e: Video | null): void => {
    setCurVideo(e);
  }, []);

  const updateLastLoad = useCallback((e: number): void => {
    setLastLoad(e);
  }, []);

  const editImgCache = useCallback(
    (mode: CacheMode, key: string, value?: string): string | null => {
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
    [imgCache]
  );

  const editVideoMetaCache = useCallback(
    (mode: CacheMode, key: string, value?: [Size, FPS]): [Size, FPS] | null => {
      switch (mode) {
        case "add":
          if (!value) return null;
          videoMetaCache.set(key, value);
          return null;
        case "get":
          return videoMetaCache.get(key) || null;
        case "remove":
          videoMetaCache.delete(key);
          return null;
        case "clear":
          videoMetaCache.clear();
          return null;
      }
    },
    [videoMetaCache]
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

  const initVideoMarkers = useCallback(
    (p: string, v: Video | null, vv: Video[]) => {
      setVideoMarkers({});
      setInputPath(p);
      setCurVideo((pre) => (v ? v : pre));
      setVideoList(vv);
      // alert("これは警告メッセージです！");
    },
    []
  );

  const editMovPathCache = useCallback(
    (mode: CacheMode, key: string, value?: string): string | null => {
      switch (mode) {
        case "add":
          if (!value) return null;
          movPathCache.set(key, value);
          return null;
        case "get":
          return movPathCache.get(key) || null;
        case "remove":
          movPathCache.delete(key);
          return null;
        case "clear":
          movPathCache.clear();
          return null;
      }
    },
    [movPathCache]
  );

  const updateOutputFileName = useCallback((e: string): void => {
    setOutputFileName(e);
  }, []);

  const updateOutputFrameOffset = useCallback((e: number): void => {
    setOutputFrameOffset(e);
  }, []);

  const location = useLocation();
  const navigate = useNavigate();
  const navi = (s: String, reload: Boolean) => {
    const to = s as To;

    navigate(to, { state: { reload } });
  };

  useEffect(() => {
    setContext({
      setLoad: updateLoad,
      initVideoMarkers: initVideoMarkers,
      videoMarkers: videoMarkers,
      editVideoMetaCache: editVideoMetaCache,
      editMovPathCache: editMovPathCache,
      navi: navi,
      loc: location,
    });
  }, [videoMarkers, location]);

  return (
    <datactx.Provider
      value={{
        windowSize,
        setWindowSize: updateWindowSize,
        load,
        setLoad: updateLoad,
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
        imgCache,
        editImgCache,
        videoMetaCache,
        editVideoMetaCache,
        paintTool,
        setPaintTool: updatePaintTool,
        activePaintTool,
        setActivePaintTool: updateActivePaintTool,
        paintConfig,
        setPaintConfig: updatePaintConfig,
        videoMarkers,
        setVideoMarkers: updateVideoMarkers,
        initVideoMarkers,
        movPathCache,
        editMovPathCache,
        outputFileName,
        setOutputFileName: updateOutputFileName,
        outputFrameOffset,
        setOutputFrameOffset: updateOutputFrameOffset,
        context,
      }}
    >
      {children}
    </datactx.Provider>
  );
};

//----------------------------------------------------------------------------------------------------
