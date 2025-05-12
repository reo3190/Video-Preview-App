import React from "react";
import { useDataContext } from "../../../../../hook/UpdateContext";
import { FaFolder } from "react-icons/fa6";
import { RiEditBoxLine } from "react-icons/ri";
import { TbReload } from "react-icons/tb";
import { reLoad } from "../../../../../hook/useLoadFileFolder";

const HeadPath = () => {
  const { inputPath, tab, context } = useDataContext();

  return (
    <>
      <div className="head-path-wrapper">
        <div className="inputpath">
          <div className="inputpath-icon">
            {tab == "FOLDER" ? (
              <>
                <FaFolder size={"1.5rem"} />
              </>
            ) : tab == "EDIT" ? (
              <RiEditBoxLine size={"1.5rem"} />
            ) : (
              <></>
            )}
          </div>
          {tab == "FOLDER" && (
            <>
              <button
                className="inputpath-reload"
                onClick={() => reLoad(inputPath, context)}
              >
                <TbReload size={"1.5rem"} />
              </button>
            </>
          )}
          {tab == "FOLDER" ? (
            <div className="inputpath-str">
              {inputPath ? inputPath : "Folder"}
            </div>
          ) : (
            <div>Workspace</div>
          )}
        </div>
      </div>
    </>
  );
};

export default HeadPath;
