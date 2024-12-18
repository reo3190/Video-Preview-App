export interface IElectronAPI {
  getVideoList: (e: string) => Promise<Video[] | Err>;
  getThumbnail: (e: string) => Promise<string | Err>;
  _getThumbnail: (e: string) => Promise<[string[], number] | Err>;
}

type Weaken<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? any : T[P];
};

declare global {
  interface Window {
    electron: IElectronAPI;
  }

  interface Video {
    name: string;
    path: string;
    extension: string;
    directory: string[];
    thumbnail: string;
  }

  interface Filter {
    date: string;
    dateList: string[];
    check: string;
    checkList: string[];
    wordInput: string;
    wordList: string[];
  }

  interface Succ {
    success: string;
  }

  interface Err {
    error: string;
    errorcode: string;
  }
}

export {};
