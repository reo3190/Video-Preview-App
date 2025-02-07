import React, { useRef, useEffect, useState, FC } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import { getVideoTag, num2date } from "../../../hook/api";

interface Props {
  video: Video;
}

const VideoInfo: FC<Props> = ({ video }) => {
  const { videoMarkers } = useDataContext();
  const tag = getVideoTag(video.directory);
  const marker = videoMarkers[video.path] || {};
  const markerCount = Object.keys(marker).length;

  return (
    <>
      <div className={`video-head-wrapper ${tag.check || ""}`}>
        <div className="video-head">
          <div className="video-name">{video.name}</div>
        </div>
        <div className="video-info">
          <div>{num2date(tag.date || "")}</div>
        </div>
      </div>
    </>
  );
};

export default VideoInfo;
