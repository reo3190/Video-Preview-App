import React, { forwardRef } from "react";
import "video.js/dist/video-js.css";
import Tooltips from "../Tooltips";
import { round } from "../../../hook/api";
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
import { MdErrorOutline } from "react-icons/md";

type Props = {
  frame: number;
  allFrame: Frame;
  isPlay: boolean;
  isSetTrimStart: Boolean;
  isSetTrimEnd: Boolean;
  seekDownMarker: () => void;
  seekUpMarker: () => void;
  meta: Meta;
};

const VideoUI = forwardRef<any, Props>(
  (
    {
      frame,
      allFrame,
      isPlay,
      isSetTrimStart,
      isSetTrimEnd,
      seekDownMarker,
      seekUpMarker,
      meta,
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

    return (
      <>
        <div className="video-ui-wrapper">
          <div className="meta-ui">
            <div>
              size = {meta.size.w} x {meta.size.h}
            </div>
            <div>codec = {meta.codec}</div>
            <div>pix_fmt = {meta.pix_fmt}</div>
          </div>
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
              {meta.pts != 0 && (
                <Tooltips
                  content={
                    <>
                      <div className="warn-icon">
                        <MdErrorOutline size={"1.8rem"} />
                      </div>
                    </>
                  }
                  pop_content={
                    <>
                      この動画は全フレームを再生
                      <br />
                      できない可能性があります。
                    </>
                  }
                  className="warn"
                  pop_size={{ w: 180, h: 50 }}
                />
              )}
              <div>
                {frame} / {allFrame}F
              </div>
            </div>
            <div className="fps">{`[${round(meta.fps)}]`}</div>
          </div>
        </div>
      </>
    );
  }
);

export default VideoUI;
