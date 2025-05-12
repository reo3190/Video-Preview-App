import "./_sass/main.scss";
import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { useDataContext } from "../hook/UpdateContext";
import Top from "./page/Top";
import Player from "./page/Player";
import Menu from "./Comp/Menu";
import Loading from "./Comp/Load";
import Setting from "./Comp/Setting";
import { Filter4Edit } from "../hook/api";

export const Router = () => {
  const { load, videoList, videoMarkers } = useDataContext();

  const [setting, SetSetting] = useState<boolean>(false);

  useEffect(() => {
    const removeListener = window.electron.onOpenSetting(() =>
      SetSetting(true)
    );

    return () => {
      removeListener();
    };
  }, []);

  useEffect(() => {
    const filter: Filter4Edit = {
      select: "paint",
      wordInput: "",
      wordList: [],
    };

    const removeListener = window.electron.onCheckCanClose(() => {
      const list = Filter4Edit(videoList, filter, videoMarkers);
      const count = list.length;
      const shouldClose =
        count == 0 ||
        window.confirm("ペイントデータが残っています。終了しますか？");

      window.electron.sendCloseResponse(shouldClose);

      return shouldClose;
    });

    return () => {
      removeListener();
    };
  }, [videoMarkers]);

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
