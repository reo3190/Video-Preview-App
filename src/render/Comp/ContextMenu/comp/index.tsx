import React, { useState, FC, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { loadFile, iList2pList, isErr, loadMeta } from "../../../../hook/api";

interface PropsClose {
  handleClose: () => void;
}
export const CompClose: FC<PropsClose> = ({ handleClose }) => {
  return (
    <div className="close" onClick={() => handleClose()}>
      <IoClose size={"1.5rem"} />
    </div>
  );
};

interface PropsSequence {
  index: number;
  indexList: number[];
  videoList: Video[];
  type: "range" | "select";
}
export const CompSequence: FC<PropsSequence> = ({
  index,
  indexList,
  videoList,
  type,
}) => {
  const [hoverItem, setHoverItem] = useState<{
    e: number;
    x: number;
    y: number;
  } | null>(null);

  const getEvOd = (e: number, i: number) => {
    switch (type) {
      case "range":
        return Math.abs(e - index) % 2 == 0 ? "ev" : "od";
      case "select":
        return i % 2 == 0 ? "ev" : "od";
      default:
        return "";
    }
  };

  useEffect(() => {}, [indexList]);

  return (
    <div className="sequence">
      {indexList.map((e, i) => {
        const all = indexList.length;

        return (
          <div key={`${e}_${i}_${all}`} style={{ width: `${200 / all}px` }}>
            <div
              className={`seq-box ${e == index ? "main" : "add"} 
              ${getEvOd(e, i)}`}
              style={{ width: `${200 / all}px` }}
              onMouseEnter={(el) =>
                setHoverItem({ e: e, x: el.clientX, y: el.clientY })
              }
              onMouseMove={(el) =>
                setHoverItem({ e: e, x: el.clientX, y: el.clientY })
              }
              onMouseLeave={(el) => setHoverItem(null)}
            ></div>
            {hoverItem?.e == e && (
              <div
                className={`hover-tip ${e == index ? "main" : "add"} 
                ${getEvOd(e, i)}`}
                style={{
                  left: hoverItem.x + 10,
                  top: hoverItem.y + 10,
                }}
              >
                {videoList[e].name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface PropsNameForm {
  name: string;
  setName: (value: React.SetStateAction<string>) => void;
}

export const CompNameForm: FC<PropsNameForm> = ({ name, setName }) => {
  return (
    <div className="form-name-outer">
      <div className="form-label">■ シーケンス名</div>
      <input
        type="text"
        placeholder="＊必須入力*"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
};

export const handleOpenCommon = async (
  name: string,
  indexList: number[],
  ctx: ContextType,
  filteredVideoList: Video[],
  editVideoList: Video[],
  setEditVideoList: (e: Video[]) => void,
  setShowForm: (value: React.SetStateAction<Boolean>) => void
) => {
  ctx.setLoad(true);

  await Promise.all(
    indexList.map(async (e) => {
      await loadFile(
        ctx.editVideoMetaCache,
        ctx.editMovPathCache,
        filteredVideoList[e]
      );
    })
  );

  const nameList = indexList.map((e) => {
    return filteredVideoList[e].name;
  });
  const pList = iList2pList(indexList, filteredVideoList, ctx.editMovPathCache);
  await Promise.all(
    pList.map(async (path) => {
      await loadMeta(ctx.editVideoMetaCache, path);
    })
  );
  const metaList = pList.map((e) => {
    return ctx.editVideoMetaCache("get", e);
  });
  const res = await window.electron.list2sequence(
    nameList,
    pList,
    name,
    metaList
  );
  if (isErr(res)) {
    console.log("error");
    ctx.setLoad(false);
    return;
  } else {
    setEditVideoList([res, ...editVideoList]);
    setShowForm(false);
    ctx.setTab("EDIT");
    handlePlay(res, ctx);
  }
};

const handlePlay = async (video: Video, ctx: ContextType) => {
  await loadFile(ctx.editVideoMetaCache, ctx.editMovPathCache, video);
  ctx.setCurVideo(video);
  ctx.navi("/play", false);
};
