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
  tab: TabType;
  setTab: (e: TabType) => void;
  //Folder
  filter: Filter;
  setFilter: (update: Partial<Filter>) => void;
  videoList: Video[];
  setVideoList: (e: Video[]) => void;
  filteredVideoList: Video[];
  setFilteredVideoList: (e: Video[]) => void;
  //Edit
  filter4edit: Filter4Edit;
  setFilter4Edit: (update: Partial<Filter4Edit>) => void;
  editVideoList: Video[];
  setEditVideoList: (e: Video[]) => void;
  filteredEditVideoList: Video[];
  setFilteredEditVideoList: (e: Video[]) => void;
  //
  curPage: number;
  setCurPage: (e: number) => void;
  curPageEdit: number;
  setCurPageEdit: (e: number) => void;
  curVideo: Video | null;
  setCurVideo: (e: Video | null) => void;
  lastLoad: number;
  setLastLoad: (e: number) => void;
  imgCache: Map<string, string>;
  editImgCache: (mode: CacheMode, key: string, value?: string) => string | null;
  videoMetaCache: Map<string, [Size, FPS, number]>;
  editVideoMetaCache: (
    mode: CacheMode,
    key: string,
    value?: [Size, FPS, number]
  ) => [Size, FPS, number] | null;
  paintTool: PaintTool;
  setPaintTool: (tool: PaintToolName, update: Partial<PaintToolConfig>) => void;
  activePaintTool: PaintToolName;
  setActivePaintTool: (e: PaintToolName) => void;
  paintConfig: PaintConfig;
  setPaintConfig: (update: Partial<PaintConfig>) => void;
  paintCopyboard: [PaintElement[][], number];
  setPaintCopyboard: (e: [PaintElement[][], number]) => void;
  videoMarkers: Markers;
  setVideoMarkers: (path: string, marker: Marker) => void;
  initVideoMarker: () => void;
  resetVideoMarker: (p: string) => void;
  initVideoList: (p: string, v: Video | null, vv: Video[]) => void;
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
  masterVolume: number;
  setMasterVolume: (e: number) => void;
  muted: boolean;
  setMuted: (e: boolean) => void;
}

const defaultContext: DataContext = {
  windowSize: { x: 0, y: 0, width: 0, height: 0 },
  setWindowSize: () => {},
  load: false,
  setLoad: () => {},
  inputPath: "",
  setInputPath: () => {},
  tab: "FOLDER",
  setTab: () => {},
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
  filter4edit: {
    select: "all",
    wordInput: "",
    wordList: [],
  },
  setFilter4Edit: () => {},
  editVideoList: [],
  setEditVideoList: () => {},
  filteredEditVideoList: [],
  setFilteredEditVideoList: () => {},
  curPage: 0,
  setCurPage: () => {},
  curPageEdit: 0,
  setCurPageEdit: () => {},
  curVideo: null,
  setCurVideo: () => {},
  lastLoad: 0,
  setLastLoad: () => {},
  imgCache: new Map<string, string>(),
  editImgCache: () => null,
  videoMetaCache: new Map<string, [Size, FPS, number]>(),
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
  paintCopyboard: [[[]], 0],
  setPaintCopyboard: () => {},
  videoMarkers: {},
  setVideoMarkers: () => {},
  initVideoMarker: () => {},
  resetVideoMarker: () => {},
  initVideoList: () => {},
  movPathCache: new Map<string, string>(),
  editMovPathCache: () => null,
  outputFileName: "",
  setOutputFileName: () => {},
  outputFrameOffset: 0,
  setOutputFrameOffset: () => {},
  context: {
    setLoad: () => {},
    initVideoList: () => {},
    videoMarkers: {},
    editVideoMetaCache: () => null,
    editMovPathCache: () => null,
    navi: () => {},
    loc: null,
    setCurVideo: () => {},
    setTab: () => {},
  },
  masterVolume: 1,
  setMasterVolume: () => {},
  muted: false,
  setMuted: () => {},
};

const datactx = createContext<DataContext>(defaultContext);

