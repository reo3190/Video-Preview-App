import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
} from "react";
import videojs from "video.js";
import { VideoFrame } from "./VideoFrame";
import Player from "video.js/dist/types/player";
import { frame2time, time2frame, round } from "../../../hook/api";
import { useDataContext } from "../../../hook/UpdateContext";
import VideoUI from "./VideoUI";

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
  seekDownMarker: () => void;
  seekUpMarker: () => void;
  playlist: videojsSource[] | null;
  seqMarker: Marker | null;
  seqVideos: string[] | null;
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
      onTimeUpdate,
      onPlay,
      onPause,
      options,
      onSeek,
      fps,
      seekDownMarker,
      seekUpMarker,
      seqMarker,
      seqVideos,
    },
    ref
  ) => {
    const {
      curVideo,
      videoMarkers,
      masterVolume,
      setMasterVolume,
      muted,
      setMuted,
    } = useDataContext();
    if (!curVideo) return;

    const videoRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<Player | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const isPlayRef = useRef<boolean>(false);
    const frameRef = useRef<number>(0);
    const [currFrame, setCurrFrame] = useState<number>(1);
    const [allFrame, setAllFrame] = useState<number>(1);

    const [trimStart, setTrimStart] = useState<boolean>(false);
    const [trimEnd, setTrimEnd] = useState<boolean>(false);

    const trimStartRef = useRef<number | null>(null);
    const trimEndRef = useRef<number | null>(null);

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

      // player.on("seeking", () => {});

      player.on("play", () => {
        setIsPlaying(true);
        isPlayRef.current = true;
        if (onPlay) {
          onPlay();
        }
      });

      player.on("pause", () => {
        setIsPlaying(false);
        isPlayRef.current = false;
        if (onPause) {
          onPause();
        }
      });

      player.on("volumechange", function () {
        setMasterVolume(player.volume() || 1.0);
        setMuted(player.muted() || false);
      });

      // player.on("timeupdate", () => {
      //   // onSeek(frameRef.current);
      //   const ctime = player.currentTime();
      //   const dtime = player.duration();

      //   if (ctime != undefined && dtime && trimStart && trimEnd) {
      //     if (ctime > trimEnd) {
      //       player.currentTime(trimStart);
      //     }
      //   }
      // });

      const videoFrame = new VideoFrame({
        id: "video_html5_api",
        frameRate: fps,
        callback: (frame: number, time: number) => {
          frameRef.current = frame;
          setCurrFrame(round(frame));
          setSlider(frame);
          onSeek(frameRef.current);

          const dtime = player.duration();
          if (dtime && isPlayRef.current) {
            if (trimStartRef.current != null && trimEndRef.current != null) {
              if (time > trimEndRef.current) {
                player.currentTime(trimStartRef.current);
              } else if (time < trimStartRef.current) {
                player.currentTime(trimStartRef.current);
              }
            }
            //  else if (trimStartRef.current != null) {
            //   if (time < trimStartRef.current) {
            //     player.currentTime(trimStartRef.current);
            //   }
            // } else if (trimEndRef.current != null) {
            //   if (time > trimEndRef.current) {
            //     player.currentTime(0);
            //   }
            // }
          }
        },
      });

      player.on("loadedmetadata", () => {
        if (!playerRef.current || !videoRef.current) return;
        const total = playerRef.current.duration();
        const p = getProgressBarElement();
        if (!p) return;

        for (var i = 0; i < markerFrames.length; i++) {
          makeMarkerElement(p, markerFrames[i], "paint");
        }

        const el = document.createElement("div");
        el.className = "vjs-marker-frame";
        const _total_float = Math.round(round((total || 1) * fps));
        const wid = (1 / _total_float) * 100;
        el.style.width = wid + "%";
        el.style.minWidth = "5px";
        p.append(el);

        setAllFrame(_total_float);

        if (seqMarker && seqVideos) {
          console.log(seqMarker);
          const seqFrames = Object.keys(seqMarker || {}).map(Number);
          seqFrames.sort((a, b) => a - b);

          for (var i = 0; i < seqFrames.length; i++) {
            const className = i % 2 == 0 ? "odd" : "eve";
            if (i + 1 >= seqFrames.length) {
              makeSequenceElement(
                p,
                seqVideos[i],
                className,
                seqFrames[i],
                _total_float
              );
            } else {
              makeSequenceElement(
                p,
                seqVideos[i],
                className,
                seqFrames[i],
                seqFrames[i + 1] - 1
              );
            }
          }
        }

        // ------
        player.volume(masterVolume);
        player.muted(muted);
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
          const next = time2frame(seekTime, fps) + 1;
          if (next <= allFrame) {
            playerRef.current.currentTime(seekTime);
          }
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

    const getSize = (): Size | null => {
      if (playerRef.current) {
        const w = playerRef.current.width();
        const h = playerRef.current.height();
        if (w && h) {
          return { w: w, h: h };
        }
      }
      return null;
    };

    const getCurrentTime = (): number => {
      return playerRef.current?.currentTime() || 0;
    };

    const getCurrentFrame = (): number => {
      return currFrame;
    };

    const setCurrentFrame = (frame: number): void => {
      const halfFrameTime = frame2time(1, fps) / 2;
      const time = round(frame2time(frame, fps) - halfFrameTime);
      playerRef.current?.currentTime(time);
    };

    const volumeUp = () => {
      if (playerRef.current) {
        const current = playerRef.current.volume();

        if (current != undefined) {
          const next = Math.min(current + 0.1, 1.0);
          playerRef.current.volume(next);
        }
      }
    };

    const volumeDown = () => {
      if (playerRef.current) {
        const current = playerRef.current.volume();
        if (current) {
          const next = Math.max(current - 0.1, 0.0);
          playerRef.current.volume(next);
        }
      }
    };

    const addMarker = (frame: number = getCurrentFrame()) => {
      if (!playerRef.current || !videoRef.current) return;
      if (markerFrames.includes(frame)) return;
      setMarkerFrames((pre) => [...pre, frame]);
      const p = getProgressBarElement();
      if (p) {
        makeMarkerElement(p, frame, "paint");
      }
    };

    const removeMarker = (frame: number) => {
      if (!playerRef.current || !videoRef.current) return;
      if (!markerFrames.includes(frame)) return;
      setMarkerFrames((pre) => pre.filter((e) => e !== frame));
      removeMarkerElement(frame);
    };

    const makeMarkerElement = (
      p: Element,
      frame: number,
      type: "paint" | "seq"
    ) => {
      if (!playerRef.current) return null;
      const totalTime = playerRef.current.duration() || 1;
      const total_float = totalTime * fps;
      const left = (frame / total_float) * 100;
      const el = document.createElement("div");
      el.className =
        type == "paint"
          ? "vjs-marker"
          : type == "seq"
          ? "vjs-seq-marker"
          : "err";
      const wid = (1 / total_float) * 100;
      el.style.left = left - wid + "%";
      el.style.width = wid + "%";
      el.style.minWidth = "5px";
      el.setAttribute("data-time", String(frame));
      p.append(el);
    };

    const makeTrimElement = (
      p: Element,
      frame: number,
      type: "trimS" | "trimE"
    ) => {
      if (!playerRef.current) return null;
      removeTrimElement(type);

      const totalTime = playerRef.current.duration() || 1;
      const total_float = totalTime * fps;
      const left = (frame / total_float) * 100;
      const right = ((total_float - frame) / total_float) * 100;
      const el = document.createElement("div");
      el.className =
        type == "trimS"
          ? "vjs-trims-marker"
          : type == "trimE"
          ? "vjs-trime-marker"
          : "err";
      const wid = (1 / total_float) * 100;
      if (type == "trimS") el.style.left = "0";
      if (type == "trimE") el.style.right = "0";
      el.style.width = type == "trimS" ? left - wid + "%" : right + "%";
      el.style.minWidth = "5px";
      // el.setAttribute("data-time-trim", String(frame));
      p.append(el);
    };

    const removeMarkerElement = (frame: number) => {
      if (!playerRef.current) return;
      const el = document.querySelector(`[data-time="${frame}"]`);
      el?.remove();
    };

    const removeTrimElement = (type: "trimS" | "trimE") => {
      if (!playerRef.current) return;
      if (type == "trimS") {
        const el1 = document.querySelector(`.vjs-trims-marker`);
        el1?.remove();
      } else if (type == "trimE") {
        const el2 = document.querySelector(`.vjs-trime-marker`);
        el2?.remove();
      }
    };

    const makeSequenceElement = (
      p: Element,
      popupText: string,
      className: string,
      start: number,
      end: number
    ) => {
      if (!playerRef.current) return null;
      const totalTime = playerRef.current.duration() || 1;
      const total_float = totalTime * fps;
      const left = (start / total_float) * 100;
      const el = document.createElement("div");
      el.className = `vjs-seq-marker ${className}`;
      const wid = ((end - start) / total_float) * 100;
      const _wid = (1 / total_float) * 100;
      // const wid = 5;

      el.style.left = left - _wid + "%";
      el.style.width = wid + _wid + "%";
      el.style.minWidth = "5px";
      // el.setAttribute("data-time", String(frame));

      const popup = document.createElement("div");
      popup.className = "vjs-seq-marker-popup";
      popup.textContent = popupText;
      if (left <= 50) {
        popup.style.left = "0";
      } else {
        popup.style.right = "0";
      }

      el.appendChild(popup);

      p.append(el);
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
        const d = allFrame - currFrame;
        for (let i = 0; i < d; i++) {
          seekUp();
        }
      },
      setTrimStart: () => {
        setTrimStart(true);
        trimStartRef.current = playerRef.current?.currentTime() ?? null;
        const p = getProgressBarElement();
        if (p) {
          const time = playerRef.current?.currentTime() ?? 0;
          makeTrimElement(p, time2frame(time, fps) + 1, "trimS");
        }
      },
      setTrimEnd: () => {
        setTrimEnd(true);
        trimEndRef.current = playerRef.current?.currentTime() ?? null;
        const p = getProgressBarElement();
        if (p) {
          const time = playerRef.current?.currentTime() ?? 0;
          makeTrimElement(p, time2frame(time, fps) + 1, "trimE");
        }
      },
      cleanTrim: () => {
        trimStartRef.current = null;
        trimEndRef.current = null;
        removeTrimElement("trimS");
        removeTrimElement("trimE");
        setTrimStart(false);
        setTrimEnd(false);
      },
      isSetTrimStart: () => {
        return trimStartRef.current;
      },
      isSetTrimEnd: () => {
        return trimEndRef.current;
      },
      volumeUp: () => volumeUp(),
      volumeDown: () => volumeDown(),
      fullScreen: () => {
        if (playerRef.current?.isFullscreen()) {
          playerRef.current?.exitFullscreen();
        } else {
          playerRef.current?.requestFullscreen();
        }
      },
      getCurrentTime: () => playerRef.current?.currentTime() ?? 0,
      setCurrentTime: (time: number) => playerRef.current?.currentTime(time),
      getCurrentFrame: () => getCurrentFrame(),
      setCurrentFrame: (f: number) => setCurrentFrame(f),
      setWidth: (w: number) => setWidth(w),
      getSize: () => getSize(),
      addMarker: (time: number) => addMarker(time),
      removeMarker: (f: number) => removeMarker(f),
      setPath: (p: string) => setPath(p),
    }));

    return (
      <>
        <div data-vjs-player>
          <div ref={videoRef} />
        </div>
        <VideoUI
          fps={round(fps)}
          frame={currFrame}
          allFrame={allFrame}
          isPlay={isPlaying}
          isSetTrimStart={trimStart}
          isSetTrimEnd={trimEnd}
          seekDownMarker={seekDownMarker}
          seekUpMarker={seekUpMarker}
          ref={ref}
        />
      </>
    );
  }
);

export default VideoPlayer;
