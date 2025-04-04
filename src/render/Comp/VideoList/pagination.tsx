import React, { FC } from "react";
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
  const totalPages = Math.ceil(videoNum / itemsPerPage);
  const maxVisiblePages = 15; // 奇数

  const renderPageNumbers = () => {
    if (totalPages <= maxVisiblePages + 2) {
      // 少ないページ数なら全て表示
      return Array.from({ length: totalPages }, (_, i) => (
        <PageButton
          key={i}
          page={i}
          curPage={curPage}
          handlePageChange={handlePageChange}
        />
      ));
    }

    const pages: (number | "...")[] = [];
    const visibleRange = Math.round((maxVisiblePages - 3) / 2);
    const leftBoundary = Math.max(1, curPage - visibleRange);
    const rightBoundary = Math.min(totalPages, curPage + visibleRange + 1);

    if (leftBoundary > 2) {
      pages.push(0, "...");
    } else {
      for (let i = 0; i < maxVisiblePages - 1; i++) {
        pages.push(i);
      }
    }

    if (leftBoundary > 2 && rightBoundary < totalPages - 2) {
      for (let i = leftBoundary; i < rightBoundary; i++) {
        pages.push(i);
      }
    }

    if (rightBoundary < totalPages - 2) {
      pages.push("...", totalPages - 1);
    } else {
      for (let i = totalPages - maxVisiblePages - 1; i < totalPages; i++) {
        pages.push(i);
      }
    }

    return pages.map((p, index) =>
      typeof p === "number" ? (
        <PageButton
          key={p + index}
          page={p}
          curPage={curPage}
          handlePageChange={handlePageChange}
        />
      ) : (
        <span key={`ellipsis-${index}`} className="ellipsis">
          {p}
        </span>
      )
    );
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

const PageButton: FC<{
  page: number;
  curPage: number;
  handlePageChange: (p: number) => void;
}> = ({ page, curPage, handlePageChange }) => (
  <button
    className={`page-number ${curPage === page ? "enable" : ""}`}
    onClick={() => handlePageChange(page)}
  >
    {page + 1}
  </button>
);

export default Pagination;
