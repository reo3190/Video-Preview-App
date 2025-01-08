import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../../../hook/UpdateContext";
import Video from "../../Comp/Video";
import Canvas from "../../Comp/Canvas";
import ToolBar from "../../Comp/Canvas/toolBar";

import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from "react-icons/fa6";
import { sign } from "crypto";

interface Size {
  w: number;
  h: number;
}

const Player = () => {
  const { curVideo, windowSize, setWindowSize } = useDataContext();
  const videoRef: any = useRef(null);
  const canvasRef: any = useRef(null);

  const navigate = useNavigate();
  const handleTop = () => {
    navigate("/");
  };

  const seekUp = (ref: any) => ref.current?.seekUp();
  const seekDown = (ref: any) => ref.current?.seekDown();
  const seekToTop = (ref: any) => ref.current?.seekToTop();
  const seekToLast = (ref: any) => ref.current?.seekToLast();

  useEffect(() => {
    const handleResize = (size: Electron.Rectangle) => {
      setWindowSize(size);
      console.log(size);
      videoRef.current?.setWidth(size.width - 100);
      canvasRef.current?.setSize({
        w: size.width - 100,
        h: ((size.width - 100) / 16) * 9,
      });
    };

    window.electron.onWindowResize(handleResize);

    return () => {
      window.electron.onWindowResize(() => {});
    };
  }, []);

  return (
    <>
      <button onClick={() => handleTop()}>back</button>
      {curVideo ? (
        <div className="player-wrapper">
          <div className="tool-bar-outer">
            <ToolBar pRef={null} canUndo={true} canRedo={true} />
          </div>
          <div className="canvas-video">
            <div className="canvas-wrapper">
              <Canvas size={windowSize.width} ref={canvasRef} />
            </div>
            <div className="video-container">
              <Video
                path={curVideo.path}
                size={windowSize.width}
                ref={videoRef}
              />
              <div className="button-wrapper">
                <button
                  className="seekButton"
                  onClick={() => seekToTop(videoRef)}
                >
                  <FaAnglesLeft size={"1.5rem"} />
                </button>
                <button
                  className="seekButton"
                  onClick={() => seekDown(videoRef)}
                >
                  <FaAngleLeft size={"1.5rem"} />
                </button>
                <button className="seekButton" onClick={() => seekUp(videoRef)}>
                  <FaAngleRight size={"1.5rem"} />
                </button>
                <button
                  className="seekButton"
                  onClick={() => seekToLast(videoRef)}
                >
                  <FaAnglesRight size={"1.5rem"} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>None Video</div>
      )}
    </>
  );
};

export default Player;
