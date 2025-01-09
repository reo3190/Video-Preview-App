import React, { useEffect, useState } from "react";
import FormTop from "../../Comp/FormTop";
import VideoList from "../../Comp/VideoList";
import { useDataContext } from "../../../hook/UpdateContext";

const Top = () => {
  const { curVideo, windowSize, setWindowSize } = useDataContext();
  useEffect(() => {
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

    window.electron.onWindowResize(handleResize);

    return () => {
      window.electron.onWindowResize(() => {});
    };
  }, []);
  return (
    <>
      <FormTop />
      <VideoList />
    </>
  );
};

export default Top;
