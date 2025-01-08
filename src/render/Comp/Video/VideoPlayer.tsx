import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
} from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import { num2date } from "../../../hook/api";

const fps = 24;

interface VideoPlayerProps {
  currentTime: number;
  onTimeUpdate?: (time: number) => void;
  setCurrentTime: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  options?: any;
}

// 公開するメソッドの型
export interface VideoPlayerHandle {
  play: () => void;
  pause: () => void;
  seekToTop: () => void;
  seekToLast: () => void;
  setCurrentTime: (time: number) => void;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    { currentTime, onTimeUpdate, setCurrentTime, onPlay, onPause, options },
    ref
  ) => {
    const videoRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<Player | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Video.js 初期化
    useEffect(() => {
      if (!playerRef.current && videoRef.current) {
        const videoElement = document.createElement("video-js");
        videoElement.classList.add("vjs-big-play-centered");
        videoRef.current.appendChild(videoElement);
        const player = (playerRef.current = videojs(videoElement, options));

        player.on("seeking", () => {
          if (onTimeUpdate) {
            // onTimeUpdate(player.currentTime());
          } else {
            // setCurrentTime(player.currentTime());
          }
        });

        player.on("play", () => {
          setIsPlaying(true);
          if (onPlay) {
            onPlay();
          }
        });

        player.on("pause", () => {
          setIsPlaying(false);
          if (onPause) {
            onPause();
          }
          // setCurrentTime(player.currentTime());
        });
      }
    }, [options, videoRef]);

    const seekUp = () => {
      if (playerRef.current) {
        const duration = playerRef.current.duration();
        const currentTime = playerRef.current.currentTime();

        if (duration !== undefined && currentTime !== undefined) {
          const seekTime = Math.min(duration, currentTime + 1 / fps);
          playerRef.current.currentTime(seekTime);
        }
      }
    };

    const seekDown = () => {
      if (playerRef.current) {
        const duration = playerRef.current.duration();
        const currentTime = playerRef.current.currentTime();

        if (duration !== undefined && currentTime !== undefined) {
          const seekTime = Math.max(0, currentTime - 1 / fps);
          playerRef.current.currentTime(seekTime);
        }
      }
    };

    const clickVideo = () => {
      if (playerRef.current) {
        if (isPlaying) {
          playerRef.current?.pause();
        } else {
          playerRef.current?.play();
        }
      }
    };

    const setWidth = (w: number) => {
      if (playerRef.current) {
        playerRef.current.width(w);
      }
    };

    // 親コンポーネントに公開するメソッド
    useImperativeHandle(ref, () => ({
      play: () => playerRef.current?.play(),
      pause: () => playerRef.current?.pause(),
      clickVideo: () => clickVideo(),
      seekUp: () => seekUp(),
      seekDown: () => seekDown(),
      seekToTop: () => playerRef.current?.currentTime(0),
      seekToLast: () => {
        const duration = playerRef.current?.duration() || 0;
        playerRef.current?.currentTime(duration - 1 / fps);
      },
      getCurrentTime: () => playerRef.current?.currentTime() || 0,
      setCurrentTime: (time: number) => playerRef.current?.currentTime(time),
      setWidth: (w: number) => setWidth(w),
    }));

    return (
      <>
        <div data-vjs-player>
          <div ref={videoRef} />
        </div>
      </>
    );
  }
);

export default VideoPlayer;
