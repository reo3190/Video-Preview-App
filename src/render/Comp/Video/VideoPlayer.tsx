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
import { num2date, frame2time, time2frame, round } from "../../../hook/api";
import { useDataContext } from "../../../hook/UpdateContext";

// const fps = 24;

interface VideoPlayerProps {
  currentTime: number;
  onTimeUpdate?: (time: number) => void;
  setCurrentTime: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  options?: any;
  onSeek: (frame: number) => void;
  markers: Marker;
  fps: number;
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
    {
      currentTime,
      onTimeUpdate,
      setCurrentTime,
      onPlay,
      onPause,
      options,
      onSeek,
      markers,
      fps,
    },
    ref
  ) => {
    const { curVideo, videoMarkers } = useDataContext();
    if (!curVideo) return;

    const videoRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<Player | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const frameRef = useRef<number>(0);
    const [frame, setFrame] = useState<number>(1);

    const v = videoMarkers[curVideo.path];

    const [markerFrames, setMarkerFrames] = useState<number[]>(
      Object.keys(v || {}).map(Number)
    );

    // Video.js 初期化
    useEffect(() => {
      if (!playerRef.current && videoRef.current) {
        const videoElement = document.createElement("video-js");
        videoElement.classList.add("vjs-big-play-centered");
        videoElement.setAttribute("id", "video");
        videoRef.current.appendChild(videoElement);

        __init__(videoElement);
      }
    }, [videoRef]);

    useEffect(() => {
      if (playerRef.current) {
        playerRef.current.dispose(); // 既存のプレイヤーを破棄
        playerRef.current = null; // 参照をクリア
      }

      if (videoRef.current) {
        const videoElement = document.createElement("video-js");
        videoElement.classList.add("vjs-big-play-centered");
        videoElement.setAttribute("id", "video");
        videoRef.current.innerHTML = ""; // コンテナをクリア
        videoRef.current.appendChild(videoElement);

        __init__(videoElement); // 新しいビデオプレイヤーを初期化
      }
    }, [options, curVideo?.path]);

    const __init__ = (videoElement: HTMLElement) => {
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

      // player.on("timeupdate", () => {
      //   // onSeek(frameRef.current);
      // });

      const videoFrame = new VideoFrame({
        id: "video_html5_api",
        frameRate: fps,
        callback: (frame: number) => {
          frameRef.current = frame;
          setFrame(frame);
          setSlider(frame);
          onSeek(frameRef.current);
        },
      });

      player.on("loadedmetadata", () => {
        if (!playerRef.current || !videoRef.current) return;
        const total = playerRef.current.duration();
        const p = getProgressBarElement();
        if (!p) return;

        for (var i = 0; i < markerFrames.length; i++) {
          makeMarkerElement(p, markerFrames[i]);
        }

        const el = document.createElement("div");
        el.className = "vjs-marker-frame";
        const _total_float = (total || 1) * fps;
        const wid = (1 / _total_float) * 100;
        el.style.width = wid + "%";
        p.append(el);
      });
    };

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
          const seekTime = round(
            Math.min(duration, currentTime + frame2time(1, fps))
          );
          playerRef.current.currentTime(seekTime);
        }
      }
    };

    const seekDown = () => {
      if (playerRef.current) {
        const duration = playerRef.current.duration();
        const currentTime = playerRef.current.currentTime();

        if (duration !== undefined && currentTime !== undefined) {
          const seekTime = round(
            Math.max(0, round(currentTime) - frame2time(1, fps))
          );
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

    const getCurrentTime = (): number => {
      return playerRef.current?.currentTime() || 0;
    };

    const getCurrentFrame = (): number => {
      return frame;
    };

    const setCurrentFrame = (frame: number): void => {
      const halfFrameTime = frame2time(1, fps) / 2;
      const time = round(frame2time(frame, fps) - halfFrameTime);
      playerRef.current?.currentTime(time);
    };

    const addMarker = (frame: number = getCurrentFrame()) => {
      if (!playerRef.current || !videoRef.current) return;
      if (markerFrames.includes(frame)) return;
      setMarkerFrames((pre) => [...pre, frame]);
      const p = getProgressBarElement();
      if (p) {
        makeMarkerElement(p, frame);
      }
    };

    const removeMarker = (frame: number) => {
      if (!playerRef.current || !videoRef.current) return;
      if (!markerFrames.includes(frame)) return;
      setMarkerFrames((pre) => pre.filter((e) => e !== frame));
      removeMarkerElement(frame);
    };

    const makeMarkerElement = (p: Element, frame: number) => {
      if (!playerRef.current) return null;
      const totalTime = playerRef.current.duration() || 1;
      const total_float = totalTime * fps;
      const left = (frame / total_float) * 100;
      const el = document.createElement("div");
      el.className = "vjs-marker";
      const wid = (1 / total_float) * 100;
      el.style.left = left - wid + "%";
      el.style.width = wid + "%";
      el.setAttribute("data-time", String(frame));
      p.append(el);
    };

    const removeMarkerElement = (frame: number) => {
      if (!playerRef.current) return;
      const el = document.querySelector(`[data-time="${frame}"]`);
      el?.remove();
    };

    const getProgressBarElement = (): Element | null => {
      return (
        videoRef.current?.querySelector(
          ".vjs-control-bar .vjs-progress-control .vjs-progress-holder"
        ) || null
      );
    };

    const setSlider = (f: number) => {
      if (!playerRef.current) return null;
      const p = getSliderBarElement() as HTMLElement | null;
      if (!p) return;
      const totalTime = playerRef.current.duration() || 1;
      const total_float = totalTime * fps;
      const left = (f / total_float) * 100;
      const wid = (1 / total_float) * 100;
      p.style.left = left - wid + "%";
    };

    const getSliderBarElement = (): Element | null => {
      return videoRef.current?.querySelector(".vjs-marker-frame") || null;
    };

    const setPath = (path: string) => {
      if (playerRef.current) {
        playerRef.current.src({ src: path, type: "video/mp4" });
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
        playerRef.current?.currentTime(duration);
      },
      getCurrentTime: () => playerRef.current?.currentTime() || 0,
      setCurrentTime: (time: number) => playerRef.current?.currentTime(time),
      getCurrentFrame: () => getCurrentFrame(),
      setCurrentFrame: (f: number) => setCurrentFrame(f),
      setWidth: (w: number) => setWidth(w),
      addMarker: (time: number) => addMarker(time),
      removeMarker: (f: number) => removeMarker(f),
      setPath: (p: string) => setPath(p),
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
