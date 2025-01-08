const positionWithinElement = (x: number, y: number, element: PaintElement) => {
  const { tool, size = 1, x1 = 0, x2 = 0, y1 = 0, y2 = 0 } = element;
  switch (tool) {
    case "pen":
    case "eraser":
    case "clear":
      return null;
    case "text":
      return x >= x1 && x <= x2 && y >= y1 - size / 2 && y <= y2 - size / 2
        ? "inside"
        : null;
    default:
      throw new Error(`Type not recognised: ${tool}`);
  }
};

const cursorForPosition = (position: string) => {
  switch (position) {
    case "tl":
    case "br":
    case "start":
    case "end":
      return "nwse-resize";
    case "tr":
    case "bl":
      return "nesw-resize";
    default:
      return "move";
  }
};

export { positionWithinElement, cursorForPosition };
