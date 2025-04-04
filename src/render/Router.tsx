import "./_sass/main.scss";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDataContext } from "../hook/UpdateContext";
import Top from "./page/Top";
import Player from "./page/Player";
import Menu from "./Comp/Menu";
import Loading from "./Comp/Load";
import Setting from "./Comp/Setting";

export const Router = () => {
  const { load } = useDataContext();

  const [setting, SetSetting] = useState<boolean>(false);

  useEffect(() => {
    const removeListener = window.electron.onOpenSetting(() =>
      SetSetting(true)
    );

    return () => {
      removeListener();
    };
  }, []);

  Menu();
  return (
    <>
      {load && <Loading />}
      {setting && <Setting setStting={SetSetting} />}
      <Routes>
        <Route path={`/`} element={<Top />} />
        <Route path={`/play`} element={<Player />} />
        {/* <Route path={`/edit`} element={<Player />} /> */}
      </Routes>
    </>
  );
};
