import React, { useState, FC, useEffect } from "react";
import {
  CompClose,
  CompSequence,
  CompNameForm,
  handleOpenCommon,
} from "../comp";
import { useDataContext } from "../../../../hook/UpdateContext";
import { getVideoIndex } from "../../../../hook/api";

import { TbArrowAutofitContentFilled } from "react-icons/tb";

interface Props {
  img: String;
  video: Video;
  setShowRangeForm: React.Dispatch<React.SetStateAction<Boolean>>;
}
const RangeForm: FC<Props> = ({ img, video, setShowRangeForm }) => {
  const { filteredVideoList, editVideoList, setEditVideoList, context } =
    useDataContext();

  const [front, setFront] = useState<number>(0);
  const [back, setBack] = useState<number>(0);

  const [index, setIndex] = useState<number>(
    getVideoIndex(video, filteredVideoList)
  );
  const [indexList, setIndexList] = useState<number[]>([index]);

  const [name, setName] = useState<string>("Sequence");

  useEffect(() => {
    const idx = getVideoIndex(video, filteredVideoList);
    setIndex(idx);
    setIndexList([idx]);
  }, [video, filteredVideoList]);

  useEffect(() => {
    const start = Math.max(index - front, 0);
    const end = Math.min(index + back, filteredVideoList.length - 1);
    const iList = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    setIndexList(iList);
  }, [front, back]);

  const handleClose = () => {
    setShowRangeForm(false);
  };

  const handleOpen = async () => {
    if ((front == 0 && back == 0) || indexList.length < 2 || name.length <= 0)
      return;

    await handleOpenCommon(
      name,
      indexList,
      context,
      filteredVideoList,
      editVideoList,
      setEditVideoList,
      setShowRangeForm
    );
  };

  return (
    <div className="form-wrapper range-form-wrapper">
      <div className="form-outer range-form-outer">
        <div className="form-top">
          <img className={`frame-image`} src={"data:image/png;base64," + img} />
        </div>
        <div className="form-bottom">
          <CompNameForm name={name} setName={setName} />
          <div className="form-input-outer">
            <div className="form-label">■ 範囲</div>
            <div className="form-input">
              <input
                type="number"
                min={0}
                value={front}
                onChange={(e) => setFront(Number(e.target.value))}
              />
              <div>
                <TbArrowAutofitContentFilled size={"2rem"} />
              </div>
              <input
                type="number"
                min={0}
                value={back}
                onChange={(e) => setBack(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="form-create">
          <CompSequence
            index={index}
            indexList={indexList}
            videoList={filteredVideoList}
            type="range"
          />
          <button
            onClick={() => handleOpen()}
            disabled={
              (front == 0 && back == 0) ||
              name.length <= 0 ||
              indexList.length < 2
            }
          >
            作成
          </button>
        </div>
        <CompClose handleClose={handleClose} />
      </div>
    </div>
  );
};

export default RangeForm;
