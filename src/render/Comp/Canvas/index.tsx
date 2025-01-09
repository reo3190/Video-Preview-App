import React, { useState, useEffect, FC, forwardRef } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import Paint from "./paint";
import ToolBar from "./toolBar";

interface Props {
  onDraw: () => void;
}
const Canvas = forwardRef<any, Props>(({ onDraw }, ref) => {
  const { paintTool, activePaintTool, windowSize } = useDataContext();

  return (
    <>
      <div className="canvas-frame">
        <Paint
          size={{ w: windowSize.width, h: (windowSize.width * 9) / 16 }}
          calcBrightness={() => 0}
          tool={activePaintTool}
          toolState={paintTool[activePaintTool]}
          paintConfig={{ smooth: 0, pressure: 1 }}
          setCanUndo={() => true}
          setCanRedo={() => true}
          onDraw={onDraw}
          ref={ref}
        />
      </div>
    </>
  );
});

export default Canvas;
