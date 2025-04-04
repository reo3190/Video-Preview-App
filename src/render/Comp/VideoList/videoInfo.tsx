import React, { FC } from "react";
import { getVideoTag, num2date } from "../../../hook/api";

interface Props {
  video: Video;
}

const VideoInfo: FC<Props> = ({ video }) => {
  const tag = getVideoTag(video.directory);
  const isSequence = video.seq && video.seqVideo;

  const getWrapperClass = () => {
    if (isSequence) {
      return "seq";
    } else if (tag.check) {
      return tag.check;
    }
    return "";
  };

  const getInfo = () => {
    if (isSequence) {
      return ` ${video.seqVideo?.length} videos`;
    } else if (tag.date) {
      return num2date(tag.date);
    }
    return "";
  };

  return (
    <>
      <div className={`video-head-wrapper ${getWrapperClass()}`}>
        <div className="video-head">
          <div className="video-name">{video.name}</div>
        </div>
        <div className="video-info">
          <div>{getInfo()}</div>
        </div>
      </div>
    </>
  );
};

export default VideoInfo;
