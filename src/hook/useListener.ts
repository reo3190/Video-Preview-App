import { useEffect } from "react";

export const onCheckOpen = (
  callback: (id: OpenFileFolderType) => Promise<void>,
  context: ContextType
) => {
  useEffect(() => {
    const removeListener = window.electron.onCheckOpen(callback);
    return () => {
      removeListener();
    };
  }, [context]);
};

export const onCheckOpenHistory = (
  callback: (p: Path, id: OpenFileFolderType) => Promise<void>,
  context: ContextType
) => {
  useEffect(() => {
    const removeListener = window.electron.onOpenFile(callback);
    return () => {
      removeListener();
    };
  }, [context]);
};
