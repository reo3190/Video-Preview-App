/* eslint-disable react/jsx-props-no-spreading */

import React, {
  useState,
  useRef,
  useLayoutEffect,
  useContext,
  JSX,
} from "react";
import { CMMouseEvent } from "../ContextMenuBridge";
import { CMContext } from "./ContextMenuOption";
import { XYPosition } from "./ContextMenu";

export interface ContextMenuExpandProps
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onSelect"
  > {
  style?: React.CSSProperties;
  onSelect?: (action: string, event: CMMouseEvent) => void;
  text: string;
}

// eslint-disable-next-line react/require-default-props
const ContextMenuExpand = (props: ContextMenuExpandProps): JSX.Element => {
  const { children, style = {}, onSelect, text, className, ...other } = props;
  const { bridge, dark, doSelect } = useContext(CMContext);
  const optionRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [relativePosition, setRelativePosition] = useState<XYPosition>({
    x: 0,
    y: 0,
  });
  const [expanded, setExpanded] = useState(false);

  useLayoutEffect(() => {
    if (!expanded || !optionRef.current || !menuRef.current) return;
    const optionRect = optionRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();
    const canGoRight = window.innerWidth - optionRect.right > menuRect.width;
    const canGoDown = window.innerHeight - optionRect.top > menuRect.height;
    const x = canGoRight ? optionRect.width : -optionRect.width;
    const y = canGoDown
      ? 0
      : window.innerHeight - menuRect.height - optionRect.top - 10;
    setRelativePosition({ x, y });
  }, [expanded]);

  const styles: React.CSSProperties = {
    ...style,
    display: expanded ? "block" : "none",
    top: relativePosition.y,
    left: relativePosition.x,
  };

  return (
    <CMContext.Provider
      value={{
        doClose: (e) => {
          bridge.forceClose(e);
        },
        doSelect: (action, event) => {
          if (onSelect) onSelect(action, event);
          else doSelect(action, event);
        },
        bridge,
        dark,
      }}
    >
      <div
        onMouseEnter={() => {
          setExpanded(true);
        }}
        onMouseLeave={() => {
          setExpanded(false);
        }}
        className="react-context-menu-option active expand-option"
        ref={optionRef}
        style={{ position: "relative" }}
      >
        {text}
        <span
          style={{
            position: "absolute",
            right: "0.5rem",
            top: "0.4rem",
            fontSize: "0.5rem",
          }}
        >
          ▶
        </span>
        <div
          {...other}
          className={`react-context-menu expand-menu ${className || ""} ${
            dark ? "theme-dark" : "theme-light"
          }`}
          ref={menuRef}
          style={styles}
        >
          {children}
        </div>
      </div>
    </CMContext.Provider>
  );
};

// ContextMenuExpand.defaultProps = {
//   style: {},
//   onSelect: undefined,
// };

export default ContextMenuExpand;
