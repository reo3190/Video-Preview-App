import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDataContext } from "../../../hook/UpdateContext";
import { getFromLocalStorage } from "../../../hook/useLoadFileFolder";
const Menu = () => {
  const location = useLocation();
  const { inputPath } = useDataContext();

  useEffect(() => {
    const { files, folders } = getFromLocalStorage();
    window.electron.updateMenu(location.pathname, files, folders);
  }, [location]);

  useEffect(() => {
    const { files, folders } = getFromLocalStorage();
    window.electron.updateMenu(location.pathname, files, folders);
  }, [inputPath]);
};

export default Menu;
