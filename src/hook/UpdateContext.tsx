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
}

const defaultContext: DataContext = {
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
};

const datactx = createContext<DataContext>(defaultContext);

export const useDataContext = () => useContext(datactx);

export const DataProvider = ({ children }: { children: ReactNode }) => {
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

  return (
    <datactx.Provider
      value={{
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
      }}
    >
      {children}
    </datactx.Provider>
  );
};

//----------------------------------------------------------------------------------------------------
