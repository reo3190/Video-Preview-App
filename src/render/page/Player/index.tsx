import React, { useEffect, useState, useRef } from "react";
import { useNavigate, To } from "react-router-dom";
import { useDataContext } from "../../../hook/UpdateContext";
import Video from "../../Comp/Video";
import Canvas from "../../Comp/Canvas";
import ToolBar from "../../Comp/Canvas/toolBar";
import { handleSaveImages } from "./util/saveCaputure";
import { onCheckOpen, onCheckOpenHistory } from "../../../hook/useListener";
import { openFileFolder, handleDrop } from "../../../hook/useLoadFileFolder";
import { IoArrowBack } from "react-icons/io5";

const Player = () => {
  const {
    setLoad,
    curVideo,
    windowSize,
    setWindowSize,
    videoMarkers,
    setVideoMarkers,
    editVideoMetaCache,
    initVideoMarkers,
    editMovPathCache,
    outputFileName,
    outputFrameOffset,
    context,
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

  const outerRef = useRef<HTMLDivElement | null>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  const [markers, setMarkers] = useState<Marker>(videoMarkers[curVideo.path]);
  const [curFrame, setCurFrame] = useState<number>(1);
  const sizeRef = useRef<Size>(metaData[0]);
  const fpsRef = useRef<number>(metaData[1]);

  const path = editMovPathCache("get", curVideo.path) || curVideo.path;

  useEffect(() => {
    setLoad(false);
  }, [curVideo]);

  useEffect(() => {
    const handleResize = (size: Electron.Rectangle) => {
      setWindowSize(size);
      setSize();
    };

    const setSize = () => {
      if (outerRef.current) {
        const outerAsp =
          outerRef.current.clientWidth / outerRef.current.clientHeight;
        const videoAsp = sizeRef.current.w / sizeRef.current.h;

        if (videoAsp >= outerAsp) {
          videoRef.current.setWidth(outerRef.current?.clientWidth);
          canvasRef.current.setSize({
            w: outerRef.current.clientWidth,
            h: (outerRef.current?.clientWidth || 100) / videoAsp,
          });
        } else {
          const wid = outerRef.current?.clientHeight * videoAsp;
          videoRef.current.setWidth(wid);
          canvasRef.current.setSize({
            w: wid,
            h: (wid || 100) / videoAsp,
          });
        }
      }
    };

    const initSize = async () => {
      const size = await window.electron.getWindowSize();
      setWindowSize(size);
      setSize();
    };

    initSize();

    const removeListener = window.electron.onWindowResize(handleResize);

    return () => {
      removeListener();
    };
  }, [videoRef, canvasRef, outerRef]);

  useEffect(() => {
    const saveImage = async () => {
      const markersRender: MarkersRender = await handleSaveImages(
        markers,
        curVideo.path,
        sizeRef.current,
        fpsRef.current
      );
      window.electron.saveCompositeImages(
        markersRender,
        outputFileName,
        outputFrameOffset
      );
    };
    const removeListener = window.electron.onSaveImages(() => saveImage());

    handleSetMarkers();

    return () => {
      removeListener();
    };
  }, [markers, outputFileName, outputFrameOffset]);

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

      setCanDelete(videoMarkers[curVideo.path][curFrame] ? true : false);
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
    setCanDelete(true);
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
    setCanDelete(false);
  };

  onCheckOpenHistory(
    (p: Path, id: OpenFileFolderType) => openFileFolder(id, context, p),
    context
  );

  onCheckOpen((id: OpenFileFolderType) => openFileFolder(id, context), context);

  const getDirectory = () => {
    const parts = curVideo.path.split("\\");
    const _parts = parts.pop();
    const str = parts.join("/");

    return str + "/";
  };

  return (
    <>
      <div
        className="window"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => handleDrop(e, context)}
      >
        <div className="player-head">
          <button className="back-button" onClick={() => handleTop()}>
            <IoArrowBack size={"2.5rem"} />
          </button>
          <div className="video-path-wrapper">
            <div className="video-path">{getDirectory()}</div>
            <div className="video-name">{curVideo.name}</div>
          </div>
        </div>
        <div className="player-wrapper">
          <div className="tool-bar-outer">
            <ToolBar
              pRef={canvasRef}
              canUndo={canUndo}
              canRedo={canRedo}
              canDelete={canDelete}
              removeMarker={handleRemoveMarker}
            />
          </div>
          <div className="canvas-video" ref={outerRef}>
            <div className="canvas-video-inner">
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
                  path={path}
                  size={windowSize.width}
                  onSeek={handleSeekFrame}
                  markers={markers}
                  fps={fpsRef.current}
                  ref={videoRef}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Player;
