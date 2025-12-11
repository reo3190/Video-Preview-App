import React, { useState, useEffect, FC } from "react";
import { zoomStyleType } from "../../page/Player";
interface Props {
  canvas: HTMLCanvasElement | null;
  size: number;
  move: boolean;
  zoomStyle: zoomStyleType;
  zOffset: Size;
  zScale: number;
  outerRef: React.RefObject<HTMLDivElement | null>;
}
const MouseSVG: FC<Props> = ({
  canvas,
  size,
  move,
  zoomStyle,
  zOffset,
  zScale,
  outerRef,
}) => {
  const [mousePosition, setMousePosition] = useState({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });
  const [isMouseInside, setIsMouseInside] = useState(true);

  useEffect(() => {
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    };

    const handleMouseEnter = () => {
      setIsMouseInside(true);
    };

    const handleMouseLeave = () => {
      setIsMouseInside(false);
    };

    const updateMousePositionToCenter = () => {
      const rect = canvas.getBoundingClientRect();
      setMousePosition({
        x: rect.width / 2,
        y: rect.height / 2,
      });
    };

    if (move) {
      canvas.addEventListener("pointermove", handleMouseMove);
      canvas.addEventListener("pointerenter", handleMouseEnter);
      canvas.addEventListener("pointerleave", handleMouseLeave);
    } else {
      updateMousePositionToCenter();
      window.addEventListener("resize", updateMousePositionToCenter);
    }

    return () => {
      canvas.removeEventListener("pointermove", handleMouseMove);
      canvas.removeEventListener("pointerenter", handleMouseEnter);
      canvas.removeEventListener("pointerleave", handleMouseLeave);
      window.removeEventListener("resize", updateMousePositionToCenter);
    };
  }, [canvas, move, outerRef]);

  if (!isMouseInside) {
    return null;
  }

  return (
    // <a.div>
    <svg
      width={canvas ? canvas.width : 0}
      height={canvas ? canvas.height : 0}
      className="mouseSVG"
      style={{
        position: "absolute",
        transformOrigin: "top left",
        top: "50%",
        left: "50%",
        transform: `translate(calc(-50% + ${zOffset.w}px), calc(-50% + ${zOffset.h}px)) scale(${zScale})`,
        // background: "aqua",
      }}
    >
      <circle
        cx={(mousePosition.x - zOffset.w) / zScale}
        cy={(mousePosition.y - zOffset.h) / zScale}
        r={`${size / 2 + 1 || 0}`}
        fill="none"
        stroke={`white`}
      />

      <circle
        cx={(mousePosition.x - zOffset.w) / zScale}
        cy={(mousePosition.y - zOffset.h) / zScale}
        r={`${size / 2 || 0}`}
        fill="none"
        stroke={`black`}
      />
      {!move && (
        <circle
          cx={mousePosition.x}
          cy={mousePosition.y}
          r={`${size / 2 + 1 || 0}`}
          fill="none"
          stroke={"black"}
        />
      )}
    </svg>

    // </a.div>
  );
};

export default MouseSVG;
