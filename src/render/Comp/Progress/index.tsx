import React, { useEffect, useState, FC } from "react";
interface Props {
  progress: Number;
  done: boolean;
}

const Progress: FC<Props> = ({ progress, done }) => {
  // useEffect(() => {
  //   const listener1 = window.electron.onProgress((value: number) => {
  //     console.log(value);
  //     setDone(false);
  //     setProgress(value * 100);
  //   });

  //   const listener2 = window.electron.onComplete(() => {
  //     setDone(true);
  //   });

  //   return () => {
  //     listener1();
  //     listener2();
  //   };
  // }, []);

  return (
    <div className="bar-outer">
      {!done && (
        <div className="bar-inner" style={{ width: `${progress}%` }}></div>
      )}
    </div>
  );
};

export default Progress;
