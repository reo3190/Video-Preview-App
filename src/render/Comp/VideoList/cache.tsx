import React, { useRef, useEffect, useState, FC } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import { useNavigate } from "react-router-dom";
import { IoReturnDownForwardSharp } from "react-icons/io5";
import VideoInfo from "./videoInfo";
import { isErr, mov2mp4 } from "../../../hook/api";

interface Props {
  video: Video;
}

const CahcheVideo: FC<Props> = ({ video }) => {
  const { setCurVideo, editImgCache, editVideoMetaCache, editMovPathCache } =
    useDataContext();

  const [img, setImg] = useState<string | null>(
    editImgCache("get", video.path)
  );
  const [Loading, setLoading] = useState<boolean>(!img);

  useEffect(() => {
    const getImg = async () => {
      if (Loading) {
        const res = await window.electron.getThumbnail(video.path);
        if (isErr(res)) return;

        editImgCache("add", video.path, res);
        setImg(res);
      }
    };

    getImg();
  }, []);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const navigate = useNavigate();
  const handlePlay = async (video: Video) => {
    const path = video.path;
    const cache = editVideoMetaCache("get", path);
    if (!cache) {
      const res = await window.electron.getVideoMeta(path);
      const size: Size = { w: res.streams[0].width, h: res.streams[0].height };
      const str = res.streams[0].r_frame_rate;
      const parts = str.split("/");
      const fps: FPS =
        parts.length === 2 ? Number(parts[0]) / Number(parts[1]) : NaN;
      editVideoMetaCache("add", path, [size, fps]);

      console.log([size, fps]);
    }

    const movPath = await mov2mp4(video);
    if (movPath) {
      editMovPathCache("add", video.path, movPath);
    }

    navigate("/play");
    setCurVideo(video);
  };

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
        <VideoInfo video={video} />
        <img
          className={`frame-image ${Loading ? "loading" : "loaded"}`}
          src={"data:image/png;base64," + img}
          onLoad={handleImageLoad}
          onClick={() => handlePlay(video)}
        />
      </div>
    </>
  );
};

export default CahcheVideo;
