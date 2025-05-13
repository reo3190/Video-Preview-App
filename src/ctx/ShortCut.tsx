import {
  createContext,
  useCallback,
  useState,
  useContext,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import { useNavigate, useLocation, To } from "react-router-dom";
// ---------------------------------------------------------

const defaultShortcuts: ShortCuts = {
  test: {
    key: "f",
    shiftKey: true,
  },
  // Video
  SeekDownMarker: {
    key: "ArrowLeft",
    ctrlKey: true,
  },
  SeekUpMarker: {
    key: "ArrowRight",
    ctrlKey: true,
  },
  ClickVideo: {
    key: " ",
  },
  VolumeUp: {
    key: "ArrowUp",
  },
  VolumeDown: {
    key: "ArrowDown",
  },
  NextVideo: {
    key: "PageDown",
  },
  PrevVideo: {
    key: "PageUp",
  },
  CopyPaint: {
    key: "c",
    ctrlKey: true,
  },
  PastePaint: {
    key: "v",
    ctrlKey: true,
  },
  Fullscreen: {
    key: "@",
  },
};

interface DataContext {
  shortcuts: ShortCuts;
  setShortcuts: (a: string, b: Keybind) => void;
  useKeybind: ({ keybind, onKeyDown, targetRef }: KeybindProps) => void;
  useKeybind_up: ({ keybind, onKeyDown, targetRef }: KeybindProps) => void;
}

const defaultContext: DataContext = {
  shortcuts: defaultShortcuts,
  setShortcuts: () => {},
  useKeybind: () => {},
  useKeybind_up: () => {},
};

const datactx = createContext<DataContext>(defaultContext);

export const useShortcutContext = () => useContext(datactx);

export const ShortcutProvider = ({ children }: { children: ReactNode }) => {
  const [shortcuts, setShortcuts] = useState<ShortCuts>(
    defaultContext.shortcuts
  );

  const updateShortcuts = useCallback((a: string, b: Keybind): void => {
    setShortcuts((prev) => ({
      ...prev,
      [a]: b,
    }));
  }, []);

  function useKeybind({ keybind, onKeyDown, targetRef }: KeybindProps) {
    const onKeyDownLatest = useLatest(onKeyDown);
    const { altKey, ctrlKey, metaKey, shiftKey, key } = shortcuts[keybind];

    useEffect(() => {
      const eventListener = (event: KeyboardEvent) => {
        if (altKey && !event.altKey) return;
        if (ctrlKey && !event.ctrlKey) return;
        if (metaKey && !event.metaKey) return;
        if (shiftKey && !event.shiftKey) return;
        if (event.key !== key) return;

        event.preventDefault();
        onKeyDownLatest.current?.(event);
      };

      if (targetRef?.current) {
        const target = targetRef.current;

        target.addEventListener("keydown", eventListener);
        return () => target.removeEventListener("keydown", eventListener);
      } else {
        window.addEventListener("keydown", eventListener);
        return () => window.removeEventListener("keydown", eventListener);
      }
    }, [altKey, ctrlKey, key, metaKey, onKeyDownLatest, shiftKey, targetRef]);
  }

  function useKeybind_up({ keybind, onKeyDown, targetRef }: KeybindProps) {
    const onKeyUpLatest = useLatest(onKeyDown);
    const { altKey, ctrlKey, metaKey, shiftKey, key } = shortcuts[keybind];

    useEffect(() => {
      const eventListener = (event: KeyboardEvent) => {
        if (altKey && !event.altKey) return;
        if (ctrlKey && !event.ctrlKey) return;
        if (metaKey && !event.metaKey) return;
        if (shiftKey && !event.shiftKey) return;
        if (event.key !== key) return;

        event.preventDefault();
        onKeyUpLatest.current?.(event);
      };

      if (targetRef?.current) {
        const target = targetRef.current;

        target.addEventListener("keyup", eventListener);
        return () => target.removeEventListener("keyup", eventListener);
      } else {
        window.addEventListener("keyup", eventListener);
        return () => window.removeEventListener("keyup", eventListener);
      }
    }, [altKey, ctrlKey, key, metaKey, onKeyUpLatest, shiftKey, targetRef]);
  }

  return (
    <datactx.Provider
      value={{
        shortcuts,
        setShortcuts: updateShortcuts,
        useKeybind,
        useKeybind_up,
      }}
    >
      {children}
    </datactx.Provider>
  );
};

//----------------------------------------------------------------------------------------------------
function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
