import React, { useState, useEffect, FC } from "react";
import Pagination from "./pagination";
import CahcheVideo from "./cache";
import { TbGhost2Filled } from "react-icons/tb";
import { loadFile, getVideoIndex } from "../../../hook/api";
import { useDataContext } from "../../../hook/UpdateContext";
interface Props {
  list: Video[];
  curPage: number;
  setCurPage: (e: number) => void;
  itemsPerPage: number;
  handleClick: (e: React.MouseEvent<HTMLDivElement>, v: Video) => void;
}

const VideoList: FC<Props> = ({
  list,
  curPage,
  setCurPage,
  itemsPerPage,
  handleClick,
}) => {
  const { curVideo, tab, filteredVideoList, filteredEditVideoList } =
    useDataContext();
  const startIndex = curPage * itemsPerPage;
  const currentItems = list.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const indexVideo = curVideo
      ? tab == "FOLDER"
        ? getVideoIndex(curVideo, filteredVideoList)
        : tab == "EDIT"
        ? getVideoIndex(curVideo, filteredEditVideoList)
        : null
      : null;
    setCurPage(indexVideo ? Math.floor(indexVideo / itemsPerPage) : curPage);
  }, [tab]);

  const handlePageChange = (direction: number) => {
    let _curPage = curPage;
    if (direction === -1 && curPage > 0) {
      setCurPage(curPage - 1);
      _curPage -= 1;
    } else if (direction === -2 && (curPage + 1) * itemsPerPage < list.length) {
      setCurPage(curPage + 1);
      _curPage += 1;
    } else {
      setCurPage(direction);
      _curPage = direction;
    }
    // setCurIndex(0);

    const _startIndex = _curPage * itemsPerPage;
    const _currentItems = list.slice(_startIndex, _startIndex + itemsPerPage);

    convert(_currentItems);
  };

  const convert = async (_currentItems: Video[]) => {
    const filePaths: string[] = [];
    list.forEach((e) => {
      filePaths.push(e.path);
    });
  };

  return (
    <>
      <Pagination
        curPage={curPage}
        itemsPerPage={itemsPerPage}
        handlePageChange={handlePageChange}
        videoNum={list.length}
      />
      <div className="video-list-wrapper">
        {currentItems.length == 0 && (
          <div className="no-video">
            No Video ... <TbGhost2Filled size={"1.8rem"} />
          </div>
        )}
        {currentItems.map((e) => {
          return (
            <CahcheVideo key={e.path} video={e} handleClick={handleClick} />
          );
        })}
      </div>
    </>
  );
};

export default VideoList;
