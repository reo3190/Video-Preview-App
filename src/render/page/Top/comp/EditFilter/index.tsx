import React, { useEffect, FC } from "react";
import { useDataContext } from "../../../../../hook/UpdateContext";
import { Filter4Edit, hasAnyHistory } from "../../../../../hook/api";
import { FaSearch } from "react-icons/fa";
import { FaFilter } from "react-icons/fa6";
import { MdDelete } from "react-icons/md";

interface Props {
  itemsPerPage: number;
}

const EditFilter: FC<Props> = ({ itemsPerPage }) => {
  const {
    filter4edit,
    setFilter4Edit,
    editVideoList,
    setEditVideoList,
    setFilteredEditVideoList,
    videoMarkers,
    initVideoMarker,
    curPageEdit,
    setCurPageEdit,
  } = useDataContext();

  useEffect(() => {
    onUpdateVideoList(editVideoList);
  }, [editVideoList]);

  const onUpdateVideoList = (list: Video[]) => {
    setFilteredEditVideoList(Filter4Edit(list, filter4edit, videoMarkers));
    // 削除時のページ移動確認
    const pages = list.length != 0 ? Math.ceil(list.length / itemsPerPage) : 1;
    if (curPageEdit + 1 > pages && pages > 0) {
      setCurPageEdit(pages - 1);
    }
  };

  const handleEditFilter = (update: Partial<Filter4Edit>) => {
    setFilter4Edit(update);
    setFilteredEditVideoList(
      Filter4Edit(
        editVideoList,
        {
          ...filter4edit,
          ...update,
        },
        videoMarkers
      )
    );
    setCurPageEdit(0);
  };

  const checkDialog = async (videoMarkers: Markers, seqList: Video[]) => {
    if (hasAnyHistory(videoMarkers) || seqList.length > 0) {
      return confirm("現在の編集データを全て削除しますか？") ? "yes" : "no";
    }
    return "no";
  };

  const handleDeleteAll = async () => {
    const seqList = editVideoList.filter((e) => {
      return e.seq;
    });
    const res = await checkDialog(videoMarkers, seqList);

    if (res == "no") return;

    initVideoMarker();
    setEditVideoList([]);
    setFilteredEditVideoList([]);
    setCurPageEdit(0);
  };

  return (
    <>
      <div className="fil-wrapper">
        <div className="fil-edit">
          <FaFilter size={"1.5rem"} />
          <select
            defaultValue={"all"}
            onChange={(e) =>
              handleEditFilter({ select: e.target.value as Filter4EditParts })
            }
          >
            <option value="all">All</option>
            <option value="paint">ペイント</option>
            <option value="seq">シーケンス</option>
          </select>
        </div>
        <div className="fil-search">
          <input
            type="text"
            value={filter4edit.wordInput}
            onChange={(e) =>
              handleEditFilter({
                wordInput: e.target.value,
                wordList: e.target.value.split(" "),
              })
            }
          />
          <div className="fil-search-icon">
            <FaSearch size={"1.5rem"} />
          </div>
        </div>
        <div className="fil-edit-delete">
          <button onClick={() => handleDeleteAll()}>
            <MdDelete size={"2rem"} />
          </button>
        </div>
      </div>
    </>
  );
};

export default EditFilter;
