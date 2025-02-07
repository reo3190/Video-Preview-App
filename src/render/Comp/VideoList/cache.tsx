import React, { useRef, useEffect, useState, FC } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import { useNavigate } from "react-router-dom";
import { IoReturnDownForwardSharp } from "react-icons/io5";
import VideoInfo from "./videoInfo";
import { isErr, loadFile } from "../../../hook/api";
import { PiPencilSimpleLine } from "react-icons/pi";

interface Props {
  video: Video;
}

const CahcheVideo: FC<Props> = ({ video }) => {
  const {
    setLoad,
    setCurVideo,
    editImgCache,
    editVideoMetaCache,
    editMovPathCache,
    videoMarkers,
  } = useDataContext();

  const marker = videoMarkers[video.path] || {};
  const markerCount = Object.keys(marker).length;

  const [img, setImg] = useState<string | null>(
    editImgCache("get", video.path)
  );
  const [LoadingIMG, setLoadingIMG] = useState<boolean>(!img);

  useEffect(() => {
    const getImg = async () => {
      if (LoadingIMG) {
        const res = await window.electron.getThumbnail(video.path);
        if (isErr(res)) return;

        editImgCache("add", video.path, res);
        setImg(res);
      }
    };

    getImg();
  }, []);

  const handleImageLoad = () => {
    setLoadingIMG(false);
  };

  const navigate = useNavigate();
  const handlePlay = async (video: Video) => {
    setLoad(true);
    await loadFile(editVideoMetaCache, editMovPathCache, video);
    setCurVideo(video);
    navigate("/play");
  };

  return (
    <>
      <div className="video-list-item">
        {LoadingIMG && <div className="placeholder">Loading...</div>}
        <VideoInfo video={video} />
        {markerCount > 0 && (
          <div className="marker-count">
            <PiPencilSimpleLine size={"2.5rem"} />
          </div>
        )}

        <img
          className={`frame-image ${LoadingIMG ? "loading" : "loaded"}`}
          src={"data:image/png;base64," + img}
          onLoad={handleImageLoad}
          onClick={() => handlePlay(video)}
        />
      </div>
    </>
  );
};

export default CahcheVideo;
