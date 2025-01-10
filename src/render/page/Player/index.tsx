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

interface Size {
  w: number;
  h: number;
}

const Player = () => {
  const { curVideo, windowSize, setWindowSize, videoMarkers, setVideoMarkers } =
    useDataContext();

  const navigate = useNavigate();
  const handleTop = () => {
    navigate("/");
  };

  if (!curVideo) {
    return <button onClick={() => handleTop()}>back</button>;
  }

  const videoRef: any = useRef(null);
  const canvasRef: any = useRef(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [markers, setMarkers] = useState<Marker>(videoMarkers[curVideo.path]);
  const [curFrame, setCurFrame] = useState<number>(1);

  const getCurHistory = (frame: number): PaintElement[][] => {
    if (curVideo?.path) {
      if (curVideo.path in videoMarkers) {
        const vm = videoMarkers[curVideo.path];
        if (vm && frame in vm) {
          return vm[frame];
        }
      }
    }

    return [[]];
  };

  const seekUp = (ref: any) => ref.current?.seekUp();
  const seekDown = (ref: any) => ref.current?.seekDown();
  const seekToTop = (ref: any) => ref.current?.seekToTop();
  const seekToLast = (ref: any) => ref.current?.seekToLast();

  useEffect(() => {
    () => {
      if (curVideo.path in videoMarkers) return;
      setVideoMarkers(curVideo.path, {});
    };

    const handleResize = (size: Electron.Rectangle) => {
      setWindowSize(size);
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

  useEffect(() => {
    handleSetMarkers();
  }, [markers]);

  const handleSetMarkers = () => {
    setVideoMarkers(curVideo.path, markers);
  };

  useEffect(() => {
    if (videoMarkers[curVideo?.path]) {
      if (curFrame in videoMarkers[curVideo?.path]) {
        const history = videoMarkers[curVideo?.path][curFrame];
        canvasRef.current.overwriteHistory({
          history: history,
          index: history.length - 1,
        });
      } else {
        canvasRef.current.overwriteHistory({
          history: [[]],
          index: 0,
        });
      }
    }
  }, [curFrame]);

  const handleSeekFrame = (frame: number) => {
    setCurFrame(frame);
  };

  const handleAddMarker = (history: PaintElement[][]) => {
    videoRef.current?.addMarker();
    setMarkers((pre) => ({
      ...pre,
      [videoRef.current.getCurrentFrame()]: history,
    }));
  };

  return (
    <>
      <button onClick={() => handleTop()}>back</button>

      <div className="player-wrapper">
        <div className="tool-bar-outer">
          <ToolBar pRef={canvasRef} canUndo={canUndo} canRedo={canRedo} />
        </div>
        <div className="canvas-video">
          <div className="canvas-wrapper">
            <Canvas
              setCanUndo={setCanUndo}
              setCanRedo={setCanRedo}
              onDraw={handleAddMarker}
              ref={canvasRef}
            />
          </div>
          <div className="video-container">
            <Video
              path={curVideo.path}
              size={windowSize.width}
              onSeek={handleSeekFrame}
              markers={markers}
              ref={videoRef}
            />

            <div className="button-wrapper">
              <button
                className="seekButton"
                onClick={() => seekToTop(videoRef)}
              >
                <FaAnglesLeft size={"1.5rem"} />
              </button>
              <button className="seekButton" onClick={() => seekDown(videoRef)}>
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
    </>
  );
};

export default Player;
