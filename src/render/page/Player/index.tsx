import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../../../hook/UpdateContext";
import Video from "../../Comp/Video";
import Canvas from "../../Comp/Canvas";
import ToolBar from "../../Comp/Canvas/toolBar";
import { CaptureDraw, CompositeImages } from "./util/capture";
import { handleSaveImages } from "./util/saveCaputure";
import { useLocation } from "react-router-dom";
import { onCheckOpen } from "../../../hook/useListener";
import { hasAnyHistory } from "../../../hook/api";

import {
  FaAngleLeft,
  FaAngleRight,
  FaAnglesLeft,
  FaAnglesRight,
} from "react-icons/fa6";
import { isErr, path2VideoType } from "../../../hook/api";

interface Size {
  w: number;
  h: number;
}

const Player = () => {
  // const location = useLocation();
  // const state = location.state?.res;

  const {
    curVideo,
    setCurVideo,
    windowSize,
    setWindowSize,
    setVideoList,
    setInputPath,
    videoMarkers,
    setVideoMarkers,
    editVideoMetaCache,
    __initVideoMarkers__,
    editMovPathCache,
  } = useDataContext();

  const navigate = useNavigate();
  const handleTop = () => {
    navigate("/");
  };

  if (!curVideo) {
    return <button onClick={() => handleTop()}>back</button>;
  }

  const metaData = editVideoMetaCache("get", curVideo.path);

  if (!metaData) {
    return <button onClick={() => handleTop()}>back</button>;
  }

  const videoRef: any = useRef(null);
  const canvasRef: any = useRef(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [markers, setMarkers] = useState<Marker>(videoMarkers[curVideo.path]);
  const [curFrame, setCurFrame] = useState<number>(1);
  const sizeRef = useRef<Size>(metaData[0]);
  const fpsRef = useRef<number>(metaData[1]);

  const path = editMovPathCache("get", curVideo.path) || curVideo.path;

  const seekUp = (ref: any) => ref.current?.seekUp();
  const seekDown = (ref: any) => ref.current?.seekDown();
  const seekToTop = (ref: any) => ref.current?.seekToTop();
  const seekToLast = (ref: any) => ref.current?.seekToLast();

  // useEffect(() => {
  //   if (curVideo.path in videoMarkers) return;
  //   setVideoMarkers(curVideo.path, {});
  // }, []);

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

    const removeListener = window.electron.onWindowResize(handleResize);

    return () => {
      removeListener();
    };
  }, [videoRef, canvasRef]);

  useEffect(() => {
    const saveImage = async () => {
      const markersRender: MarkersRender = await handleSaveImages(
        markers,
        curVideo.path,
        sizeRef.current,
        fpsRef.current
      );
      window.electron.saveCompositeImages(markersRender);
    };
    const removeListener = window.electron.onSaveImages(() => saveImage());

    handleSetMarkers();

    return () => {
      removeListener();
    };
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

  const enterFilePath = async (p: string) => {
    try {
      setVideoList([]);
      setInputPath("");
      __initVideoMarkers__();

      const cache = editVideoMetaCache("get", p);
      if (!cache) {
        const res = await window.electron.getVideoMeta(p);
        const size: Size = {
          w: res.streams[0].width,
          h: res.streams[0].height,
        };
        const str = res.streams[0].r_frame_rate;
        const parts = str.split("/");
        const fps: FPS =
          parts.length === 2 ? Number(parts[0]) / Number(parts[1]) : NaN;
        editVideoMetaCache("add", p, [size, fps]);
      }

      const video = path2VideoType(p);
      setCurVideo(video);

      navigate("/", { state: { reload: true } });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const enterFolderPath = async (p: string) => {
    try {
      const res = await window.electron.getVideoList(p);
      if (isErr(res)) return;
      setVideoList(res);
      setInputPath(p);
      __initVideoMarkers__();

      navigate("/");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // onOpenFile(enterFilePath);
  // onOpenFolder(enterFolderPath);

  const openFileFolder = async (id: "openFile" | "openDirectory") => {
    const res = await checkDialog();

    if (res === "yes") {
      const res = await window.electron.openFileFolder(id);
      if (id === "openFile") {
        enterFilePath(res);
      } else {
        enterFolderPath(res);
      }
    }
  };

  const checkDialog = async () => {
    let response: "yes" | "no" = "yes";
    console.log(videoMarkers);
    if (hasAnyHistory(videoMarkers)) {
      const userConfirmed = confirm("現在の描画履歴を削除しますか？");
      response = userConfirmed ? "yes" : "no";
    }

    return response;
  };

  onCheckOpen(openFileFolder);

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    const res = await checkDialog();
    if (res === "no") return;

    const item = event.dataTransfer.items[0];
    const entry = item.webkitGetAsEntry();
    if (!entry) return;
    const filepath = window.electron.showFilePath(event.dataTransfer.files[0]);
    console.log(filepath);

    if (entry.isFile) {
      enterFilePath(filepath);
    } else if (entry.isDirectory) {
      enterFolderPath(filepath);
    }
  };

  return (
    <>
      <div
        className="window"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => handleDrop(e)}
      >
        <button onClick={() => handleTop()}>back</button>

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
                // path={curVideo.path}
                path={path}
                size={windowSize.width}
                onSeek={handleSeekFrame}
                markers={markers}
                fps={fpsRef.current}
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
      </div>
    </>
  );
};

export default Player;
