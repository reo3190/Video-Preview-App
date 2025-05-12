import React, {
  Component,
  useEffect,
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
} from "react";
import MouseSVG from "./mouseSVG";
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
  baseSize: Size;
  size: Size;
  calcBrightness: (x: number, y: number, size: number) => number;
  tool: PaintToolName;
  toolState: PaintToolConfig;
  paintConfig: PaintConfig;
  setCanUndo: React.Dispatch<React.SetStateAction<boolean>>;
  setCanRedo: React.Dispatch<React.SetStateAction<boolean>>;
  onDraw: (history: PaintElement[][], index: number, scale?: Size) => void;
}

interface Size {
  w: number;
  h: number;
}

const Paint = forwardRef<any, Props>(
  (
    {
      baseSize,
      size,
      calcBrightness,
      tool,
      toolState,
      paintConfig,
      setCanUndo,
      setCanRedo,
      onDraw,
    },
    ref
  ) => {
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
    } = useHistory(1, [[]], onDraw);
    const [selectedElement, setSelectedElement] = useState<PaintElement | null>(
      null
    );
    const [action, setAction] = useState("none");
    const [hoverText, setHoverText] = useState(false);
    const pressure = useRef(1);
    const backBrightness = useRef(0);
    const [corsorColor, setCorsorColor] = useState(true);
    // const pressedKeys = usePressedKeys();
    const [focus, setFocus] = useState(true);

    const [_size, _setSize] = useState<number>(0);
    const [scale, setScale] = useState<Size>({ w: 1, h: 1 });

    const [baseDimensions, setBaseDimensions] = useState<Size>(baseSize);

    const [update, setUpdate] = useState<boolean | null>(null);

    const drawCanvas = () => {
      const canvasCtx = getContext();
      clear();

      canvasCtx?.save();

      elements.forEach((element, i) => {
        if (action === "writing" && selectedElement?.id === element.id) return;
        drawElement(
          canvasCtx,
          element,
          canvasRef.current?.width,
          canvasRef.current?.height,
          scale
        );
      });

      canvasCtx?.restore();
    };

    useLayoutEffect(() => {
      drawCanvas();
    }, [elements, action, scale]);

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
      switch (tool) {
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

      setSize(size);

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

    useEffect(() => {
      if (update !== null) {
        onDraw(history, index, baseDimensions);
      }
    }, [update]);

    const start_mouse = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType !== "mouse") return;
      const offsetX = e.nativeEvent.offsetX;
      const offsetY = e.nativeEvent.offsetY;
      const button = e.button;

      startDrawing(offsetX, offsetY, button);
    };

    const start_pen = (e: React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();

      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;

      startDrawing(x, y);
    };

    const startDrawing = (
      offsetX: number,
      offsetY: number,
      button: number | null = null
    ) => {
      if (tool === "mouse") return;
      if (action === "writing" || !focus || (button && button === 2)) return;

      const { x, y } = getMouseCoordinates(offsetX, offsetY);

      const clickEl = getElementAtPosition(x, y, elements);
      if (clickEl && tool === "text") {
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
          tool,
          toolState,
          paintConfig,
          pressure
        );
        setElements((prevState) => [...prevState, element]);
        setSelectedElement(element);

        setAction(tool === "text" ? "writing" : "drawing");
      }
    };

    const draw_mouse = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;
      const target = e.target;

      draw(x, y, target);
    };

    const draw_pen = (e: React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();

      const x = e.touches[0].clientX - rect.left;
      const y = e.touches[0].clientY - rect.top;
      const target = e.touches[0].target;

      draw(x, y, target);
    };

    const draw = (offsetX: number, offsetY: number, target: EventTarget) => {
      if (tool === "mouse") return;

      const { x, y } = getMouseCoordinates(offsetX, offsetY);

      if (tool === "pen" || "eraser") {
        const size = toolState.size;
        backBrightness.current = calcBrightness(offsetX, offsetY, size);
        backBrightness.current < 128
          ? setCorsorColor(true)
          : setCorsorColor(false);
      }

      if (tool === "text") {
        const element = getElementAtPosition(x, y, elements);
        const HTMLTarget = target as HTMLElement;
        if (element && element.position === "inside" && action !== "writing") {
          HTMLTarget.style.cursor = cursorForPosition(element.position);
          setHoverText(true);
        } else {
          HTMLTarget.style.cursor = "text";
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
          tool,
          toolState,
          paintConfig,
          pressure,
          getContext(),
          scale
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
          tool,
          toolState,
          paintConfig,
          pressure,
          getContext(),
          scale
        );
      }
    };

    const end_mouse = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType !== "mouse") {
        return;
      }
      const x = e.nativeEvent.offsetX;
      const y = e.nativeEvent.offsetY;

      endDrawing(x, y);
    };

    const end_pen = (e: React.TouchEvent<HTMLCanvasElement>) => {
      const canvas = e.currentTarget;
      const rect = canvas.getBoundingClientRect();

      const x = e.changedTouches[0].clientX - rect.left;
      const y = e.changedTouches[0].clientY - rect.top;

      endDrawing(x, y);
    };

    const endDrawing = (offsetX: number, offsetY: number) => {
      if (tool === "mouse") return;
      if (action === "writing" || action === "none") return;

      const { x, y } = getMouseCoordinates(offsetX, offsetY);

      if (action === "drawing") {
        const canvasCtx = getContext();
        switch (tool) {
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

      // saveHistory();
      // onDraw(history, index, baseDimensions);
      setUpdate((p) => !p);
    };

    const handleBlur = (e: any) => {
      if (!selectedElement) return;
      const { id, x1, y1, tool, size, color, opacity, font } = selectedElement;
      setAction("none");
      setSelectedElement(null);
      // onDraw(history, index, baseDimensions);
      setUpdate((p) => !p);

      updateElement(
        id,
        x1,
        y1,
        0,
        0,
        {
          id,
          tool,
          text: e.target.value,
          size: size,
          color: color,
          opacity: opacity,
          font: font,
        },
        elements,
        setElements,
        tool,
        toolState,
        paintConfig,
        pressure,
        getContext(),
        scale
      );
    };

    const handleOnDoubleClick = (
      e: React.MouseEvent<HTMLCanvasElement, MouseEvent>
    ) => {
      if (!hoverText) return;
      const { x, y } = getMouseCoordinates(
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY
      );

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
            position: positionWithinElement(x, y, element, scale) || null,
          }))
          .find((element) => element.position !== null) ?? null
      );
    };

    const getMouseCoordinates = (
      offsetX: number,
      offsetY: number
    ): { x: number; y: number } => {
      const x = offsetX / scale.w;
      const y = offsetY / scale.h;
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
      const ctx = getContext();
      if (canvasRef.current && ctx) {
        if (baseDimensions.w === 0 && baseDimensions.h === 0) {
          setBaseDimensions({ w: size.w, h: size.h });

          canvasRef.current.width = size.w;
          canvasRef.current.height = size.h;
        } else {
          const scaleX = size.w / baseDimensions.w;
          const scaleY = size.h / baseDimensions.h;
          setScale({ w: scaleX, h: scaleY });

          canvasRef.current.width = size.w;
          canvasRef.current.height = size.h;

          ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
        }

        _setSize(size.w);
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
        "clear",
        { size: 0, color: "", opacity: 0 },
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
      clear();
      setHistory(e.history);
      setIndex(e.index);

      drawCanvas();
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
          canvasRef.current?.height,
          scale
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

    // const saveHistory = () => {
    //   if (curVideo?.path) {
    //     setVideoMarkers(curVideo.path, history);
    //   }
    // };

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

    return (
      <div className="canvas-container">
        {action === "writing" ? (
          <textarea
            ref={textareaRef}
            onBlur={(e) => handleBlur(e)}
            style={{
              position: "fixed",
              top: (selectedElement?.y1 || 1) * scale.h,
              left: (selectedElement?.x1 || 1) * scale.w,
              // top: "0",
              // left: "0",
              font: `${(selectedElement?.size || 1) * scale.w * 10}px "${
                selectedElement?.font
              }", sans-serif`,
              lineHeight: "120%",
              // width: `${Math.max(
              //   ((selectedElement?.x2 || 0) - (selectedElement?.x1 || 0)) *
              //     scale.w,
              //   (selectedElement?.size || 0) * scale.w
              // )}px`,
              width: `50%`,
              // height: `${Math.max(
              //   ((selectedElement?.y2 || 0) - (selectedElement?.y1 || 0)) * 1.2,
              //   (selectedElement?.size || 0) * 3 + 20
              // )}px`,
              height: `${(selectedElement?.size || 0) * 10 * 1.2}px`,
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
          className={`canvas ${tool === "mouse" && "showMouse"}`}
          ref={canvasRef}
          onPointerDown={(e) => start_mouse(e)}
          onPointerUp={(e) => end_mouse(e)}
          onPointerEnter={() => setOnCanvas(true)}
          onPointerLeave={(e) => {
            end_mouse(e);
            setOnCanvas(false);
          }}
          onDoubleClick={(e) => handleOnDoubleClick(e)}
          style={{ display: "auto", pointerEvents: "auto" }}
          onPointerMove={(e) => draw_mouse(e)}
          onTouchMove={(e) => draw_pen(e)}
          onTouchStart={(e) => start_pen(e)}
          onTouchEnd={(e) => end_pen(e)}
        />

        {tool !== "text" && tool !== "mouse" && (
          <MouseSVG
            canvas={canvasRef.current}
            size={
              toolState.size > 10
                ? toolState.size * scale.w
                : toolState.size * scale.h
            }
            brightness={corsorColor}
            move={true}
          />
        )}
      </div>
    );
  }
);

export default Paint;
