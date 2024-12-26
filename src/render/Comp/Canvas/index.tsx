import React, {
  Component,
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
} from "react";
import { useSpring, animated as a } from "react-spring";
import MouseSVG from "./mouseSVG";
// import usePressedKeys from "../../../hook/usePressedKeys";
import useHistory from "./utils/useHistory";
import {
  createElement,
  updateElement,
  drawElement,
} from "./utils/elementUtils";
import {
  positionWithinElement,
  cursorForPosition,
} from "./utils/positionUtils";

interface Props {
  calcBrightness: (x: number, y: number, size: number) => number;
  toolState: PaintToolConfig;
  paintConfig: PaintConfig;
  setCanUndo: React.Dispatch<React.SetStateAction<boolean>>;
  setCanRedo: React.Dispatch<React.SetStateAction<boolean>>;
}

interface Size {
  w: number;
  h: number;
}

const Canvas = forwardRef<any, Props>(
  ({ calcBrightness, toolState, paintConfig, setCanUndo, setCanRedo }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {
      elements,
      setElements,
      undo,
      redo,
      canUndo,
      canRedo,
      history,
      setHistory,
      index,
      setIndex,
    } = useHistory([]);
    const [selectedElement, setSelectedElement] = useState<PaintElement | null>(
      null
    );
    const [action, setAction] = useState("none");
    const [hoverText, setHoverText] = useState(false);
    const pressure = useRef(1);
    const backBrightness = useRef(0);
    const [corsorColor, setCorsorColor] = useState(true);
    // const pressedKeys = usePressedKeys();
    const [frame, setFrame] = useState(null);
    const [padding, setPadding] = useState(0);
    const [focus, setFocus] = useState(true);

    useLayoutEffect(() => {
      const canvasCtx = getContext();
      clear();

      canvasCtx?.save();

      elements.forEach((element, i) => {
        if (action === "writing" && selectedElement?.id === element.id) return;
        drawElement(
          canvasCtx,
          element,
          canvasRef.current?.width,
          canvasRef.current?.height
        );
      });

      canvasCtx?.restore();
    }, [elements, action]);

    useEffect(() => {
      const textArea = textareaRef.current;
      if (!textArea) return;
      if (action === "writing") {
        setTimeout(() => {
          textArea.focus();
          textArea.value = selectedElement?.text || "";
        }, 0);
      }
    }, [action, selectedElement]);

    useEffect(() => {
      if (!canvasRef.current) return;
      switch (toolState.tool) {
        case "pen":
        case "eraser":
          canvasRef.current.style.cursor = "none";
          break;
        case "text":
          canvasRef.current.style.cursor = "text";
          break;
        default:
          canvasRef.current.style.cursor = `default`;
      }
    }, [toolState]);

    useEffect(() => {
      setCanUndo(index > 0);
      setCanRedo(index < history.length - 1);
    }, [index, history]);

    useEffect(() => {
      const handleBlur = () => {
        setFocus(false);
      };

      const handleFocus = () => {
        setTimeout(() => {
          setFocus(true);
        }, 100);
      };

      // canvasRef.current?.addEventListener("wheel", panFunction);
      window.addEventListener("blur", handleBlur);
      window.addEventListener("focus", handleFocus);
      return () => {
        // canvasRef.current?.removeEventListener("wheel", panFunction);
        window.removeEventListener("blur", handleBlur);
        window.removeEventListener("focus", handleFocus);
      };
      // }
    }, []);

    const startDrawing = (e: any) => {
      if (action === "writing" || !focus || e.button === 2) return;

      const { x, y } = getMouseCoordinates(e);

      const clickEl = getElementAtPosition(x, y, elements);
      if (clickEl && toolState.tool === "text") {
        const offsetX = x - (clickEl.x1 || 0);
        const offsetY = y - (clickEl.y1 || 0);
        setSelectedElement({ ...clickEl, offsetX, offsetY });
        setElements((prevState) => prevState);
        setAction("moving");
      } else {
        const id: number = elements.length;
        const element = createElement(
          id,
          x,
          y,
          x,
          y,
          toolState,
          paintConfig,
          pressure
        );
        setElements((prevState) => [...prevState, element]);
        setSelectedElement(element);

        setAction(toolState.tool === "text" ? "writing" : "drawing");
      }

      if (e.pointerType === "pen") {
        e.preventDefault();
      }
    };

    const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType === "mouse") {
        pressure.current = 1;
      } else {
        pressure.current = e.pressure;
      }

      const { x, y } = getMouseCoordinates(e);

      if (toolState.tool === "pen" || "eraser") {
        const size = toolState.size;
        backBrightness.current = calcBrightness(
          e.nativeEvent.offsetX,
          e.nativeEvent.offsetY,
          size
        );
        backBrightness.current < 128
          ? setCorsorColor(true)
          : setCorsorColor(false);
      }

      if (toolState.tool === "text") {
        const element = getElementAtPosition(x, y, elements);
        const target = e.target as HTMLElement;
        if (element && element.position === "inside" && action !== "writing") {
          target.style.cursor = cursorForPosition(element.position);
          setHoverText(true);
        } else {
          target.style.cursor = "text";
          setHoverText(false);
        }
      } else {
        setHoverText(false);
      }

      if (action === "none" || action === "writing") return;

      if (action === "drawing") {
        const index = elements.length - 1;
        const { x1, y1 } = elements[index];
        updateElement(
          index,
          x1,
          y1,
          x,
          y,
          null,
          elements,
          setElements,
          toolState,
          paintConfig,
          pressure,
          getContext()
        );
      } else if (action === "moving") {
        if (!selectedElement) return;
        const {
          id,
          x1 = 0,
          x2 = 0,
          y1 = 0,
          y2 = 0,
          offsetX = 0,
          offsetY = 0,
        } = selectedElement;
        const width = x2 - x1;
        const height = y2 - y1;
        const newX1 = x - offsetX;
        const newY1 = y - offsetY;

        updateElement(
          id,
          newX1,
          newY1,
          newX1 + width,
          newY1 + height,
          selectedElement,
          elements,
          setElements,
          toolState,
          paintConfig,
          pressure,
          getContext()
        );
      }
    };

    const endDrawing = (e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
      if (action === "writing" || action === "none") return;

      const { x, y } = getMouseCoordinates(e);

      if (action === "drawing") {
        const canvasCtx = getContext();
        switch (toolState.tool) {
          case "eraser":
          case "pen":
            canvasCtx?.moveTo(x, y);
            canvasCtx?.closePath();
            break;
          default:
            break;
        }
      }

      setAction("none");
      setSelectedElement(null);
    };

    const handleBlur = (e: any) => {
      if (!selectedElement) return;
      const { id, x1, y1 } = selectedElement;
      setAction("none");
      setSelectedElement(null);

      updateElement(
        id,
        x1,
        y1,
        0,
        0,
        selectedElement,
        elements,
        setElements,
        toolState,
        paintConfig,
        pressure,
        getContext()
      );
    };

    const handleOnDoubleClick = (
      e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
    ) => {
      if (!hoverText) return;
      const { x, y } = getMouseCoordinates(e);

      const element = getElementAtPosition(x, y, elements);
      setSelectedElement(element);

      setAction("writing");
    };

    const getElementAtPosition = (
      x: number,
      y: number,
      elements: PaintElement[]
    ): PaintElement | null => {
      return (
        elements
          .map((element) => ({
            ...element,
            position: positionWithinElement(x, y, element) || null,
          }))
          .find((element) => element.position !== null) ?? null
      );
    };

    const getMouseCoordinates = (
      e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
    ): { x: number; y: number } => {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      return { x, y };
    };

    const getContext = (): CanvasRenderingContext2D | null => {
      const ctx = canvasRef.current?.getContext("2d", {
        willReadFrequently: true,
      });
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
      }
      return ctx || null;
    };

    const getRef = () => {
      return canvasRef.current;
    };

    // const captureFrameFromVideo = (video) => {
    //   const ctx = getContext();
    //   const padding = ((1 / 1.1) * canvasRef.current.width) / 20;
    //   setPadding(padding);
    //   if (ctx) {
    //     ctx.drawImage(
    //       video,
    //       padding,
    //       padding,
    //       canvasRef.current.width - padding * 2,
    //       canvasRef.current.height - padding * 2
    //     );
    //     setFrame(video);
    //   }
    // };

    const setSize = (size: Size): void => {
      if (canvasRef.current) {
        canvasRef.current.width = size.w;
        canvasRef.current.height = size.h;
      }
    };

    const getSize = (): Size => {
      return {
        w: canvasRef.current?.width || 0,
        h: canvasRef.current?.height || 0,
      };
    };

    const getOffset = (): Size => {
      return {
        w: canvasRef.current?.offsetWidth || 0,
        h: canvasRef.current?.offsetHeight || 0,
      };
    };

    const clear = (): void => {
      const ctx = getContext();
      if (ctx && canvasRef.current) {
        ctx.clearRect(
          0,
          0,
          canvasRef.current.width * 5,
          canvasRef.current.height * 5
        );
      }
    };

    const drawClear = () => {
      const id = elements.length;
      const element = createElement(
        id,
        0,
        0,
        0,
        0,
        { tool: "clear", size: 0, color: "", opacity: 0 },
        paintConfig,
        useRef<number>(0)
      );
      setElements((prevState) => [...prevState, element]);
    };

    const getHistory = (): {
      history: PaintElement[][];
      index: number;
    } => {
      return { history: history, index: index };
    };

    const overwriteHistory = (e: {
      history: PaintElement[][];
      index: number;
    }): void => {
      setHistory(e.history);
      setIndex(e.index);
    };

    const getSaveImageRef = (): HTMLCanvasElement | null => {
      setAction("save");
      const canvasCtx = getContext();
      canvasCtx?.save();
      clear();

      canvasCtx?.translate(0, 0);
      canvasCtx?.scale(1, 1);
      elements.forEach((element, i) => {
        if (action === "writing" && selectedElement?.id === element.id) return;
        drawElement(
          canvasCtx,
          element,
          canvasRef.current?.width,
          canvasRef.current?.height
        );
      });

      return canvasRef.current;
    };

    const resetCanvas = (): void => {
      setAction("none");
    };

    const setDefaultCanvas = () => {
      // setPanOffset({ x: 0, y: 0 });
      // setZoomOffset({ x: 0, y: 0 });
      // setZoom(1);
    };

    useImperativeHandle(ref, () => ({
      getContext,
      setSize,
      getSize,
      clear,
      drawClear,
      // captureFrameFromVideo,
      getOffset,
      getRef,
      getHistory,
      overwriteHistory,
      getSaveImageRef,
      resetCanvas,
      setDefaultCanvas,
      undo,
      redo,
      canUndo,
      canRedo,
    }));

    const [onCanvas, setOnCanvas] = useState(false);
    const [onChange, setOnChange] = useState(false);

    const preToolState = useRef(toolState);

    useEffect(() => {
      if (toolState !== preToolState.current) {
        setOnChange(true);
        preToolState.current = toolState;
      } else {
        setOnChange(false);
      }
    }, [toolState]);

    useEffect(() => {
      if (onChange) {
        const timer = setTimeout(() => {
          setOnChange(false);
        }, 3000);

        return () => clearTimeout(timer);
      }
    }, [onChange]);

    const mouseGuide = useSpring({
      opacity: !onCanvas && onChange ? 1 : 0,
      config: {
        duration: 100,
        easing: (t: any) => t,
      },
    });

    return (
      <>
        {action === "writing" ? (
          <textarea
            ref={textareaRef}
            onBlur={(e) => handleBlur(e)}
            style={{
              position: "fixed",
              top: selectedElement?.y1,
              left: selectedElement?.x1,
              font: `${selectedElement?.size}px "${selectedElement?.font}", sans-serif`,
              lineHeight: "120%",
              width: `${Math.max(
                (selectedElement?.x2 || 0) - (selectedElement?.x1 || 0),
                selectedElement?.size || 0
              )}px`,
              height: `${Math.max(
                ((selectedElement?.y2 || 0) - (selectedElement?.y1 || 0)) * 1.2,
                (selectedElement?.size || 0) * 3 + 20
              )}px`,
              margin: 0,
              padding: 0,
              border: 0,
              outline: "solid",
              resize: "both",
              whiteSpace: "nowrap",
              background: "transparent",
              color: selectedElement?.color,
              opacity: selectedElement?.opacity,
              zIndex: 300,
            }}
          />
        ) : null}
        <canvas
          className="canvas"
          ref={canvasRef}
          onPointerDown={(e) => startDrawing(e)}
          onPointerUp={(e) => endDrawing(e)}
          onPointerEnter={() => setOnCanvas(true)}
          onPointerLeave={(e) => {
            endDrawing(e);
            setOnCanvas(false);
          }}
          onDoubleClick={(e) => handleOnDoubleClick(e)}
          style={{ display: "auto" }}
          onPointerMove={(e) => draw(e)}
        />
        {toolState.tool !== "text" && (
          <MouseSVG
            canvas={canvasRef.current}
            size={
              toolState.tool === "pen"
                ? toolState.size > 10
                  ? toolState.size
                  : 10
                : toolState.tool === "eraser"
                ? toolState.size > 10
                  ? toolState.size
                  : 10
                : 10
            }
            brightness={corsorColor}
            move={true}
          />
        )}
        {toolState.tool !== "text" && (
          <a.div style={mouseGuide}>
            <MouseSVG
              canvas={canvasRef.current}
              size={
                toolState.tool === "pen"
                  ? toolState.size > 10
                    ? toolState.size
                    : 10
                  : toolState.tool === "eraser"
                  ? toolState.size > 10
                    ? toolState.size
                    : 10
                  : 10
              }
              brightness={corsorColor}
              move={false}
            />
          </a.div>
        )}
      </>
    );
  }
);

export default Canvas;
