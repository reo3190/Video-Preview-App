import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
} from "react";
import videojs from "video.js";
// import Popcorn from "popcorn";
// import * as Popcorn from 'popcorn';
import { VideoFrame } from "./VideoFrame";
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
    const [frame, setFrame] = useState(0);
    const frameRef = useRef<number>(0);

    const [markers, setMarkers] = useState<number[]>([0.5, 1.0]);

    // Video.js 初期化
    useEffect(() => {
      if (!playerRef.current && videoRef.current) {
        const videoElement = document.createElement("video-js");
        videoElement.classList.add("vjs-big-play-centered");
        videoElement.setAttribute("id", "video");
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

        const videoFrame = new VideoFrame({
          id: "video_html5_api",
          frameRate: fps,
          callback: (frame: number) => {
            setFrame(frame);
          },
        });

        player.on("loadedmetadata", () => {
          if (!playerRef.current || !videoRef.current) return;
          const total = playerRef.current.duration();
          const p = getProgressBarElement();
          if (!p) return;

          for (var i = 0; i < markers.length; i++) {
            makeMarkerElement(p, markers[i]);
          }
        });
      }
    }, [options, videoRef]);

    useEffect(() => {
      return () => {
        if (playerRef.current) {
          playerRef.current.dispose();
        }
      };
    }, []);

    const seekUp = () => {
      if (playerRef.current) {
        const duration = playerRef.current.duration();
        const currentTime = playerRef.current.currentTime();

        if (duration !== undefined && currentTime !== undefined) {
          const seekTime = Math.min(duration, currentTime + 1.001 / fps);
          playerRef.current.currentTime(seekTime);
        }
      }
    };

    const seekDown = () => {
      if (playerRef.current) {
        const duration = playerRef.current.duration();
        const currentTime = playerRef.current.currentTime();

        if (duration !== undefined && currentTime !== undefined) {
          const seekTime = Math.max(0, currentTime - 1.001 / fps);
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
        console.log(playerRef.current.width());
      }
    };

    const getCurrentFrame = (): number => {
      return playerRef.current?.currentTime() || 0;
    };

    const getMarkers = () => {};

    const addMarker = (time: number = getCurrentFrame()) => {
      if (!playerRef.current || !videoRef.current) return;
      if (markers.includes(time)) return;
      setMarkers((pre) => [...pre, time]);
      const p = getProgressBarElement();
      if (p) {
        makeMarkerElement(p, time);
      }
    };

    const makeMarkerElement = (p: Element, time: number) => {
      if (!playerRef.current) return null;
      const total = playerRef.current.duration();
      const left = (time / (total || 1)) * 100 + "%";
      const el = document.createElement("div");
      el.className = "vjs-marker";
      el.style.left = left;
      el.setAttribute("data-time", String(time));
      p.append(el);
    };

    const getProgressBarElement = (): Element | null => {
      return (
        videoRef.current?.querySelector(
          ".vjs-control-bar .vjs-progress-control .vjs-progress-holder"
        ) || null
      );
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
        playerRef.current?.currentTime(duration);
      },
      getCurrentTime: () => playerRef.current?.currentTime() || 0,
      setCurrentTime: (time: number) => playerRef.current?.currentTime(time),
      getCurrentFrame: () => getCurrentFrame(),
      setWidth: (w: number) => setWidth(w),
      addMarker: (time: number) => addMarker(time),
    }));

    return (
      <>
        <div data-vjs-player>
          <div ref={videoRef} />
        </div>
        <div id="currentFrame">{frame}</div>
      </>
    );
  }
);

export default VideoPlayer;
