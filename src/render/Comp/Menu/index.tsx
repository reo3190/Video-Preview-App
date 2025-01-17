import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

const Menu = () => {
  const location = useLocation();
  useEffect(() => {
    window.electron.updateMenu(location.pathname);
  }, [location]);
};

export default Menu;
