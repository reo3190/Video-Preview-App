import React, { forwardRef } from "react";
import "video.js/dist/video-js.css";
import {
  FaAnglesLeft,
  FaAnglesRight,
  FaAngleLeft,
  FaAngleRight,
  FaPause,
  FaPlay,
} from "react-icons/fa6";
import {
  TbChevronLeftPipe,
  TbChevronRightPipe,
  TbBracketsOff,
  TbBracketsContainStart,
  TbBracketsContainEnd,
} from "react-icons/tb";
type Props = {
  fps: FPS;
  frame: number;
  allFrame: Frame;
  isPlay: boolean;
  isSetTrimStart: Boolean;
  isSetTrimEnd: Boolean;
  seekDownMarker: () => void;
  seekUpMarker: () => void;
};

const VideoUI = forwardRef<any, Props>(
  (
    {
      fps,
      frame,
      allFrame,
      isPlay,
      isSetTrimStart,
      isSetTrimEnd,
      seekDownMarker,
      seekUpMarker,
    },
    videoRef
  ) => {
    const seekUp = (ref: any) => ref.current?.seekUp();
    const seekDown = (ref: any) => ref.current?.seekDown();
    const seekToTop = (ref: any) => ref.current?.seekToTop();
    const seekToLast = (ref: any) => ref.current?.seekToLast();
    const play = (ref: any) => ref.current?.play();
    const pause = (ref: any) => ref.current?.pause();
    const setTrimStart = (ref: any) => ref.current?.setTrimStart();
    const setTrimEnd = (ref: any) => ref.current?.setTrimEnd();
    const cleanTrim = (ref: any) => ref.current?.cleanTrim();
    // const isSetTrimStart = (ref: any) => ref.current?.isSetTrimStart();
    // const isSetTrimEnd = (ref: any) => ref.current?.isSetTrimEnd();

    return (
      <>
        <div className="video-ui-wrapper">
          <div className="marker-button-wrapper">
            <button className="seekButton" onClick={() => seekDownMarker()}>
              <TbChevronLeftPipe size={"2rem"} />
            </button>
            <button className="seekButton" onClick={() => seekUpMarker()}>
              <TbChevronRightPipe size={"2rem"} />
            </button>
          </div>
          <div className="trim-button-wrapper">
            <button
              className={`seekButton ${isSetTrimStart && "active"}`}
              onClick={() => setTrimStart(videoRef)}
            >
              <TbBracketsContainStart size={"2rem"} />
            </button>
            <button
              className={`seekButton ${isSetTrimEnd && "active"}`}
              onClick={() => setTrimEnd(videoRef)}
            >
              <TbBracketsContainEnd size={"2rem"} />
            </button>
            <button className="seekButton" onClick={() => cleanTrim(videoRef)}>
              <TbBracketsOff size={"2rem"} />
            </button>
          </div>
          <div className="button-wrapper">
            <button className="seekButton" onClick={() => seekToTop(videoRef)}>
              <FaAnglesLeft size={"2rem"} />
            </button>
            <button className="seekButton" onClick={() => seekDown(videoRef)}>
              <FaAngleLeft size={"2rem"} />
            </button>
            {isPlay ? (
              <button className="seekButton" onClick={() => pause(videoRef)}>
                <FaPause size={"2rem"} />
              </button>
            ) : (
              <button className="seekButton" onClick={() => play(videoRef)}>
                <FaPlay size={"2rem"} />
              </button>
            )}

            <button className="seekButton" onClick={() => seekUp(videoRef)}>
              <FaAngleRight size={"2rem"} />
            </button>
            <button className="seekButton" onClick={() => seekToLast(videoRef)}>
              <FaAnglesRight size={"2rem"} />
            </button>
          </div>
          <div className="fps-wrapper">
            <div className="seek-frame">
              {frame} / {allFrame}F
            </div>
            <div className="fps">{`[${fps}]`}</div>
          </div>
        </div>
      </>
    );
  }
);

export default VideoUI;
