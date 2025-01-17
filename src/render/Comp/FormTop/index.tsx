import React, { useEffect, useState } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import { isErr, makeDateList, Filter, num2date } from "../../../hook/api";
import { FaCalendar, FaPenNib, FaSearch, FaFolder } from "react-icons/fa";
import { IoMdCheckbox } from "react-icons/io";
import { TbReload } from "react-icons/tb";

const FormTop = () => {
  const {
    inputPath,
    setInputPath,
    filter,
    setFilter,
    videoList,
    setVideoList,
    setFilteredVideoList,
    lastLoad,
    setLastLoad,
  } = useDataContext();

  const [lastLoadTime, setLastLoadTime] = useState<number>(0);

  useEffect(() => {
    onUpdateVideoList(videoList);
  }, [videoList]);

  const onUpdateVideoList = async (list: Video[]) => {
    try {
      setFilteredVideoList(Filter(list, filter));
      setFilter({ dateList: makeDateList(list) });
      setLastLoad(new Date().getTime());
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleEditFilter = (update: Partial<Filter>) => {
    setFilter(update);
    setFilteredVideoList(
      Filter(videoList, {
        ...filter,
        ...update,
      })
    );
  };

  useEffect(() => {
    const updateTime = () => {
      if (lastLoad !== 0) {
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastLoad) / 60000);
        setLastLoadTime(diff);
      }
    };

    const interval = setInterval(() => {
      updateTime();
    }, 60000);

    updateTime();

    return () => clearInterval(interval);
  }, [lastLoad]);

  const getLastUpdate = () => {
    if (lastLoadTime < 1) {
      return `latest`;
    } else if (lastLoadTime < 60) {
      return `${lastLoadTime}m ago`;
    } else if (lastLoadTime < 3600) {
      return `${Math.floor(lastLoadTime / 60)}h ago`;
    } else {
      return `${Math.floor(lastLoadTime / 3600)}d ago`;
    }
  };

  return (
    <>
      <div className="form-top-wrapper">
        <div className="inputpath">
          {/* <input
            value={inputPath}
            onChange={(e) => {
              setInputPath(e.target.value);
              setFilteredVideoList(Filter(videoList, filter));
            }}
            onKeyDown={(e) => handleKeyDown(e)}
          /> */}
          {inputPath}
          <div className="inputpath-icon">
            <FaFolder size={"1.5rem"} />
          </div>
          {/* <button className="update" onClick={() => enterPath(inputPath)}>
            {lastLoadTime >= 1 && <TbReload size={"1.8rem"} />}
            {getLastUpdate()}
          </button> */}
        </div>

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
              <option value="no">No mark</option>
            </select>
          </div>
        </div>
        <div className="fil-search-wrapper">
          <div className="fil-search">
            <input
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
      </div>
    </>
  );
};

export default FormTop;
