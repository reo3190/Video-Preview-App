import { drawElement } from "../../../Comp/Canvas/utils/elementUtils";

export const CaptureDraw = (
  size: Size,
  history: [PaintElement[][], number, Size]
): HTMLCanvasElement => {
  const overCanvas = document.createElement("canvas");
  const overCtx = overCanvas.getContext("2d");

  overCanvas.width = history[2].w;
  overCanvas.height = history[2].h;

  const elements = history[0];
  const index = history[1];

  elements[index].forEach((element) => {
    drawElement(overCtx, element, history[2].w, history[2].h, { w: 1, h: 1 });
  });

  const baseCanvas = document.createElement("canvas");
  const baseCtx = baseCanvas.getContext("2d");

  baseCanvas.width = size.w;
  baseCanvas.height = size.h;

  baseCtx?.drawImage(
    overCanvas,
    0,
    0,
    overCanvas.width,
    overCanvas.height,
    0,
    0,
    baseCanvas.width,
    baseCanvas.height
  );

  return baseCanvas;
};

export const CompositeImages = (
  base: string,
  over: HTMLCanvasElement
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const newCanvas = document.createElement("canvas");
    const newContext = newCanvas.getContext("2d");

    newCanvas.width = over.width;
    newCanvas.height = over.height;

    const overlayImage = new Image();
    overlayImage.onload = function () {
      try {
        newContext?.drawImage(overlayImage, 0, 0);
        newContext?.drawImage(over, 0, 0);

        resolve(newCanvas.toDataURL());
      } catch (error) {
        reject(error);
      }
    };

    overlayImage.onerror = function () {
      reject(new Error("Failed to load the overlay image."));
    };

    overlayImage.src = "data:image/png;base64," + base;
  });
};
