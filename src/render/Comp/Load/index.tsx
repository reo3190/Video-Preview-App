import React, { useRef, useEffect, useState, FC } from "react";
import { RotatingLines } from "react-loader-spinner";
interface Props {}

const Loading: FC<Props> = ({}) => {
  return (
    <>
      <div className="loading-overlay">
        <RotatingLines
          visible={true}
          width="200"
          strokeWidth="5"
          animationDuration="0.75"
          ariaLabel="rotating-lines-loading"
          strokeColor="#ccc"
        />
      </div>
    </>
  );
};

export default Loading;
