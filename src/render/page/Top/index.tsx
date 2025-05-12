import React, { useEffect, useState } from "react";
import FormTop from "./comp/FormTop";
import VideoList from "../../Comp/VideoList";
import Progress from "../../Comp/Progress";
import { useDataContext } from "../../../hook/UpdateContext";
import { handleSaveAllImages } from "./util/saveAllCaputure";
import { onCheckOpen, onCheckOpenHistory } from "../../../hook/useListener";
import { openFileFolder, handleDrop } from "../../../hook/useLoadFileFolder";
import { useNavigate, useLocation, To } from "react-router-dom";
import { loadFile, getVideoIndex } from "../../../hook/api";

import { FaFolder } from "react-icons/fa";
import { RiEditBoxLine } from "react-icons/ri";

const Top = () => {
  const {
    tab,
    setLoad,
    windowSize,
    setWindowSize,
    videoMarkers,
    videoMetaCache,
    outputFileName,
    outputFrameOffset,
    context,
    filteredVideoList,
    filteredEditVideoList,
    curVideo,
    curPage,
    curPageEdit,
    editVideoList,
    setCurPage,
    setCurPageEdit,
    setTab,
    setCurVideo,
    editVideoMetaCache,
    editMovPathCache,
  } = useDataContext();

  const itemsPerPage = 20;
  const location = useLocation();
  const navigate = useNavigate();

  const [mask, setMask] = useState<Boolean>(true);

  const [progress, setProgress] = useState<number>(0);
  const [done, setDone] = useState<boolean>(true);

  useEffect(() => {
    if (location.state && location.state.reload) {
      navigate("/play");
    } else {
      setMask(false);
    }
    // const indexVideo = curVideo
    //   ? tab == "FOLDER"
    //     ? getVideoIndex(curVideo, filteredVideoList)
    //     : tab == "EDIT"
    //     ? getVideoIndex(curVideo, filteredEditVideoList)
    //     : null
    //   : null;
    // setCurPage(indexVideo ? Math.floor(indexVideo / itemsPerPage) : curPage);

    setLoad(false);

    const initWindowSize = async () => {
      const size = await window.electron.getWindowSize();
      setWindowSize(size);
    };
    if (windowSize.width === 0) {
      initWindowSize();
    }

    const handleResize = (size: Electron.Rectangle) => {
      setWindowSize(size);
    };

    const removeLister = window.electron.onWindowResize(handleResize);

    return () => {
      removeLister();
    };
  }, []);

  useEffect(() => {
    const saveImage = async () => {
      const nameList: Record<Path, string> = {};
      Object.keys(videoMarkers).map((key) => {
        const video = editVideoList.filter((e) => {
          return e.path == key;
        });
        if (video.length > 0) {
          nameList[key] = video[0].name;
        }
      });
      setDone(false);
      const markersRender: MarkersRender = await handleSaveAllImages(
        nameList,
        videoMarkers,
        videoMetaCache,
        setProgress
      );
      window.electron.saveCompositeImages(
        markersRender,
        outputFileName,
        outputFrameOffset
      );

      setDone(true);
    };
    const removeListener = window.electron.onSaveAllImages(() => saveImage());
    return () => {
      removeListener();
    };
  }, [videoMarkers, videoMetaCache, outputFileName, outputFrameOffset]);

  onCheckOpenHistory(
    (p: Path, id: OpenFileFolderType) => openFileFolder(id, context, p),
    context
  );

  onCheckOpen((id: OpenFileFolderType) => openFileFolder(id, context), context);

  // const ___reset = () => {
  //   localStorage.setItem("openFile", "");
  //   localStorage.setItem("openDirectory", "");
  //   console.log("reset");
  // };

  const handlePlay = async (e: any, video: Video) => {
    setLoad(true);
    await loadFile(editVideoMetaCache, editMovPathCache, video);
    setCurVideo(video);
    navigate("/play");
  };

  return (
    <>
      {!mask && (
        <div
          className="window top"
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => handleDrop(e, context)}
        >
          <div className="progress-wrapper">
            <Progress progress={progress} done={done} />
          </div>
          <div className="list-wrapper">
            <div className="tab-side">
              <div
                className={`tab-item ${tab == "FOLDER" ? "active" : ""}`}
                onClick={() => setTab("FOLDER")}
              >
                <FaFolder size={"2rem"} />
              </div>
              <div
                className={`tab-item ${tab == "EDIT" ? "active" : ""}`}
                onClick={() => setTab("EDIT")}
              >
                <RiEditBoxLine size={"2rem"} />
              </div>
            </div>
            <div className="list-side">
              <FormTop itemsPerPage={itemsPerPage} />
              {tab == "FOLDER" ? (
                <>
                  {/* {process.env.NODE_ENV === "development" && (
                <button onClick={() => ___reset()}>reset</button>
              )} */}
                  <VideoList
                    list={filteredVideoList}
                    curPage={curPage}
                    setCurPage={setCurPage}
                    itemsPerPage={itemsPerPage}
                    handleClick={handlePlay}
                  />
                </>
              ) : tab == "EDIT" ? (
                <>
                  <VideoList
                    list={filteredEditVideoList}
                    curPage={curPageEdit}
                    setCurPage={setCurPageEdit}
                    itemsPerPage={itemsPerPage}
                    handleClick={handlePlay}
                  />
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Top;
