import React, { useEffect, useState } from "react";
import FormTop from "../../Comp/FormTop";
import VideoList from "../../Comp/VideoList";
import { useDataContext } from "../../../hook/UpdateContext";
import { handleSaveAllImages } from "./util/saveAllCaputure";
import { onCheckOpen, onCheckOpenHistory } from "../../../hook/useListener";
import { openFileFolder, handleDrop } from "../../../hook/useLoadFileFolder";
import { useNavigate, useLocation, To } from "react-router-dom";

const Top = () => {
  const {
    setLoad,
    windowSize,
    setWindowSize,
    videoMarkers,
    videoMetaCache,
    outputFileName,
    outputFrameOffset,
    context,
  } = useDataContext();

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      if (location.state.reload) {
        navigate("/play");
      }
    }

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
      const markersRender: MarkersRender = await handleSaveAllImages(
        videoMarkers,
        videoMetaCache
      );
      window.electron.saveCompositeImages(
        markersRender,
        outputFileName,
        outputFrameOffset
      );
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

  const ___reset = () => {
    localStorage.setItem("openFile", "");
    localStorage.setItem("openDirectory", "");
    console.log("reset");
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
        <FormTop />
        <button onClick={() => ___reset()}>reset</button>
        <VideoList />
      </div>
    </>
  );
};

export default Top;
