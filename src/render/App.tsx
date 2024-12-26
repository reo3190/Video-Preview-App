import "./_sass/main.scss";
import { Routes, Route } from "react-router-dom";
import { DataProvider } from "../hook/UpdateContext";
import Top from "./page/Top";
import Player from "./page/Player";

export const App = () => {
  return (
    <>
      <DataProvider>
        <Routes>
          <Route path={`/`} element={<Top />} />
          <Route path={`/play`} element={<Player />} />
        </Routes>
      </DataProvider>
    </>
  );
};
