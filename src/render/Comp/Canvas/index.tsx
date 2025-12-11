import React, { forwardRef } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import Paint from "./paint";
import { zoomStyleType } from "../../page/Player";

interface Props {
  baseSize: Size;
  setCanUndo: React.Dispatch<React.SetStateAction<boolean>>;
  setCanRedo: React.Dispatch<React.SetStateAction<boolean>>;
  onDraw: (history: PaintElement[][], index: number) => void;
  clickCanvas: () => void;
  zoomStyle: zoomStyleType;
  zOffset: Size;
  zScale: number;
  outerRef: React.RefObject<HTMLDivElement | null>;
}
const Canvas = forwardRef<any, Props>(
  (
    {
      baseSize,
      setCanUndo,
      setCanRedo,
      onDraw,
      clickCanvas,
      zoomStyle,
      zOffset,
      zScale,
      outerRef,
    },
    ref
  ) => {
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
            clickCanvas={clickCanvas}
            zoomStyle={zoomStyle}
            zOffset={zOffset}
            zScale={zScale}
            outerRef={outerRef}
            ref={ref}
          />
        </div>
      </>
    );
  }
);

export default Canvas;
