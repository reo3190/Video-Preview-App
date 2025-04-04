import videojs from "video.js";
import Player from "video.js/dist/types/player";

declare module "video.js" {
  export interface Player {
    playlist: (
      playlistArray: { sources: { src: string; type: string }[] }[]
    ) => void;
    playlistAutoadvance: (delay: number) => void;
  }
}
