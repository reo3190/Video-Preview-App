export const isErr = (state: unknown): state is Err => {
  return typeof state === "object" && state !== null && "error" in state;
};

const findDate = (dir: string[]): string | null => {
  return dir.find((e) => /^[0-9]{6}$/.test(e)) || null;
};

const findCheck = (dir: string[]): string | null => {
  const target = ["_ok", "_r"];
  const check = target.filter((str) => dir.includes(str));

  if (check.length > 0) {
    return check[0];
  } else {
    return null;
  }
};

export const makeDateList = (videos: Video[]) => {
  const dateList: string[] = videos
    .map((e) => {
      const date = findDate(e.directory);
      return date || undefined;
    })
    .filter((v): v is string => !!v);

  const sortDateList = dateList.sort((a, b) => {
    return Number(b) - Number(a);
  });

  return Array.from(new Set(sortDateList));
};

export const Filter = (List: Video[], Filter: Filter): Video[] => {
  const filteredList = List.filter((e) => {
    const date = e.directory.includes(Filter.date) || Filter.date === "all";
    const check =
      e.directory.includes(Filter.check) ||
      (!e.directory.includes("_r") &&
        !e.directory.includes("_ok") &&
        Filter.check === "no") ||
      Filter.check === "all";
    const words = includeWords(e.name, Filter.wordList);
    return date && check && words;
  });

  return filteredList;
};

export const Filter4Edit = (
  List: Video[],
  Filter: Filter4Edit,
  videoMarkers: Markers
): Video[] => {
  switch (Filter.select) {
    case "all":
      const filteredList1 = List.filter((e) => {
        const words = includeWords(e.name, Filter.wordList);
        return words;
      });
      return filteredList1;
    case "paint":
      const filteredList2 = List.filter((e) => {
        const marker = videoMarkers[e.path] || {};
        const markerCount = Object.keys(marker).length;
        const paint = markerCount > 0;
        const words = includeWords(e.name, Filter.wordList);
        return paint && words;
      });
      return filteredList2;
    case "seq":
      const filteredList3 = List.filter((e) => {
        const seq = e.seq;
        const words = includeWords(e.name, Filter.wordList);
        return seq && words;
      });
      return filteredList3;
    case "all":
    default:
      const filteredList4 = List.filter((e) => {
        const words = includeWords(e.name, Filter.wordList);
        return words;
      });
      return filteredList4;
  }
};

const includeWords = (name: string, words: string[]): boolean => {
  if (words.length === 0) {
    return true;
  }
  return words.every((e) => name.includes(e));
};

export const round = (n: number): number => {
  const _n = Math.round(n * 1000);
  return _n / 1000;
};

export const frame2time = (frame: number, fps: number): number => {
  return round(frame / fps);
};

export const time2frame = (time: number, fps: number) => {
  return Math.floor(round(time * fps));
};

export const getVideoTag = (dir: string[]): VideoTag => {
  const date = findDate(dir);
  const check = findCheck(dir);

  return { date, check };
};

export const num2date = (value: string): string => {
  if (value.length !== 6) {
    return "";
  }

  const year = 2000 + parseInt(value.substring(0, 2));
  const month = parseInt(value.substring(2, 4));
  const day = parseInt(value.substring(4, 6));

  return `${year} / ${month} / ${day}`;
};

export const path2VideoType = (p: string): Video => {
  const directory = p.split("\\");
  const name = directory[directory.length - 1];
  const extension = "." + name.split(".").slice(-1)[0];
  return {
    name,
    path: p,
    extension,
    directory,
  };
};

export const hasAnyHistory = (data: Markers): boolean => {
  if (Object.keys(data).length === 0) {
    return false;
  }

  return Object.values(data).some((marker) => {
    return (
      marker != null &&
      (typeof marker !== "object" || Object.keys(marker).length > 0)
    );
  });
};

const mov2mp4 = async (video: Video): Promise<Path | null> => {
  if (video.extension !== ".mov") return null;
  const res = await window.electron.MOV2MP4(video.path);
  return res;
};

export const loadMeta = async (
  editVideoMetaCache: editVideoMetaCache,
  path: Path
) => {
  const cache = editVideoMetaCache("get", path);
  if (!cache) {
    const res = await window.electron.getVideoMeta(path);
    const size: Size = { w: res.streams[0].width, h: res.streams[0].height };
    const str = res.streams[0].r_frame_rate;
    const parts = str.split("/");
    const fps: FPS =
      parts.length === 2 ? Number(parts[0]) / Number(parts[1]) : NaN;
    const duration_str = res.format.duration;
    const duration: number = Number(duration_str);
    editVideoMetaCache("add", path, [size, fps, duration]);
  }
};

export const loadFile = async (
  editVideoMetaCache: editVideoMetaCache,
  editMovPathCache: editMovPathCache,
  video: Video
) => {
  const path = video.path;

  await loadMeta(editVideoMetaCache, path);

  const movPath = await mov2mp4(video);
  if (movPath) {
    editMovPathCache("add", path, movPath);
  }
};

export const iList2pList = (
  iList: number[],
  videoList: Video[],
  editMovPathCache: editMovPathCache
): Path[] => {
  const ret: Path[] = [];
  videoList.forEach((e, i) => {
    if (iList.includes(i)) {
      const movPath = editMovPathCache("get", e.path);
      if (movPath) {
        ret.push(movPath);
      } else {
        ret.push(e.path);
      }
    }
  });
  return ret;
};

export const getVideoIndex = (v: Video, list: Video[]) => {
  let ret = 0;
  list.forEach((e, i) => {
    if (e.path == v.path) {
      ret = i;
    }
  });
  return ret;
};
