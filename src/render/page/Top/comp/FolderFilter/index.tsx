import React, { useEffect } from "react";
import { useDataContext } from "../../../../../hook/UpdateContext";
import { makeDateList, Filter, num2date } from "../../../../../hook/api";
import { FaCalendar, FaSearch } from "react-icons/fa";
import { IoMdCheckbox } from "react-icons/io";

const FolderFilter = () => {
  const {
    filter,
    setFilter,
    videoList,
    setFilteredVideoList,
    setLastLoad,
    setCurPage,
  } = useDataContext();

  useEffect(() => {
    onUpdateVideoList(videoList);
  }, [videoList]);

  const onUpdateVideoList = async (list: Video[]) => {
    setFilteredVideoList(Filter(list, filter));
    setFilter({ dateList: makeDateList(list) });
    setLastLoad(new Date().getTime());
  };

  const handleEditFilter = (update: Partial<Filter>) => {
    setFilter(update);
    setFilteredVideoList(
      Filter(videoList, {
        ...filter,
        ...update,
      })
    );
    setCurPage(0);
  };

  return (
    <>
      <div className="fil-wrapper">
        <div className="fil-date">
          <FaCalendar size={"1.5rem"} />
          <select
            defaultValue={filter.date}
            onChange={(e) => handleEditFilter({ date: e.target.value })}
          >
            <option value={"all"}>All</option>
            {filter.dateList.map((d) => (
              <option key={d} value={d}>
                {num2date(d)}
              </option>
            ))}
          </select>
        </div>
        <div className="fil-check">
          <IoMdCheckbox size={"1.5rem"} />
          <select
            defaultValue={filter.check}
            onChange={(e) => handleEditFilter({ check: e.target.value })}
          >
            <option value="all">All</option>
            <option value="_r">_r</option>
            <option value="_ok">_ok</option>
            <option value="no">r/ok なし</option>
          </select>
        </div>
        <div className="fil-search">
          <input
            type="text"
            value={filter.wordInput}
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
      </div>
    </>
  );
};

export default FolderFilter;
