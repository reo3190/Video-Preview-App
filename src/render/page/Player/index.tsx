import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDataContext } from "../../../hook/UpdateContext";
import { useShortcutContext } from "../../../ctx/ShortCut";
import Video from "../../Comp/Video";
import Canvas from "../../Comp/Canvas";
import ToolBar from "../../Comp/Canvas/toolBar";
import Progress from "../../Comp/Progress";
import { handleSaveImages } from "./util/saveCaputure";
import { onCheckOpen, onCheckOpenHistory } from "../../../hook/useListener";
import { openFileFolder, handleDrop } from "../../../hook/useLoadFileFolder";
import { IoArrowBack } from "react-icons/io5";
import { LuSquareChevronRight, LuSquareChevronLeft } from "react-icons/lu";
import { loadFile } from "../../../hook/api";

const Player = () => {
  const {
    setLoad,
    curVideo,
    setCurVideo,
    windowSize,
    setWindowSize,
    editVideoList,
    setEditVideoList,
    videoMarkers,
    setVideoMarkers,
    editVideoMetaCache,
    editMovPathCache,
    outputFileName,
    outputFrameOffset,
    context,
    tab,
    filteredVideoList,
    filteredEditVideoList,
    paintCopyboard,
    setPaintCopyboard,
  } = useDataContext();
  const { useKeybind } = useShortcutContext();

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
  const seqMarker = useRef<Marker | null>(curVideo.seq || null);
  const seqVideos = useRef<string[] | null>(curVideo.seqVideo || null);

  const path = editMovPathCache("get", curVideo.path) || curVideo.path;

  const [progress, setProgress] = useState<number>(0);
  const [done, setDone] = useState<boolean>(true);

  const [hoverItem, setHoverItem] = useState<{
    e: string | null;
    x: number;
    y: number;
  } | null>(null);

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
      setDone(false);
      const markersRender: MarkersRender = await handleSaveImages(
        curVideo.name,
        markers,
        curVideo.path,
        sizeRef.current,
        fpsRef.current,
        setProgress
      );
      window.electron.saveCompositeImages(
        markersRender,
        outputFileName,
        outputFrameOffset
      );
      setDone(true);
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
          id: Date.now(),
        });
      } else {
        canvasRef.current.overwriteHistory({
          history: [[]],
          index: 0,
          id: Date.now(),
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
    setMarkers((pre) => {
      const newDict = { ...pre };
      if (Object.keys(newDict).length === 0 && !curVideo.seq) {
        setEditVideoList([curVideo, ...editVideoList]);
      }

      return {
        ...pre,
        [frame]: [history, index, size || markers[frame][2] || { w: 0, h: 0 }],
      };
    });
    setCanDelete(true);
  };

  const handleRemoveMarker = () => {
    videoRef.current?.removeMarker(curFrame);
    canvasRef.current?.clear();
    canvasRef.current.overwriteHistory({
      history: [[]],
      index: 0,
      id: Date.now(),
    });
    setMarkers((pre) => {
      const newDict = { ...pre }; // オブジェクトをコピー
      delete newDict[curFrame]; // 指定されたキーを削除

      if (Object.keys(newDict).length === 0) {
        setEditVideoList(
          editVideoList.filter((e) => {
            return e != curVideo;
          })
        );
      }

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
    if (seqVideos.current) {
      if (seqVideos.current.length > 2) {
        const first = seqVideos.current[0];
        const last = seqVideos.current[seqVideos.current.length - 1];
        return "[ " + first + " ~ " + last + " ]";
      } else {
        return "[ " + seqVideos.current.join(" , ") + " ]";
      }
    } else {
      const parts = curVideo.path.split("\\");
      const str = parts.join("/");

      return str + "/";
    }
  };

  function getNextElement(target: Video, offset: number) {
    const arr =
      tab == "FOLDER"
        ? filteredVideoList
        : tab == "EDIT"
        ? filteredEditVideoList
        : [];
    const index = arr.indexOf(target);
    const next = index + offset;
    if (index !== -1 && 0 <= next && next < arr.length) {
      return arr[next];
    }
    return null; // 次の要素がない場合
  }

  const hoverNextBack = (
    el: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    offset: number
  ) => {
    const e = getNextElement(curVideo, offset);
    if (e) {
      setHoverItem({ e: e.name, x: el.clientX, y: el.clientY });
    }
  };

  const loadNextBack = async (offset: number) => {
    const video = getNextElement(curVideo, offset);
    if (video) {
      setLoad(true);
      await loadFile(editVideoMetaCache, editMovPathCache, video);
      setCurVideo(video);
      context.navi("/", true);
    }
  };

  const copyPaint = () => {
    const { history, index } = canvasRef.current.getHistory();
    setPaintCopyboard([history, index]);
  };

  const pastePaint = () => {
    const newId = Date.now();
    canvasRef.current.overwriteHistory({
      history: paintCopyboard[0],
      index: paintCopyboard[1],
    });

    handleAddMarker(paintCopyboard[0], paintCopyboard[1], sizeRef.current);
    // handleSetMarkers();
  };

  useKeybind({
    keybind: "NextVideo",
    onKeyDown: () => loadNextBack(1),
  });

  useKeybind({
    keybind: "PrevVideo",
    onKeyDown: () => loadNextBack(-1),
  });

  useKeybind({
    keybind: "CopyPaint",
    onKeyDown: () => copyPaint(),
  });

  useKeybind({
    keybind: "PastePaint",
    onKeyDown: () => pastePaint(),
  });

  return (
    <>
      <div
        className="window player"
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => handleDrop(e, context)}
      >
        <div className="progress-wrapper">
          <Progress progress={progress} done={done} />
        </div>
        <div className="player-head">
          <button className="back-button" onClick={() => handleTop()}>
            <IoArrowBack size={"2.5rem"} />
          </button>
          <div className="back-next">
            <button
              className="back-video"
              onClick={() => loadNextBack(-1)}
              onMouseEnter={(el) => hoverNextBack(el, -1)}
              onMouseMove={(el) => hoverNextBack(el, -1)}
              onMouseLeave={(el) => setHoverItem(null)}
              disabled={getNextElement(curVideo, -1) ? false : true}
            >
              <LuSquareChevronLeft size={"2.5rem"} />
            </button>
            <button
              className="next-video"
              onClick={() => loadNextBack(1)}
              onMouseEnter={(el) => hoverNextBack(el, 1)}
              onMouseMove={(el) => hoverNextBack(el, 1)}
              onMouseLeave={(el) => setHoverItem(null)}
              disabled={getNextElement(curVideo, 1) ? false : true}
            >
              <LuSquareChevronRight size={"2.5rem"} />
            </button>

            {hoverItem?.e && (
              <div
                className={`hover-tip`}
                style={{
                  left: hoverItem.x + 10,
                  top: hoverItem.y + 10,
                }}
              >
                {hoverItem.e}
              </div>
            )}
          </div>
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
                  seq={seqMarker.current}
                  seqVideos={seqVideos.current}
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
