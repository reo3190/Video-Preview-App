import { useEffect, useState } from "react";

interface UseKeyHandlerOptions {
  keyActions: {
    [key: string]: [(() => void) | null, (() => void) | null];
  };
  returnActions: (() => void) | null;
}

const useKeyHandler = ({
  keyActions,
  returnActions = null,
}: UseKeyHandlerOptions) => {
  const [pressedKeys, setPressedKeys] = useState(new Set<string>());

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      event.preventDefault();
      setPressedKeys((prevKeys) => {
        const updatedKeys = new Set(prevKeys);
        updatedKeys.add(key);

        // キーに対応する関数を実行
        if (keyActions[key][0]) {
          keyActions[key][0]();
        }

        return updatedKeys;
      });
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key;
      setPressedKeys((prevKeys) => {
        const updatedKeys = new Set(prevKeys);
        updatedKeys.delete(key);

        if (keyActions[key][1]) {
          keyActions[key][1]();
        }

        return updatedKeys;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);

      if (returnActions) {
        returnActions();
      }
    };
  }, [keyActions]);

  return pressedKeys;
};

export default useKeyHandler;
