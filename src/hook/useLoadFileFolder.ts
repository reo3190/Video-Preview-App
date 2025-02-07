import { isErr, hasAnyHistory, path2VideoType, loadFile } from "./api";

const enterFilePath = async (p: string, context: ContextType) => {
  try {
    const {
      setLoad,
      initVideoMarkers,
      editVideoMetaCache,
      editMovPathCache,
      navi,
      loc,
    } = context;
    if (!loc) return;

    const video = path2VideoType(p);

    setLoad(true);
    await loadFile(editVideoMetaCache, editMovPathCache, video);
    initVideoMarkers(p, video, [video]);
    if ((loc.pathname = "/play")) {
      navi("/", true);
    } else {
      navi("/play", false);
    }
  } catch (error) {
    context.setLoad(false);
  }
};

const enterFolderPath = async (p: string, context: ContextType) => {
  const res = await window.electron.getVideoList(p);
  if (isErr(res)) return;
  context.initVideoMarkers(p, null, res);
  context.navi("/", false);
};

const checkDialog = async (videoMarkers: Markers) => {
  if (hasAnyHistory(videoMarkers)) {
    return confirm("現在の描画履歴を削除しますか？") ? "yes" : "no";
  }
  return "yes";
};

export const openFileFolder = async (
  id: OpenFileFolderType,
  context: ContextType,
  p: Path | null = null
) => {
  const res = await checkDialog(context.videoMarkers);
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

  const res = await checkDialog(context.videoMarkers);
  if (res === "no") return;

  const item = event.dataTransfer.items[0];
  const entry = item.webkitGetAsEntry();
  if (!entry) return;
  const filepath = window.electron.showFilePath(event.dataTransfer.files[0]);

  if (entry.isFile) {
    enterFilePath(filepath, context);
  } else if (entry.isDirectory) {
    enterFolderPath(filepath, context);
  }
  saveToLocalStorage(entry.isFile ? "openFile" : "openDirectory", filepath);
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
