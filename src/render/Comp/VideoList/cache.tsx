import React, { useRef, useEffect, useState, FC } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import VideoSeeker from "./seek";

interface Props {
  filePath: string;
  videoCache: Map<string, Blob>;
}

const CahcheVideo: FC<Props> = ({ filePath, videoCache }) => {
  const [videoURL, setVideoURL] = useState("");
  const { editVideoCache } = useDataContext();

  useEffect(() => {
    const loadVideo = async () => {
      const cachedBlob = editVideoCache("get", filePath);

      if (cachedBlob) {
        console.log(`Loading video from cache: ${filePath}`);
        const url = URL.createObjectURL(cachedBlob);
        setVideoURL(url);
      } else {
        console.log(`Loading video from file: ${filePath}`);
        const response = await fetch(`file://${filePath}`);
        const blob = await response.blob();

        editVideoCache("add", filePath, blob);

        const url = URL.createObjectURL(blob);
        setVideoURL(url);
      }
    };

    loadVideo();

    return () => {
      if (videoURL) URL.revokeObjectURL(videoURL);
    };
  }, [filePath]);

  return videoURL ? (
    <>
      <div
        style={{
          width: "250px",
          height: "auto",
          position: "relative",
        }}
      >
        <VideoSeeker path={filePath} src={videoURL} />
      </div>
    </>
  ) : (
    <></>
  );
};

export default CahcheVideo;
