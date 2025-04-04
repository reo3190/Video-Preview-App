import React, { forwardRef } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import Paint from "./paint";

interface Props {
  baseSize: Size;
  setCanUndo: React.Dispatch<React.SetStateAction<boolean>>;
  setCanRedo: React.Dispatch<React.SetStateAction<boolean>>;
  onDraw: (history: PaintElement[][], index: number) => void;
}
const Canvas = forwardRef<any, Props>(
  ({ baseSize, setCanUndo, setCanRedo, onDraw }, ref) => {
    const { curVideo, paintTool, activePaintTool, windowSize, videoMarkers } =
      useDataContext();

    if (!curVideo) {
      return <></>;
    }

    return (
      <>
        <div
          className={`canvas-frame ${activePaintTool === "mouse" && "notShow"}`}
        >
          <Paint
            baseSize={baseSize}
            size={baseSize}
            calcBrightness={() => 0}
            tool={activePaintTool}
            toolState={paintTool[activePaintTool]}
            paintConfig={{ smooth: 0, pressure: 0 }}
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
