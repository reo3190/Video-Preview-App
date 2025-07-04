import React, { useEffect, useState, FC } from "react";
interface Props {
  progress: Number;
  done: boolean;
}

const Progress: FC<Props> = ({ progress, done }) => {
  return (
    <div className="bar-outer">
      {!done && (
        <div className="bar-inner" style={{ width: `${progress}%` }}></div>
      )}
    </div>
  );
};

export default Progress;
