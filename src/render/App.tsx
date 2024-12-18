import "./_sass/main.scss";
import { DataProvider } from "../hook/UpdateContext";
import Top from "./page/Top";

export const App = () => {
  return (
    <>
      <DataProvider>
        <Top />
      </DataProvider>
    </>
  );
};
