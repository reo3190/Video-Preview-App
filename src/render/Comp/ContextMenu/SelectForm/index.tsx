import React, { useState, FC, useEffect, useRef } from "react";
import {
  CompClose,
  CompSequence,
  CompNameForm,
  handleOpenCommon,
} from "../comp";
import { useDataContext } from "../../../../hook/UpdateContext";
import { getVideoIndex } from "../../../../hook/api";

import VideoList from "../../VideoList";

interface Props {
  img: String;
  video: Video;
  setShowSelectForm: React.Dispatch<React.SetStateAction<Boolean>>;
}
const SelectForm: FC<Props> = ({ img, video, setShowSelectForm }) => {
  const { filteredVideoList, editVideoList, setEditVideoList, context } =
    useDataContext();

  const itemsPerPage = 15;
  const index = getVideoIndex(video, filteredVideoList);
  const [indexList, setIndexList] = useState<number[]>([index]);
  const parentRef = useRef<HTMLDivElement>(null);

  const [curPage, setCurPage] = useState<number>(
    Math.floor(index / itemsPerPage)
  );

  const startIndex = curPage * itemsPerPage;

  const [name, setName] = useState<string>("Sequence");

  const setOverlay = (el: HTMLDivElement, text: string) => {
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.textContent = text;
    el.append(overlay);
  };

  const removeOverlay = (el: HTMLDivElement) => {
    if (el.classList.contains("overlay")) {
      el.remove();
    }
  };

  const reloadOverlay = (el: HTMLDivElement, text: string) => {
    const overlay = el.querySelector(".overlay");
    if (overlay) {
      overlay.textContent = text;
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>, v: Video) => {
    const num = getVideoIndex(v, filteredVideoList);
    const el = e.target as HTMLDivElement;

    if (indexList.includes(num)) {
      removeOverlay(el);
      setIndexList((pre) =>
        pre.filter((e) => {
          return e != num;
        })
      );
    } else {
      setIndexList((pre) => {
        const newState = [...pre, num];
        setOverlay(el, `${newState.length}`);
        return newState;
      });
    }
  };

  const handleOpen = async () => {
    if (name.length <= 0 || indexList.length < 2) return;

    await handleOpenCommon(
      name,
      indexList,
      context,
      filteredVideoList,
      editVideoList,
      setEditVideoList,
      setShowSelectForm
    );
  };

  const handleClose = () => {
    setShowSelectForm(false);
  };

  useEffect(() => {
    if (parentRef.current) {
      const elList = parentRef.current.querySelectorAll(".frame-image");
      indexList.forEach((e, i) => {
        if (startIndex <= e && e < startIndex + itemsPerPage) {
          const num = e % 15;
          setOverlay(elList[num] as HTMLDivElement, `${i + 1}`);
        }
      });

      elList.forEach((e, i) => {
        if (
          i == index % itemsPerPage &&
          startIndex <= index &&
          index < startIndex + itemsPerPage
        ) {
          (e as HTMLDivElement).style.border =
            "8px ridge var(--paint-UI-select)";
        }
      });
    }
  }, [curPage]);

  useEffect(() => {
    if (parentRef.current) {
      const videolist = parentRef.current.querySelectorAll(".frame-image");
      indexList.forEach((e, i) => {
        if (startIndex <= e && e < startIndex + itemsPerPage) {
          const num = e % 15;
          reloadOverlay(videolist[num] as HTMLDivElement, `${i + 1}`);
        }
      });
    }
  }, [indexList]);

  return (
    <div className="form-wrapper select-form-wrapper">
      <div className="form-outer select-form-outer" ref={parentRef}>
        <VideoList
          list={filteredVideoList}
          curPage={curPage}
          setCurPage={setCurPage}
          itemsPerPage={itemsPerPage}
          handleClick={handleClick}
        />
        <div className="form-bottom">
          <CompNameForm name={name} setName={setName} />
          <div className="form-create">
            <CompSequence
              index={index}
              indexList={indexList}
              videoList={filteredVideoList}
              type="select"
            />
            <button
              onClick={() => handleOpen()}
              disabled={name.length == 0 || indexList.length < 2}
            >
              作成
            </button>
          </div>
        </div>
        <CompClose handleClose={handleClose} />
      </div>
    </div>
  );
};

export default SelectForm;
