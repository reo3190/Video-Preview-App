import React, { FC } from "react";
import HeadPath from "../HeadPath";
import FolderFilter from "../FolderFilter";
import { useDataContext } from "../../../../../hook/UpdateContext";
import EditFilter from "../EditFilter";

interface Props {
  itemsPerPage: number;
}
const FormTop: FC<Props> = ({ itemsPerPage }) => {
  const { tab } = useDataContext();

  return (
    <>
      <div className="form-top-wrapper">
        <HeadPath />
        {tab == "FOLDER" && <FolderFilter />}
        {tab == "EDIT" && <EditFilter itemsPerPage={itemsPerPage} />}
      </div>
    </>
  );
};

export default FormTop;
