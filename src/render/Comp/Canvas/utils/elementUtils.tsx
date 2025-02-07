import getStroke, { StrokeOptions } from "perfect-freehand";

const createElement = (
  id: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  tool: PaintToolName,
  toolState: PaintToolConfig,
  paintConfig: PaintConfig,
  pressure: React.RefObject<number>
): PaintElement => {
  switch (tool) {
    case "pen":
      const options1: StrokeOptions = {
        size: toolState.size,
        thinning: paintConfig.pressure,
        smoothing: 1,
        streamline: 0.8,
        easing: (t: any) => t,
        simulatePressure: false,
      };
      return {
        id,
        tool,
        points: [{ x: x1, y: y1, pressure: pressure.current }],
        size: toolState.size,
        color: toolState.color,
        opacity: toolState.opacity,
        option: options1,
      };
    case "text":
      return {
        id,
        tool,
        x1,
        y1,
        x2,
        y2,
        text: "",
        size: toolState.size,
        color: toolState.color,
        opacity: toolState.opacity,
        font: "Noto Sans JP",
      };
    case "eraser":
      const options2 = {
        size: toolState.size,
        thinning: paintConfig.pressure,
        smoothing: 1,
        streamline: 0.8,
        easing: (t: any) => t,
        simulatePressure: false,
      };
      return {
        id,
        tool,
        points: [{ x: x1, y: y1, pressure: pressure.current }],
        size: toolState.size,
        opacity: toolState.opacity,
        option: options2,
      };
    case "clear":
    case "mouse":
      return {
        id,
        tool,
      };
  }
};

const updateElement = (
  id: number,
  x1: number = 0,
  y1: number = 0,
  x2: number = 0,
  y2: number = 0,
  selectedElement: PaintElement | null,
  elements: PaintElement[],
  setElements: (
    action: ((e: PaintElement[]) => PaintElement[]) | PaintElement[],
    overwrite?: boolean
  ) => void,
  tool: PaintToolName,
  toolState: PaintToolConfig,
  paintConfig: PaintConfig,
  pressure: React.RefObject<number>,
  canvasCtx: any,
  scale: Size
): void => {
  const elementsCopy: PaintElement[] = [...elements];

  switch (tool) {
    case "eraser":
    case "pen":
      if (!elementsCopy[id].points) return;
      elementsCopy[id].points = [
        ...elementsCopy[id].points,
        { x: x2, y: y2, pressure: pressure.current },
      ];
      let first = elementsCopy[id].points.slice(
        0,
        elementsCopy[id].points.length - paintConfig.smooth
      );
      let second = elementsCopy[id].points.slice(
        elementsCopy[id].points.length - paintConfig.smooth
      );
      const smoothedPoints = getSmoothedPoints(second);
      elementsCopy[id].points = first.concat(smoothedPoints);
      break;
    case "text":
      if (!selectedElement) return;
      canvasCtx.textBaseline = "top";
      canvasCtx.font = `${(elementsCopy[id].size || 1) * 10}px '${
        elementsCopy[id].font
      }', sans-serif`;
      const fixedSize = fixedSizeText(
        selectedElement.text || "",
        (elementsCopy[id].size || 1) * 10
      );
      const textWidth = canvasCtx.measureText(fixedSize.widthText).width;
      const textHeight = fixedSize.height;
      elementsCopy[id] = {
        ...createElement(
          id,
          x1,
          y1,
          x1 + textWidth,
          y1 + textHeight,
          tool,
          toolState,
          paintConfig,
          pressure
        ),
        text: selectedElement.text,
        size: selectedElement.size,
        color: selectedElement.color,
        opacity: selectedElement.opacity,
        font: selectedElement.font,
      };
      break;
    case "clear":
    case "mouse":
      break;
    default:
      throw new Error(`Type not recognised: ${tool}`);
  }

  setElements(elementsCopy, true);
};

const drawElement = (
  context: any,
  element: PaintElement,
  width: number = 0,
  height: number = 0,
  scale: Size
): void => {
  switch (element.tool) {
    case "pen":
      context.fillStyle = hexToRgba(element.color, element.opacity);
      const penStroke = getSvgPathFromStroke(
        getStroke(element.points || [], element.option)
      );
      context.fill(new Path2D(penStroke));
      break;
    case "text":
      context.textBaseline = "top";
      const fontSize = (element.size as number) * 10;
      context.font = `${fontSize}px '${element.font}', sans-serif`;
      context.fillStyle = hexToRgba(element.color, element.opacity);
      fixedFillText(
        context,
        element.text,
        element.x1,
        element.y1,
        fontSize,
        scale
      );
      break;
    case "eraser":
      context.globalCompositeOperation = "destination-out";
      context.fillStyle = hexToRgba("#000", element.opacity);
      const eraserStroke = getSvgPathFromStroke(
        getStroke(element.points || [], element.option)
      );
      context.fill(new Path2D(eraserStroke));
      context.globalCompositeOperation = "source-over";
      break;
    case "clear":
      const zoomWidth = width * 5;
      const zoomHeight = height * 5;
      const zoomOffsetX = (zoomWidth - width) / 2;
      const zoomOffsetY = (zoomHeight - height) / 2;
      context.clearRect(-zoomOffsetX, -zoomOffsetY, width * 5, height * 5);
      break;
    case "mouse":
      break;
    default:
      throw new Error(`Type not recognised: ${element.tool}`);
  }
};

const fixedSizeText = (
  text: string,
  lineHeight: number = 0
): { widthText: string; height: number } => {
  const column = text.split("\n");
  const longestString = column.reduce((longest, current) => {
    return current.length > longest.length ? current : longest;
  }, "");

  return { widthText: longestString, height: lineHeight * 1.2 * column.length };
};

const fixedFillText = (
  context: any,
  text: string = "",
  x: number = 0,
  y: number = 0,
  lineHeight: number = 0,
  scale: Size,
  align: "right" | "left" | "center" = "left"
): void => {
  const ty = y - lineHeight / 2;

  const column = text.split("\n");
  let padding = 0;

  for (var i = 0; i < column.length; i++) {
    const textWidth = context.measureText(column[i]).width;
    if (align === "right") {
      padding = -textWidth;
    } else if (align === "center") {
      padding = -textWidth / 2;
    } else {
      padding = 0;
    }
    context.fillText(column[i], x + padding, ty + lineHeight * 1.2 * i);
  }
};

function getSmoothedPoints(points: PaintPoint[]): PaintPoint[] {
  const total = points.reduce(
    (acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      return acc;
    },
    { x: 0, y: 0 }
  );

  const avgPoint = {
    x: total.x / points.length,
    y: total.y / points.length,
  };

  return points.map((point) => ({
    x: (point.x + avgPoint.x) / 2,
    y: (point.y + avgPoint.y) / 2,
    pressure: point.pressure,
  }));
}

const hexToRgba = (hex: string = "", opacity: number = 0): string => {
  let r = 0,
    g = 0,
    b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex[1] + hex[2], 16);
    g = parseInt(hex[3] + hex[4], 16);
    b = parseInt(hex[5] + hex[6], 16);
  }
  return `rgba(${r},${g},${b},${opacity})`;
};

const getSvgPathFromStroke = (stroke: number[][]): string => {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"]
  );

  d.push("Z");
  return d.join(" ");
};

export { createElement, updateElement, drawElement };
