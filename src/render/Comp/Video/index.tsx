import React, {
  useEffect,
  useRef,
  forwardRef,
  Ref,
  RefObject,
  useState,
} from "react";
import "video.js/dist/video-js.css";
import VideoPlayer from "./VideoPlayer";
import Videojs from "./VideoPlayer";
// import { useDataContext } from "../../hook/useContext";

type VideoUIProps = {
  path: string;
  size?: number;
  onSeek: (frame: number) => void;
  markers: Marker;
  fps: number;
  onTimeUpdate?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
};

const Video = forwardRef<any, VideoUIProps>(
  ({ path, onSeek, onTimeUpdate, onPlay, onPause, markers, fps }, ref) => {
    // const { currentTime, setCurrentTime } = useDataContext();
    const currentTime = 10;
    const setCurrentTime = () => {};
    const baseOptions = {
      controls: true,
      controlBar: {
        children: {
          playToggle: {},
          progressControl: {},
          currentTimeDisplay: {},
          timeDivider: {},
          durationDisplay: {},
          remainingTimeDisplay: {},
          volumePanel: {
            inline: false,
          },
          fullscreenToggle: {},
        },
      },
      userActions: {
        hotkeys: true,
        doubleClick: false,
      },
      inactivityTimeout: 0,
      sources: [
        {
          // src: "",
          src: `file://${path}`,
          type: "video/mp4",
        },
      ],
      // width: size ?? 100,
      loop: true,
    };
    const [videoJsOptions, setVideoJsOptions] = useState(baseOptions);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isKeyPressed = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey || event.metaKey) {
          if (event.key === "ArrowLeft") {
            const markerFrames = Object.keys(markers || {}).map(Number);
            const currentFrame = (
              ref as RefObject<any>
            ).current?.getCurrentFrame();
            const lessCurrent = markerFrames.filter(
              (num) => num < currentFrame
            );
            if (lessCurrent.length !== 0) {
              const next = Math.max(...lessCurrent);
              console.log(next);
              (ref as RefObject<any>).current?.setCurrentFrame(next);
            }
          }
          if (event.key === "ArrowRight") {
            const markerFrames = Object.keys(markers || {}).map(Number);
            const currentFrame = (
              ref as RefObject<any>
            ).current?.getCurrentFrame();
            const moreCurrent = markerFrames.filter(
              (num) => num > currentFrame
            );
            if (moreCurrent.length !== 0) {
              const next = Math.min(...moreCurrent);
              console.log(next);
              (ref as RefObject<any>).current?.setCurrentFrame(next);
            }
          }
        } else if (
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

        if (event.key === " ") {
          event.preventDefault();
          (ref as RefObject<any>).current?.clickVideo();
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

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("keyup", handleKeyUp);
        clearTimeout(timerRef.current!);
        clearInterval(intervalRef.current!);
      };
    }, [ref, markers]);

    // useEffect(() => {
    //   setVideoJsOptions((pre) => ({
    //     ...pre,
    //     sources: [
    //       {
    //         src: `file://${path}`,
    //         type: "video/mp4",
    //       },
    //     ],
    //   }));
    // }, [path]);

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
        />
      </>
    );
  }
);

export default Video;
