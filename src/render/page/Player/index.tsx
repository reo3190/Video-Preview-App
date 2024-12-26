import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../../../hook/UpdateContext";
import Video from "../../Comp/Video";
import Canvas from "../../Comp/Canvas";

import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from "react-icons/fa6";

const Player = () => {
  const { curVideo } = useDataContext();
  const videoRef: any = useRef(null);

  const navigate = useNavigate();
  const handleTop = () => {
    navigate("/");
  };

  const seekUp = (ref: any) => ref.current?.seekUp();
  const seekDown = (ref: any) => ref.current?.seekDown();
  const seekToTop = (ref: any) => ref.current?.seekToTop();
  const seekToLast = (ref: any) => ref.current?.seekToLast();

  return (
    <>
      <button onClick={() => handleTop()}>back</button>
      {curVideo && (
        <>
          <Canvas
            calcBrightness={() => 0}
            toolState={{
              tool: "pen",
              size: 10,
              color: "#000000",
              opacity: 1.0,
            }}
            paintConfig={{ smooth: 0, pressure: 1 }}
            setCanUndo={() => true}
            setCanRedo={() => true}
          />
          <Video path={curVideo.path} size={800} ref={videoRef} />
          <div className="button-wrapper">
            <button className="seekButton" onClick={() => seekToTop(videoRef)}>
              <FaAnglesLeft size={"1.5rem"} />
            </button>
            <button className="seekButton" onClick={() => seekDown(videoRef)}>
              <FaAngleLeft size={"1.5rem"} />
            </button>
            <button className="seekButton" onClick={() => seekUp(videoRef)}>
              <FaAngleRight size={"1.5rem"} />
            </button>
            <button className="seekButton" onClick={() => seekToLast(videoRef)}>
              <FaAnglesRight size={"1.5rem"} />
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Player;
