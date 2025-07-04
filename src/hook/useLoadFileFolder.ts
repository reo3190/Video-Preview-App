import { isErr, hasAnyHistory, path2VideoType, loadFile } from "./api";

const enterFilePath = async (p: string, context: ContextType) => {
  try {
    const {
      setLoad,
      initVideoList,
      editVideoMetaCache,
      editMovPathCache,
      navi,
      loc,
    } = context;
    if (!loc) return;

    const video = path2VideoType(p);

    setLoad(true);
    await loadFile(editVideoMetaCache, editMovPathCache, video);
    initVideoList(p, video, [video]);
    if ((loc.pathname = "/play")) {
      navi("/", true);
    } else {
      navi("/play", false);
    }
  } catch (error) {
    context.setLoad(false);
  }
};

const enterFilePaths = async (list: string[], context: ContextType) => {
  try {
    const { setLoad, initVideoList, navi, setTab, loc } = context;
    if (!loc) return;

    const videoList = list.map((e) => {
      return path2VideoType(e);
    });

    setLoad(true);
    videoList.sort((x, y) => x.name.localeCompare(y.name));
    initVideoList(`${videoList.length} videos`, null, videoList);
    navi("/", false);
    setLoad(false);
    setTab("FOLDER");
  } catch (error) {
    context.setLoad(false);
  }
};

const enterFolderPath = async (p: string, context: ContextType) => {
  context.setLoad(true);
  const res = await window.electron.getVideoList(p);
  if (isErr(res)) return;
  res.sort((x, y) => x.name.localeCompare(y.name));

  context.initVideoList(p, null, res);
  context.navi("/", false);
  context.setLoad(false);
  context.setTab("FOLDER");
};

export const openFileFolder = async (
  id: OpenFileFolderType,
  context: ContextType,
  p: Path | null = null
) => {
  // const res = await checkDialog(context.videoMarkers);
  const res = "yes";
  if (res === "yes") {
    let path = p;
    if (!path) {
      path = await window.electron.openFileFolder(id);
    }

    if (id === "openFile") {
      enterFilePath(path, context);
    } else {
      enterFolderPath(path, context);
    }
    saveToLocalStorage(id, path);
  }
};

export const handleDrop = async (
  event: React.DragEvent<HTMLDivElement>,
  context: ContextType
) => {
  event.preventDefault();

  const item = event.dataTransfer.items[0];
  const entry = item.webkitGetAsEntry();
  if (!entry) return;
  const filepaths: string[] = [];
  const files = event.dataTransfer.files;
  for (let i = 0; i < files.length; i++) {
    const p = window.electron.showFilePath(files[i], entry.isFile);
    if (p) {
      filepaths.push(p);
    }
  }

  if (filepaths.length == 0) return;

  if (entry.isFile && filepaths.length == 1) {
    enterFilePath(filepaths[0], context);
    saveToLocalStorage("openFile", filepaths[0]);
  } else if (entry.isFile && event.dataTransfer.files.length > 1) {
    enterFilePaths(filepaths, context);
    filepaths.forEach((p) => saveToLocalStorage("openFile", p));
  } else if (entry.isDirectory) {
    enterFolderPath(filepaths[0], context);
    saveToLocalStorage("openDirectory", filepaths[0]);
  }
};

const saveToLocalStorage = (key: OpenFileFolderType, newPath: Path) => {
  const MAX_ITEMS = 20;
  const get = localStorage.getItem(key);
  let items = get ? (JSON.parse(get) as Path[]) : [];

  items = items.filter((item) => item !== newPath);
  items.unshift(newPath);

  if (items.length > MAX_ITEMS) {
    items.pop();
  }

  localStorage.setItem(key, JSON.stringify(items));
};

export const getFromLocalStorage = () => {
  const _file = localStorage.getItem("openFile");
  let files = _file ? (JSON.parse(_file) as Path[]) : [];

  const _folder = localStorage.getItem("openDirectory");
  let folders = _folder ? (JSON.parse(_folder) as Path[]) : [];

  return { files, folders };
};

export const reLoad = (path: Path, ctx: ContextType) => {
  const { folders } = getFromLocalStorage();
  if (folders.length > 0 && path == folders[0]) {
    openFileFolder("openDirectory", ctx, folders[0]);
  }
};
