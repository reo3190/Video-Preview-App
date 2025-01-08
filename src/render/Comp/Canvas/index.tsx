import React, { useState, useEffect, FC, forwardRef } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import Paint from "./paint";
import ToolBar from "./toolBar";

interface Props {
  size: number;
}
const Canvas = forwardRef<any, Props>(({ size }, ref) => {
  const { paintTool, activePaintTool } = useDataContext();
  console.log(size);
  return (
    <>
      <div className="canvas-frame">
        <Paint
          size={{ w: size, h: (size * 9) / 16 }}
          calcBrightness={() => 0}
          tool={activePaintTool}
          toolState={paintTool[activePaintTool]}
          paintConfig={{ smooth: 0, pressure: 1 }}
          setCanUndo={() => true}
          setCanRedo={() => true}
          ref={ref}
        />
      </div>
    </>
  );
});

export default Canvas;
