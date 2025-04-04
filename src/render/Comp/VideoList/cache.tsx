import React, { useEffect, useState, FC } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import VideoInfo from "./videoInfo";
import { isErr } from "../../../hook/api";
import { PiPencilSimpleLine } from "react-icons/pi";

import { ContextMenuTriggerArea } from "../ContextMenu/src/lib";
import "../ContextMenu/src/ContextMenu.css";
import VideoContextMenu from "../ContextMenu";
import { ContextMenuBridge } from "../../../hook/ContextMenuBridge";

interface Props {
  video: Video;
  handleClick: (e: React.MouseEvent<HTMLDivElement>, v: Video) => void;
}

const CahcheVideo: FC<Props> = ({ video, handleClick }) => {
  const { editImgCache, videoMarkers } = useDataContext();

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

  return (
    <>
      <div className={`video-list-item ${LoadingIMG ? "loading" : "loaded"}`}>
        <VideoInfo video={video} />
        {markerCount > 0 && (
          <div className="marker-count">
            <PiPencilSimpleLine size={"2.5rem"} />
          </div>
        )}
        <ContextMenuTriggerArea
          bridge={ContextMenuBridge}
          className={`context-trigger`}
          data={{
            img,
            video,
          }}
        >
          <div
            className={`frame-image ${LoadingIMG ? "loading" : "loaded"}`}
            onClick={(e) => handleClick(e, video)}
          >
            {LoadingIMG && <div className="placeholder">Loading...</div>}
            <img
              src={"data:image/png;base64," + img}
              onLoad={handleImageLoad}
              style={{ pointerEvents: "none" }}
            />
          </div>
        </ContextMenuTriggerArea>
      </div>

      <VideoContextMenu />
    </>
  );
};

export default CahcheVideo;
