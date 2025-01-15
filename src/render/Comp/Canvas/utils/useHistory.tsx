import { useState } from "react";

const useHistory = (
  initialIndex: number,
  initialState: PaintElement[][],
  onDraw: (history: PaintElement[][], index: number, scale?: Size) => void
): {
  elements: PaintElement[];
  setElements: (
    action: ((e: PaintElement[]) => PaintElement[]) | PaintElement[],
    overwrite?: boolean
  ) => void;
  undo: () => void | false;
  redo: () => void | false;
  canUndo: () => boolean;
  canRedo: () => boolean;
  history: PaintElement[][];
  setHistory: React.Dispatch<React.SetStateAction<PaintElement[][]>>;
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
} => {
  const [index, setIndex] = useState<number>(initialIndex - 1);
  const [history, setHistory] = useState<PaintElement[][]>(initialState);

  const setState = (
    action: ((e: PaintElement[]) => PaintElement[]) | PaintElement[],
    overwrite = false
  ): void => {
    const newState =
      typeof action === "function" ? action(history[index]) : action;
    if (overwrite) {
      const historyCopy = [...history];
      historyCopy[index] = newState;
      setHistory(historyCopy);
    } else {
      const updatedState = [...history].slice(0, index + 1);
      setHistory([...updatedState, newState]);
      setIndex((prevState) => prevState + 1);
    }
  };

  const undo = () => {
    if (index > 0) {
      setIndex((prevState) => prevState - 1);
      onDraw(history, index - 1);
    }
  };
  const redo = () => {
    if (index < history.length - 1) {
      setIndex((prevState) => prevState + 1);
      onDraw(history, index + 1);
    }
  };

  const canUndo = () => {
    return index > 0;
  };
  const canRedo = () => {
    return index < history.length - 1;
  };

  return {
    elements: history[index],
    setElements: setState,
    undo,
    redo,
    canUndo,
    canRedo,
    history,
    setHistory,
    index,
    setIndex,
  };
};

export default useHistory;
