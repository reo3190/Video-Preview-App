import React, { useEffect, useState } from "react";
import FormTop from "../../Comp/FormTop";
import VideoList from "../../Comp/VideoList";
import { useDataContext } from "../../../hook/UpdateContext";
import { handleSaveAllImages } from "./util/saveAllCaputure";
import { onCheckOpen } from "../../../hook/useListener";
import { isErr, path2VideoType, hasAnyHistory } from "../../../hook/api";
import { useNavigate, useLocation } from "react-router-dom";

const Top = () => {
  const {
    curVideo,
    setCurVideo,
    setInputPath,
    windowSize,
    setWindowSize,
    setVideoList,
    videoMarkers,
    videoMetaCache,
    editVideoMetaCache,
    __initVideoMarkers__,
  } = useDataContext();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state) {
      navigate("/play");
    }

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
      window.electron.saveCompositeImages(markersRender);
    };
    const removeListener = window.electron.onSaveAllImages(() => saveImage());
    return () => {
      removeListener();
    };
  }, [videoMarkers, videoMetaCache]);

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

      navigate("/play");
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
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // onOpenFile(enterFilePath);
  // onOpenFolder(enterPath);

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
        <FormTop />
        <VideoList />
      </div>
    </>
  );
};

export default Top;
