import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../../../hook/UpdateContext";
import Video from "../../Comp/Video";
import Canvas from "../../Comp/Canvas";
import ToolBar from "../../Comp/Canvas/toolBar";
import { CaptureDraw, CompositeImages } from "./capture";
import { useLocation } from "react-router-dom";

import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from "react-icons/fa6";
import { isErr } from "../../../hook/api";

interface Size {
  w: number;
  h: number;
}

const Player = () => {
  const location = useLocation();
  const state = location.state?.res;

  const { curVideo, windowSize, setWindowSize, videoMarkers, setVideoMarkers } =
    useDataContext();

  const navigate = useNavigate();
  const handleTop = () => {
    navigate("/");
  };

  if (!curVideo || !state) {
    return <button onClick={() => handleTop()}>back</button>;
  }

  const videoRef: any = useRef(null);
  const canvasRef: any = useRef(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [markers, setMarkers] = useState<Marker>(videoMarkers[curVideo.path]);
  const [curFrame, setCurFrame] = useState<number>(1);
  const sizeRef = useRef<Size>({
    w: state.streams[0].width,
    h: state.streams[0].height,
  });
  const str = state.streams[0].r_frame_rate;
  const parts = str.split("/");
  const result = parts.length === 2 ? Number(parts[0]) / Number(parts[1]) : NaN;
  const fpsRef = useRef<number>(result);

  const seekUp = (ref: any) => ref.current?.seekUp();
  const seekDown = (ref: any) => ref.current?.seekDown();
  const seekToTop = (ref: any) => ref.current?.seekToTop();
  const seekToLast = (ref: any) => ref.current?.seekToLast();

  useEffect(() => {
    if (curVideo.path in videoMarkers) return;
    setVideoMarkers(curVideo.path, {});
  }, []);

  useEffect(() => {
    const handleResize = (size: Electron.Rectangle) => {
      setWindowSize(size);
      videoRef.current?.setWidth(size.width - 100);
      canvasRef.current?.setSize({
        w: size.width - 100,
        h: (size.width - 100) * (sizeRef.current.h / sizeRef.current.w),
      });
    };

    const setSize = async () => {
      const size = await window.electron.getWindowSize();
      setWindowSize(size);
      videoRef.current?.setWidth(size.width - 100);
      canvasRef.current?.setSize({
        w: size.width - 100,
        h: (size.width - 100) * (sizeRef.current.h / sizeRef.current.w),
      });
    };
    setSize();

    window.electron.onWindowResize(handleResize);

    return () => {
      window.electron.onWindowResize(() => {});
    };
  }, [videoRef, canvasRef]);

  const round = (n: number): number => {
    const _n = Math.round(n * 1000);
    return _n / 1000;
  };

  useEffect(() => {
    const handleSaveImages = async () => {
      const frames = Object.keys(markers || {}).map(Number);

      const saveData =
        // await Promise.all(
        frames.map((e) => {
          const canvas = CaptureDraw(sizeRef.current, markers[e]);
          console.log(round(e / fpsRef.current - 1 / fpsRef.current / 2));
          return {
            frame: e,
            sec: round((e - 1) / fpsRef.current),
            paint: canvas,
          };
        });
      // );

      const res = await window.electron.getCaputureData(
        curVideo.path,
        saveData
      );

      const comp = await Promise.all(
        saveData.map(async (d) => {
          const frame = d.frame;
          const base64 = await CompositeImages(res[frame], d.paint);
          return { [d.frame]: base64 }; // 各フレーム番号とbase64を持つオブジェクトを返す
        })
      );

      // 結果をオブジェクトに変換
      const compObject = comp.reduce((acc, item) => {
        const [key, value] = Object.entries(item)[0]; // 1つのキーと値を取得
        acc[Number(key)] = value; // オブジェクトに追加
        return acc;
      }, {});

      window.electron.saveCompositeImages(curVideo.path, compObject);

      console.log(comp);
    };

    const removeListener = window.electron.onSaveImages(handleSaveImages);

    return () => {
      // window.electron.onSaveImages(() => {});
      removeListener();
    };
  }, [markers]);

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
          history: history[0],
          index: history[1],
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

  const handleAddMarker = (
    history: PaintElement[][],
    index: number,
    size?: Size
  ) => {
    videoRef.current?.addMarker();
    const frame = videoRef.current.getCurrentFrame();
    setMarkers((pre) => ({
      ...pre,
      [frame]: [history, index, size || markers[frame][2] || { w: 0, h: 0 }],
    }));
  };

  const handleRemoveMarker = () => {
    videoRef.current?.removeMarker(curFrame);
    canvasRef.current?.clear();
    canvasRef.current.overwriteHistory({
      history: [[]],
      index: 0,
    });
    setMarkers((pre) => {
      const newDict = { ...pre }; // オブジェクトをコピー
      delete newDict[curFrame]; // 指定されたキーを削除
      return newDict; // 新しい状態を返す
    });
  };

  return (
    <>
      <button onClick={() => handleTop()}>back</button>
      <button
        onClick={async () => {
          const res = await window.electron.getVideoMeta(curVideo.path);
          console.log(res);
        }}
      >
        test
      </button>

      <div className="player-wrapper">
        <div className="tool-bar-outer">
          <ToolBar
            pRef={canvasRef}
            canUndo={canUndo}
            canRedo={canRedo}
            removeMarker={handleRemoveMarker}
          />
        </div>
        <div className="canvas-video">
          <div className="canvas-wrapper">
            <Canvas
              baseSize={sizeRef.current}
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
