import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDataContext } from "../../../hook/UpdateContext";

const Menu = () => {
  const location = useLocation();
  const { inputPath } = useDataContext();

  useEffect(() => {
    const _file = localStorage.getItem("openFile");
    let files = _file ? (JSON.parse(_file) as Path[]) : [];

    const _folder = localStorage.getItem("openDirectory");
    let folders = _folder ? (JSON.parse(_folder) as Path[]) : [];

    window.electron.updateMenu(location.pathname, files, folders);
  }, [location]);

  useEffect(() => {
    const _file = localStorage.getItem("openFile");
    let files = _file ? (JSON.parse(_file) as Path[]) : [];

    const _folder = localStorage.getItem("openDirectory");
    let folders = _folder ? (JSON.parse(_folder) as Path[]) : [];

    window.electron.updateMenu(location.pathname, files, folders);
  }, [inputPath]);
};

export default Menu;
