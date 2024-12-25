import React, { useRef, useEffect, useState, FC } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import VideoSeeker from "./seek";
import { IoReturnDownForwardSharp } from "react-icons/io5";
import { isErr } from "../../../hook/api";

interface Props {
  filePath: string;
}

const CahcheVideo: FC<Props> = ({ filePath }) => {
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const { editVideoCache, editImgCache } = useDataContext();

  const [img, setImg] = useState<string | null>(editImgCache("get", filePath));
  const [Loading, setLoading] = useState<boolean>(!img);

  useEffect(() => {
    const getImg = async () => {
      if (Loading) {
        const res = await window.electron.getThumbnail(filePath);
        if (isErr(res)) return;

        editImgCache("add", filePath, res);
        setImg(res);
      }
    };

    getImg();
  }, []);

  const handleImageLoad = () => {
    setLoading(false);
  };

  // useEffect(() => {
  //   const loadVideo = async () => {
  //     const hls = await window.electron.convert2HLS(filePath);
  //     if (isErr(hls)) return;
  //     console.log(hls);
  //     // const cachedBlob = editVideoCache("get", filePath);

  //     // if (cachedBlob) {
  //     //   console.log(`Loading video from cache: ${filePath}`);
  //     //   const url = URL.createObjectURL(cachedBlob);
  //     //   setVideoURL(url);
  //     //   console.log("loaded");
  //     // } else {
  //     console.log(`Loading video from file: ${filePath}`);
  //     // const response = await fetch(`file://${filePath}`);
  //     // const blob = await response.blob();
  //     console.log("loaded");

  //     // editVideoCache("add", filePath, blob);

  //     // const url = URL.createObjectURL(blob);
  //     setVideoURL(hls[filePath]);
  //     // }
  //   };

  //   loadVideo();

  //   return () => {
  //     if (videoURL) URL.revokeObjectURL(videoURL);
  //   };
  // }, [filePath]);

  return (
    <>
      <div
        style={{
          width: "250px",
          height: "140px",
          position: "relative",
          background: "#fff",
        }}
      >
        {Loading && <div className="placeholder">Loading...</div>}
        <img
          className={`frame-image ${Loading ? "loading" : "loaded"}`}
          src={"data:image/png;base64," + img}
          onLoad={handleImageLoad}
        />
        {/* <VideoSeeker path={filePath} src={filePath} /> */}
      </div>
    </>
  );
};

export default CahcheVideo;
