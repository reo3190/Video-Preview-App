import React, {
  useEffect,
  useRef,
  forwardRef,
  RefObject,
  useState,
} from "react";
import "video.js/dist/video-js.css";
import VideoPlayer from "./VideoPlayer";
import { useShortcutContext } from "../../../ctx/ShortCut";

type Props = {
  path: string;
  size?: number;
  onSeek: (frame: number) => void;
  markers: Marker;
  fps: number;
  onTimeUpdate?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  seq: Marker | null;
  seqVideos: string[] | null;
};

const Video = forwardRef<any, Props>(
  (
    {
      path,
      onSeek,
      onTimeUpdate,
      onPlay,
      onPause,
      markers,
      fps,
      seq,
      seqVideos,
    },
    ref
  ) => {
    // const { currentTime, setCurrentTime } = useDataContext();
    const { useKeybind, useKeybind_up } = useShortcutContext();
    const currentTime = 10;
    const setCurrentTime = () => {};
    const encodedUrl = path.replace(/#/g, "%23");
    const baseOptions = {
      controls: true,
      controlBar: {
        children: {
          progressControl: {},
          volumePanel: {
            inline: false,
          },
          fullscreenToggle: true,
        },
      },
      userActions: {
        hotkeys: false,
        doubleClick: false,
      },
      inactivityTimeout: 0,
      sources: [
        {
          src: "file://" + encodedUrl,
          type: "video/mp4",
        },
      ],
      loop: true,
    };
    const [videoJsOptions, setVideoJsOptions] = useState(baseOptions);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isKeyPressed = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const isMouseDown = useRef(false);

    const seekDownMarker = () => {
      const markerFrames = Object.keys(markers || {}).map(Number);
      const currentFrame = (ref as RefObject<any>).current?.getCurrentFrame();
      const lessCurrent = markerFrames.filter((num) => num < currentFrame);
      if (lessCurrent.length !== 0) {
        const next = Math.max(...lessCurrent);
        (ref as RefObject<any>).current?.setCurrentFrame(next);
      }
    };

    const seekUpMarker = () => {
      const markerFrames = Object.keys(markers || {}).map(Number);
      const currentFrame = (ref as RefObject<any>).current?.getCurrentFrame();
      const moreCurrent = markerFrames.filter((num) => num > currentFrame);
      if (moreCurrent.length !== 0) {
        const next = Math.min(...moreCurrent);
        (ref as RefObject<any>).current?.setCurrentFrame(next);
      }
    };

    const isSkip = () => {
      const activeElement = document.activeElement;

      return (
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true" ||
        isMouseDown.current
      );
    };

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (isSkip()) return;
        if (event.ctrlKey) return;

        if (
          (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
          !isKeyPressed.current
        ) {
          event.preventDefault();
          if (event.key === "ArrowLeft") {
            (ref as RefObject<any>).current?.seekDown();
          } else if (event.key === "ArrowRight") {
            (ref as RefObject<any>).current?.seekUp();
          }

          timerRef.current = setTimeout(() => {
            intervalRef.current = setInterval(() => {
              if (event.key === "ArrowLeft") {
                (ref as RefObject<any>).current?.seekDown();
              } else if (event.key === "ArrowRight") {
                (ref as RefObject<any>).current?.seekUp();
              }
            }, (1 / 12) * 1000);
          }, 300);

          isKeyPressed.current = true;
        }
      };

      const handleKeyUp = (event: KeyboardEvent) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          clearTimeout(timerRef.current!);
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          isKeyPressed.current = false;
        }
      };

      // マウスイベントリスナーを追加
      document.addEventListener("mousedown", () => {
        isMouseDown.current = true;
      });
      document.addEventListener("mouseup", () => {
        isMouseDown.current = false;
      });

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        clearTimeout(timerRef.current!);
        clearInterval(intervalRef.current!);
      };
    }, [ref, markers]);

    useKeybind({
      keybind: "SeekDownMarker",
      onKeyDown: () => {
        if (!isSkip()) seekDownMarker();
      },
    });

    useKeybind({
      keybind: "SeekUpMarker",
      onKeyDown: () => {
        if (!isSkip()) seekUpMarker();
      },
    });

    useKeybind({
      keybind: "ClickVideo",
      onKeyDown: () => {
        if (!isSkip()) (ref as RefObject<any>).current?.clickVideo();
      },
    });

    useKeybind({
      keybind: "VolumeUp",
      onKeyDown: () => {
        if (!isSkip()) (ref as RefObject<any>).current?.volumeUp();
      },
    });

    useKeybind({
      keybind: "VolumeDown",
      onKeyDown: () => {
        if (!isSkip()) (ref as RefObject<any>).current?.volumeDown();
      },
    });

    useKeybind({
      keybind: "Fullscreen",
      onKeyDown: () => {
        if (!isSkip()) (ref as RefObject<any>).current?.fullScreen();
      },
    });

    return (
      <>
        <VideoPlayer
          options={videoJsOptions}
          ref={ref}
          onTimeUpdate={onTimeUpdate}
          onPlay={onPlay}
          onPause={onPause}
          currentTime={currentTime}
          setCurrentTime={setCurrentTime}
          onSeek={onSeek}
          markers={markers}
          fps={fps}
          seekDownMarker={seekDownMarker}
          seekUpMarker={seekUpMarker}
          playlist={null}
          seqMarker={seq}
          seqVideos={seqVideos}
        />
      </>
    );
  }
);

export default Video;
