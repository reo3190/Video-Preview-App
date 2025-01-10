import React, { useEffect, useRef, forwardRef, Ref, RefObject } from "react";
import "video.js/dist/video-js.css";
import VideoPlayer from "./VideoPlayer";
import Videojs from "./VideoPlayer";
// import { useDataContext } from "../../hook/useContext";

type VideoUIProps = {
  path: string;
  size?: number;
  onSeek: (frame: number) => void;
  markers: Marker;
  onTimeUpdate?: (time: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
};

const Video = forwardRef<any, VideoUIProps>(
  ({ path, onSeek, onTimeUpdate, onPlay, onPause, size, markers }, ref) => {
    // const { currentTime, setCurrentTime } = useDataContext();
    const currentTime = 10;
    const setCurrentTime = () => {};
    const videoJsOptions = {
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
          src: `file://${path}`,
          // src: path,
          // type: "application/x-mpegURL",
          type: "video/mp4",
        },
      ],
      width: size ?? 100,
      loop: true,
    };

    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isKeyPressed = useRef(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          (event.key === "ArrowLeft" || event.key === "ArrowRight") &&
          !isKeyPressed.current &&
          document.body.style.overflowY !== "hidden"
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
            // if (event.key === "ArrowRight") {
            //   (ref as RefObject<any>).current?.play();
            // }
          }, 300);

          isKeyPressed.current = true;
        }

        if (event.key === " " && document.body.style.overflowY !== "hidden") {
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

          // (ref as RefObject<any>).current?.pause();
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
    }, [ref]);

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
        />
      </>
    );
  }
);

export default Video;
