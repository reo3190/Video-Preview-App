import React, { useEffect, useState, useRef, FC } from "react";
import {
  PiPencilSimpleLine,
  PiEraser,
  PiTextT,
  PiWaveSineBold,
} from "react-icons/pi";
import {
  IoArrowUndo,
  IoArrowRedo,
  IoEllipseOutline,
  IoEllipse,
} from "react-icons/io5";
import { MdOpacity } from "react-icons/md";
import { VscTextSize } from "react-icons/vsc";
import { LuCircleDot } from "react-icons/lu";
import { useDataContext } from "../../../hook/UpdateContext";

interface Props {
  pRef: any;
  canUndo: boolean;
  canRedo: boolean;
}

const ToolBar: FC<Props> = ({ pRef, canUndo, canRedo }) => {
  const {
    paintTool,
    setPaintTool,
    activePaintTool,
    setActivePaintTool,
    paintConfig,
    setPaintConfig,
  } = useDataContext();
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });
  const [popup, setPopup] = useState(false);

  const contextRef = useRef<HTMLDivElement | null>(null);

  // const sizeRef = useRef<string>(String(paintTool[activePaintTool].size));
  // const opacityRef = useRef<string>(String(paintTool[activePaintTool].opacity));
  const smoothRef = useRef<string>(String(paintConfig.smooth));
  const pressRef = useRef<string>(String(paintConfig.pressure));

  const [sizeInput, setSizeInput] = useState<string>(
    String(paintTool[activePaintTool].size)
  );
  const [colorInput, setColorInput] = useState<string>(
    String(paintTool[activePaintTool].color)
  );
  const [opacityInput, setOpacityInput] = useState<string>(
    String(paintTool[activePaintTool].opacity * 100)
  );

  const setSize = (input: string): void => {
    const num = Number(input);
    if (!isNaN(num)) {
      setSizeInput(input);
      setPaintTool(activePaintTool, { size: num });
    }
  };

  const setColor = (input: string): void => {
    setColorInput(input);
    setPaintTool(activePaintTool, { color: input });
  };

  const setOpacity = (input: string) => {
    const num = Number(input);
    if (!isNaN(num)) {
      setOpacityInput(input);
      setPaintTool(activePaintTool, { opacity: num / 100 });
    }
  };

  const getSmooth = (bool: boolean): number => {
    const num = Number(smoothRef.current);
    if (!num || bool) {
      return paintConfig.smooth;
    } else {
      return num;
    }
  };

  const setSmooth = (input: string): void => {
    smoothRef.current = input;
    const num = Number(input);
    if (!num) {
      const value = Math.floor(num);
      setPaintConfig({ smooth: value });
    } else {
      const get = getSmooth(true);
      setPaintConfig({ smooth: get });
    }
  };

  const getPress = (bool: boolean): number => {
    const num = Number(pressRef.current);
    if (!num || bool) {
      return paintConfig.pressure;
    } else {
      return num;
    }
  };

  const setPress = (input: string): void => {
    pressRef.current = input;
    const num = Number(input);
    if (!num) {
      const value = num / 100;
      setPaintConfig({ pressure: value });
    } else {
      const get = getPress(true);
      setPaintConfig({ pressure: get });
    }
  };

  // sizeRef.current = String(getSize(true));
  // opacityRef.current = String(getOpacity(true));
  smoothRef.current = String(getSmooth(true));
  pressRef.current = String(getPress(true));

  useEffect(() => {
    // sizeRef.current = String(getSize(true));
    // opacityRef.current = String(getOpacity(true));
  }, [activePaintTool]);

  const handleBlur = (
    input: string,
    setFunc: (e: string) => void,
    // getFunc: (e: boolean) => string
    def: string
  ): void => {
    if (input === "") {
      setFunc(def);
    }
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent): void => {
      e.preventDefault();
      setPopup(true);
      setPopupPos({ x: e.clientX, y: e.clientY });
    };

    const handleClose = (e: MouseEvent): void => {
      const el = contextRef.current;
      const target = e.target as Node | null;
      if (!el || !target) return;
      if (!el.contains(target)) {
        setPopup(false);
      }
    };

    const handleEnter = (e: KeyboardEvent): void => {
      if (e.key === "Enter" && popup) {
        e.preventDefault();
        setPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClose);
    document.addEventListener("contextmenu", handleClick);
    document.addEventListener("keydown", handleEnter);
    return () => {
      document.removeEventListener("mousedown", handleClose);
      document.removeEventListener("contextmenu", handleClick);
      document.removeEventListener("keydown", handleEnter);
    };
  }, []);

  return (
    <>
      <div className="tool-bar-inner">
        <input
          type="radio"
          id="pen"
          checked={activePaintTool === "pen"}
          onChange={() => setActivePaintTool("pen")}
        />
        <label
          className={`tool ${activePaintTool === "pen" ? "active" : null}`}
          htmlFor="pen"
        >
          <PiPencilSimpleLine size={"2.5rem"} />
        </label>
        <input
          type="radio"
          id="eraser"
          checked={activePaintTool === "eraser"}
          onChange={() => setActivePaintTool("eraser")}
        />
        <label
          className={`tool ${activePaintTool === "eraser" ? "active" : null}`}
          htmlFor="eraser"
        >
          <PiEraser size={"2.5rem"} />
        </label>
        <input
          type="radio"
          id="text"
          checked={activePaintTool === "text"}
          onChange={() => setActivePaintTool("text")}
        />
        <label
          className={`tool ${activePaintTool === "text" ? "active" : null}`}
          htmlFor="text"
        >
          <PiTextT size={"2.5rem"} />
        </label>
        <hr />
        <div className="input-detail-wrapper">
          <div className="input-detail">
            {activePaintTool === "text" ? (
              <VscTextSize size={"2rem"} />
            ) : activePaintTool === "pen" ? (
              <IoEllipse size={"2rem"} />
            ) : (
              <IoEllipseOutline size={"2rem"} />
            )}
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSize(e.target.value)}
              onBlur={(e) => handleBlur(e.target.value, setSize, "10")}
            />
            {/* <div className="size-wrapper">
                <input
                    type="range"
                    value={toolState.pen.size > 100?100 + ((toolState.pen.size - 100) / 8):toolState.pen.size}
                    onChange={(e)=>setToolState((pre) => ({...pre, pen: {...pre.pen, size: e.target.value > 100?100 + ((e.target.value - 100) * 8):e.target.value}}))}
                    min="0"
                    max="150"
                    step="0.01"
                />
              </div> */}
          </div>
          <div className="input-detail">
            <input
              type="color"
              className={`${activePaintTool}`}
              value={colorInput}
              onChange={(e) => setColor(e.target.value)}
            />
          </div>
          <div className="input-detail">
            <MdOpacity size={"2rem"} />
            <input
              type="text"
              value={opacityInput}
              onChange={(e) => setOpacity(e.target.value)}
              onBlur={(e) => {
                handleBlur(e.target.value, setOpacity, "100");
              }}
              min="0"
              max="100"
            />
            {/* <div className="size-wrapper">
                <input
                    type="range"
                    value={toolState.pen.opacity}
                    onChange={(e)=>setToolState((pre) => ({...pre, pen: {...pre.pen, opacity: e.target.value}}))}
                    min="0"
                    max="1"
                    step="0.01"
                />
              </div> */}
          </div>
        </div>
        <hr />
        <div className="input-detail-wrapper">
          <div className="input-detail">
            <PiWaveSineBold size={"2rem"} />
            <input
              type="number"
              value={getSmooth(false)}
              onChange={(e) => setSmooth(e.target.value)}
              onBlur={(e) => handleBlur(e.target.value, setSmooth, "0")}
              min="0"
              max="10"
            />
            {/* <div className="size-wrapper">
                <input
                    type="range"
                    value={toolState.pen.size > 100?100 + ((toolState.pen.size - 100) / 8):toolState.pen.size}
                    onChange={(e)=>setToolState((pre) => ({...pre, pen: {...pre.pen, size: e.target.value > 100?100 + ((e.target.value - 100) * 8):e.target.value}}))}
                    min="0"
                    max="150"
                    step="0.01"
                />
              </div> */}
          </div>
          <div className="input-detail">
            <LuCircleDot size={"2rem"} />
            <input
              type="number"
              value={Math.floor(getPress(false) * 100)}
              onChange={(e) => setPress(e.target.value)}
              onBlur={(e) => handleBlur(e.target.value, setPress, "0")}
              min="0"
              max="100"
            />
            {/* <div className="size-wrapper">
                <input
                    type="range"
                    value={toolState.pen.size > 100?100 + ((toolState.pen.size - 100) / 8):toolState.pen.size}
                    onChange={(e)=>setToolState((pre) => ({...pre, pen: {...pre.pen, size: e.target.value > 100?100 + ((e.target.value - 100) * 8):e.target.value}}))}
                    min="0"
                    max="150"
                    step="0.01"
                />
              </div> */}
          </div>
        </div>
        <div className="history">
          <button onClick={() => pRef.current?.undo()} disabled={!canUndo}>
            <IoArrowUndo size={"2rem"} />
          </button>
          <button onClick={() => pRef.current?.redo()} disabled={!canRedo}>
            <IoArrowRedo size={"2rem"} />
          </button>
        </div>
      </div>
      {popup && (
        <div
          className="tool-bar-popup"
          style={{ top: popupPos.y - 22, left: popupPos.x - 20 }}
          ref={contextRef}
        >
          <div className="popup-size range">
            <input
              type="text"
              value={sizeInput}
              onChange={(e) => setSize(e.target.value)}
              onBlur={(e) => handleBlur(e.target.value, setSize, "10")}
            />
            <input
              type="range"
              value={
                Number(sizeInput) > 50
                  ? 50 + (Number(sizeInput) - 50) / 10
                  : sizeInput
              }
              onChange={(e) => {
                const num = Number(e.target.value);
                if (!num) return;
                const value = num > 50 ? 50 + (num - 50) * 10 : num;
                setSize(String(value));
              }}
              min="0"
              max="80"
              step="0.01"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ToolBar;
