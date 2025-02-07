import "./_sass/main.scss";
import { Routes, Route } from "react-router-dom";
import { DataProvider } from "../hook/UpdateContext";
import Top from "./page/Top";
import Player from "./page/Player";
import Menu from "./Comp/Menu";
import { Router } from "./Router";

export const App = () => {
  Menu();
  return (
    <>
      <DataProvider>
        <Router />
      </DataProvider>
    </>
  );
};
