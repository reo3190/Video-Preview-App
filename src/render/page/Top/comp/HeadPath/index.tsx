import React from "react";
import { useDataContext } from "../../../../../hook/UpdateContext";
import { FaFolder } from "react-icons/fa6";
import { RiEditBoxLine } from "react-icons/ri";

const HeadPath = () => {
  const { inputPath, tab } = useDataContext();

  return (
    <>
      <div className="head-path-wrapper">
        <div className="inputpath">
          <div className="inputpath-icon">
            {tab == "FOLDER" ? (
              <FaFolder size={"1.5rem"} />
            ) : tab == "EDIT" ? (
              <RiEditBoxLine size={"1.5rem"} />
            ) : (
              <></>
            )}
          </div>
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
