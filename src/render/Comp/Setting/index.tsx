import React, { useRef, useEffect, useState, FC } from "react";
import { useDataContext } from "../../../hook/UpdateContext";

interface Props {
  setStting: React.Dispatch<React.SetStateAction<boolean>>;
}

const Setting: FC<Props> = ({ setStting }) => {
  const {
    outputFileName,
    setOutputFileName,
    outputFrameOffset,
    setOutputFrameOffset,
  } = useDataContext();

  const [offsetFront, setOffsetFront] = useState<boolean>(
    outputFrameOffset <= 0
  );

  const getFrontBack = () => {
    return offsetFront ? "0" : "1";
  };

  const setFrontBack = (value: string) => {
    const isFront = value === "0";
    setOffsetFront(isFront);
    const update = isFront
      ? Math.abs(outputFrameOffset) * -1
      : Math.abs(outputFrameOffset);
    setOutputFrameOffset(update);
  };

  const getOffsetValue = () => {
    return Math.abs(outputFrameOffset);
  };

  const setOffsetValue = (value: string) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setOutputFrameOffset(offsetFront ? num * -1 : num);
    } else {
      setOutputFrameOffset(0);
    }
  };

  return (
    <>
      <div className="setting-wrapper">
        <div className="setting-outer">
          <div className="output-name">
            <div className="title">■ 出力ファイル名</div>
            <div className="text">
              <div className="form">
                <input
                  type="text"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                />
                <div>.png</div>
              </div>
              <div>フレーム数挿入 : ### → 001</div>
            </div>
          </div>
          <div className="frame-offset">
            <div className="title">■ フレームオフセット</div>
            <div className="text">
              <div className="form">
                <select
                  value={getFrontBack()}
                  onChange={(e) => setFrontBack(e.target.value)}
                >
                  <option value={"0"}>前に</option>
                  <option value={"1"}>後ろに</option>
                </select>
                <input
                  type="number"
                  value={getOffsetValue()}
                  onChange={(e) => setOffsetValue(e.target.value)}
                  min="0"
                />
                <div>F ずらす</div>
              </div>
            </div>
          </div>
          <button onClick={() => setStting(false)}>決定</button>
        </div>
      </div>
    </>
  );
};

export default Setting;