export const useDataContext = () => useContext(datactx);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [windowSize, setWindowSize] = useState<Electron.Rectangle>(
    defaultContext.windowSize
  );
  const [load, setLoad] = useState<boolean>(defaultContext.load);
  const [inputPath, setInputPath] = useState<string>(defaultContext.inputPath);
  const [tab, setTab] = useState<TabType>(defaultContext.tab);
  const [filter, setFilter] = useState<Filter>(defaultContext.filter);
  const [videoList, setVideoList] = useState<Video[]>(defaultContext.videoList);
  const [filteredVideoList, setFilteredVideoList] = useState<Video[]>(
    defaultContext.filteredVideoList
  );
  const [filter4edit, setFilter4Edit] = useState<Filter4Edit>(
    defaultContext.filter4edit
  );
  const [editVideoList, setEditVideoList] = useState<Video[]>(
    defaultContext.editVideoList
  );
  const [filteredEditVideoList, setFilteredEditVideoList] = useState<Video[]>(
    defaultContext.filteredEditVideoList
  );
  const [curPage, setCurPage] = useState<number>(defaultContext.curPage);
  const [curPageEdit, setCurPageEdit] = useState<number>(
    defaultContext.curPageEdit
  );
  const [curVideo, setCurVideo] = useState<Video | null>(
    defaultContext.curVideo
  );
  const [lastLoad, setLastLoad] = useState<number>(defaultContext.lastLoad);
  const imgCache = useState<Map<string, string>>(new Map())[0];
  const videoMetaCache = useState<Map<string, [Size, FPS, number]>>(
    new Map()
  )[0];
  const [paintTool, setPaintTool] = useState<PaintTool>(
    defaultContext.paintTool
  );
  const [activePaintTool, setActivePaintTool] = useState<PaintToolName>(
    defaultContext.activePaintTool
  );
  const [paintConfig, setPaintConfig] = useState<PaintConfig>(
    defaultContext.paintConfig
  );
  const [paintCopyboard, setPaintCopyboard] = useState<
    [PaintElement[][], number]
  >(defaultContext.paintCopyboard);
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

  const [masterVolume, setMasterVolume] = useState<number>(
    defaultContext.masterVolume
  );

  const [muted, setMuted] = useState<boolean>(defaultContext.muted);

  const updateWindowSize = useCallback((size: Electron.Rectangle): void => {
    setWindowSize(size);
  }, []);

  const updateLoad = useCallback((e: boolean): void => {
    setLoad(e);
  }, []);

  const updateInputPath = useCallback((path: string): void => {
    setInputPath(path);
  }, []);

  const updateTab = useCallback((e: TabType): void => {
    setTab(e);
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

  const updateFiltere4Edit = useCallback(
    (update: Partial<Filter4Edit>): void => {
      setFilter4Edit((prev) => ({
        ...prev,
        ...update,
      }));
    },
    []
  );

  const updateEditVideoList = useCallback((e: Video[]): void => {
    setEditVideoList(e);
  }, []);

  const updateFilteredEditVideoList = useCallback((e: Video[]): void => {
    setFilteredEditVideoList(e);
  }, []);

  const updateCurPage = useCallback((e: number): void => {
    setCurPage(e);
  }, []);

  const updateCurPageEdit = useCallback((e: number): void => {
    setCurPageEdit(e);
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
    (
      mode: CacheMode,
      key: string,
      value?: [Size, FPS, number]
    ): [Size, FPS, number] | null => {
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

  const updatePaintCopyboard = useCallback(
    (e: [PaintElement[][], number]): void => {
      setPaintCopyboard(e);
    },
    []
  );

  const updateVideoMarkers = useCallback((path: string, marker: Marker) => {
    setVideoMarkers((pre) => {
      return { ...pre, [path]: marker };
    });
  }, []);

  const initVideoMarker = useCallback(() => setVideoMarkers({}), []);

  const resetVideoMarker = useCallback(
    (path: string) =>
      setVideoMarkers((pre) => {
        const newDict = { ...pre };
        delete newDict[path];
        return newDict;
      }),
    []
  );

  const initVideoList = useCallback(
    (p: string, v: Video | null, vv: Video[]) => {
      // setVideoMarkers({});
      setInputPath(p);
      setCurVideo((pre) => (v ? v : pre));
      setCurPage(0);
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
      initVideoList: initVideoList,
      videoMarkers: videoMarkers,
      editVideoMetaCache: editVideoMetaCache,
      editMovPathCache: editMovPathCache,
      navi: navi,
      loc: location,
      setCurVideo: updateCurVideo,
      setTab: updateTab,
    });
  }, [videoMarkers, location]);

  const updateMasterVolume = useCallback((e: number): void => {
    setMasterVolume(e);
  }, []);

  const updateMuted = useCallback((e: boolean): void => {
    setMuted(e);
  }, []);

  return (
    <datactx.Provider
      value={{
        windowSize,
        setWindowSize: updateWindowSize,
        load,
        setLoad: updateLoad,
        inputPath,
        setInputPath: updateInputPath,
        tab,
        setTab: updateTab,
        filter,
        setFilter: updateFilter,
        videoList,
        setVideoList: updateVideoList,
        filteredVideoList,
        setFilteredVideoList: updateFilteredVideoList,
        filter4edit,
        setFilter4Edit: updateFiltere4Edit,
        editVideoList,
        setEditVideoList: updateEditVideoList,
        filteredEditVideoList,
        setFilteredEditVideoList: updateFilteredEditVideoList,
        curPage,
        setCurPage: updateCurPage,
        curPageEdit,
        setCurPageEdit: updateCurPageEdit,
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
        paintCopyboard,
        setPaintCopyboard: updatePaintCopyboard,
        videoMarkers,
        setVideoMarkers: updateVideoMarkers,
        initVideoMarker,
        resetVideoMarker,
        initVideoList,
        movPathCache,
        editMovPathCache,
        outputFileName,
        setOutputFileName: updateOutputFileName,
        outputFrameOffset,
        setOutputFrameOffset: updateOutputFrameOffset,
        context,
        masterVolume,
        setMasterVolume: updateMasterVolume,
        muted,
        setMuted: updateMuted,
      }}
    >
      {children}
    </datactx.Provider>
  );
};

//----------------------------------------------------------------------------------------------------
