import React, { useRef, useState, useEffect } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import { isErr } from "../../../hook/api";
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
  // const [currentPaths, setCurrentPaths] = useState<
  //   Record<string, string | null>
  // >({});
  const [currentPaths, setCurrentPaths] = useState<string[]>([]);

  const handlePageChange = (direction: number) => {
    let _curPage = curPage;
    if (direction === -1 && curPage > 0) {
      setCurPage(curPage - 1);
      _curPage -= 1;
    } else if (
      direction === -2 &&
      (curPage + 1) * itemsPerPage < filteredVideoList.length
    ) {
      setCurPage(curPage + 1);
      _curPage += 1;
    } else {
      setCurPage(direction);
      _curPage = direction;
    }
    // setCurIndex(0);

    const _startIndex = _curPage * itemsPerPage;
    const _currentItems = filteredVideoList.slice(
      _startIndex,
      _startIndex + itemsPerPage
    );

    convert(_currentItems);
  };

  const convert = async (_currentItems: Video[]) => {
    const filePaths: string[] = [];
    filteredVideoList.forEach((e) => {
      filePaths.push(e.path);
    });

    // const res = await window.electron.convert2HLS(filePaths);
    // if (isErr(res)) return;
    // setCurrentPaths(res);

    // console.log(res);
  };

  useEffect(() => {}, [currentPaths]);

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
          return <CahcheVideo key={e.path} video={e} />;
        })}
        {/* {currentPaths.map((e) => {
          return <CahcheVideo key={e} filePath={e || ""} />;
        })} */}
      </div>
    </>
  );
};

export default VideoList;
