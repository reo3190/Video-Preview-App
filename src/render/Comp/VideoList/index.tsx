import React, { useRef, useState, useEffect } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import { isErr } from "../../../hook/api";
import VideoSeeker from "./seek";
import Pagination from "./pagination";
import CahcheVideo from "./cache";

const videoPath = "U:\\01_check\\02_3dLO_ch\\241216\\SOS_c036_lo_t1.mp4";

const VideoList = () => {
  const { filteredVideoList, curPage, setCurPage, videoCache } =
    useDataContext();
  const itemsPerPage = 20;
  const startIndex = curPage * itemsPerPage;
  const currentItems = filteredVideoList.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handlePageChange = (direction: number) => {
    if (direction === -1 && curPage > 0) {
      setCurPage(curPage - 1);
    } else if (
      direction === -2 &&
      (curPage + 1) * itemsPerPage < filteredVideoList.length
    ) {
      setCurPage(curPage + 1);
    } else {
      setCurPage(direction);
    }
    // setCurIndex(0);
  };

  return (
    <>
      <Pagination
        curPage={curPage}
        itemsPerPage={itemsPerPage}
        handlePageChange={handlePageChange}
        videoNum={filteredVideoList.length}
      />
      <div className="video-list-wrapper">
        {currentItems.map((e) => {
          return (
            <CahcheVideo
              key={e.path}
              filePath={e.path}
              videoCache={videoCache}
            />
            // <div
            //   key={e.path}
            //   style={{
            //     width: "250px",
            //     height: "auto",
            //     position: "relative",
            //     display: `${view ? "auto" : "none"}`,
            //   }}
            // >
            //   <video
            //     ref={(el) => {
            //       if (el) videoRefs.current[e.path] = el;
            //     }}
            //     width="100%"
            //     height="100%"
            //     src={`file:\\${e.path}`}
            //     preload="auto"
            //     // controls
            //   />
            // </div>
          );
          // return <VideoSeeker key={e.path} path={e.path} />;
        })}
      </div>
    </>
  );
};

export default VideoList;
