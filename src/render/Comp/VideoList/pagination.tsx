import React, { FC, useRef, useState } from "react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";

interface Props {
  curPage: number;
  itemsPerPage: number;
  handlePageChange: (e: number) => void;
  videoNum: number;
}

const Pagination: FC<Props> = ({
  curPage,
  itemsPerPage,
  handlePageChange,
  videoNum,
}) => {
  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 0; i < Math.ceil(videoNum / itemsPerPage); i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`page-number ${curPage === i ? "enable" : ""}`}
          onClick={() => handlePageChange(i)}
          disabled={curPage === i}
        >
          {i + 1}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <>
      <div className="pagination">
        <button
          className={`seekButton ${curPage === 0 ? "enable" : ""}`}
          onClick={() => handlePageChange(-1)}
          disabled={curPage === 0}
        >
          <FaAngleLeft size={"1rem"} />
        </button>
        {renderPageNumbers()}
        <button
          className={`seekButton ${
            (curPage + 1) * itemsPerPage >= videoNum ? "enable" : ""
          }`}
          onClick={() => handlePageChange(-2)}
          disabled={(curPage + 1) * itemsPerPage >= videoNum}
        >
          <FaAngleRight size={"1rem"} />
        </button>
      </div>
    </>
  );
};

export default Pagination;
