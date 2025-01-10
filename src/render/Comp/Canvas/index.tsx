import React, { useState, useEffect, FC, forwardRef } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import Paint from "./paint";
import ToolBar from "./toolBar";

interface Props {
  setCanUndo: React.Dispatch<React.SetStateAction<boolean>>;
  setCanRedo: React.Dispatch<React.SetStateAction<boolean>>;
  onDraw: (history: PaintElement[][]) => void;
}
const Canvas = forwardRef<any, Props>(
  ({ setCanUndo, setCanRedo, onDraw }, ref) => {
    const { curVideo, paintTool, activePaintTool, windowSize, videoMarkers } =
      useDataContext();

    return (
      <>
        <div className="canvas-frame">
          <Paint
            size={{ w: windowSize.width, h: (windowSize.width * 9) / 16 }}
            calcBrightness={() => 0}
            tool={activePaintTool}
            toolState={paintTool[activePaintTool]}
            paintConfig={{ smooth: 0, pressure: 1 }}
            setCanUndo={setCanUndo}
            setCanRedo={setCanRedo}
            onDraw={onDraw}
            ref={ref}
          />
        </div>
      </>
    );
  }
);

export default Canvas;
