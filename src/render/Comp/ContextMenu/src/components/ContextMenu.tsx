/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/no-children-prop */
import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  JSX,
  ReactNode,
} from "react";
import ContextMenuBridge, { CMMouseEvent } from "../ContextMenuBridge";
import useContextMenuDetails from "../useContextMenuDetails";
import ContextMenuOption, { CMContext } from "./ContextMenuOption";
import ContextMenuDivider from "./ContextMenuDivider";
import ContextMenuExpand from "./ContextMenuExpand";

export type ChildrenProp = ReactNode | ReactNode[];

export type XYPosition = {
  x: number;
  y: number;
};

export interface ContextMenuProps<T>
  extends Omit<
    React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLDivElement>,
      HTMLDivElement
    >,
    "onSelect"
  > {
  style?: React.CSSProperties;
  bridge: ContextMenuBridge<T>;
  dark?: boolean;
  onSelect?: (action: string, event: CMMouseEvent) => void;
}

const getYDirection = (
  menuRect: DOMRect,
  clickPosition: XYPosition
): string => {
  if (
    window.innerHeight + window.pageYOffset - clickPosition.y >
    menuRect.height
  )
    return "down";
  if (clickPosition.y - window.pageYOffset > menuRect.height) return "up";
  return "center";
};
const getXDirection = (
  menuRect: DOMRect,
  clickPosition: XYPosition
): string => {
  if (window.innerWidth + window.pageXOffset - clickPosition.x > menuRect.width)
    return "right";
  return "left";
};

// eslint-disable-next-line react/require-default-props
function ContextMenu<T>(props: ContextMenuProps<T>): JSX.Element {
  const {
    children,
    style = {},
    bridge,
    dark = false,
    onSelect,
    className,
    ...other
  } = props;
  const menuRef = useRef<HTMLDivElement>(null);
  const { clickPosition, open } = useContextMenuDetails(bridge);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [relativePosition, setRelativePosition] = useState<XYPosition>({
    x: 0,
    y: 0,
  });

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (open) {
      const handleOutsideClick = (e: CMMouseEvent) => {
        if (
          open &&
          menuRef.current &&
          e.target &&
          e.target instanceof Element &&
          !menuRef.current.contains(e.target)
        ) {
          bridge.handleClose(e);
        }
      };
      document.addEventListener("click", handleOutsideClick);
      return () => {
        document.removeEventListener("click", handleOutsideClick);
      };
    }
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    if (!anchorRef.current || !menuRef.current) return;

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const menuRect = menuRef.current.getBoundingClientRect();

    const xDir = getXDirection(menuRect, clickPosition);
    const yDir = getYDirection(menuRect, clickPosition);

    const x =
      xDir === "right"
        ? clickPosition.x - window.pageXOffset - anchorRect.left
        : clickPosition.x -
          window.pageXOffset -
          anchorRect.left -
          menuRect.width;
    // eslint-disable-next-line no-nested-ternary
    const y =
      yDir === "down"
        ? clickPosition.y - window.pageYOffset - anchorRect.top
        : yDir === "up"
        ? clickPosition.y -
          window.pageYOffset -
          anchorRect.top -
          menuRect.height
        : window.innerHeight - menuRect.height - anchorRect.top - 10;
    setRelativePosition({ x, y });
  }, [clickPosition, open]);

  const styles: React.CSSProperties = {
    ...style,
    ...{
      display: open ? "block" : "none",
      top: relativePosition.y,
      left: relativePosition.x,
      anchored: false,
    },
  };

  const doSelect = (action: string, event: CMMouseEvent): void => {
    if (onSelect) onSelect(action, event);
  };

  const doClose = (e: CMMouseEvent) => {
    bridge.forceClose(e);
  };

  return (
    <CMContext.Provider
      value={{
        doClose,
        doSelect,
        bridge,
        dark,
      }}
    >
      <div className="react-context-menu-anchor" ref={anchorRef}>
        <div
          {...other}
          className={`react-context-menu ${className || ""} ${
            dark ? " theme-dark" : ""
          }`}
          style={styles}
          ref={menuRef}
          onContextMenu={(e) => {
            e.preventDefault();
          }}
          children={children}
        />
      </div>
    </CMContext.Provider>
  );
}

// ContextMenu.defaultProps = {
//   style: {},
//   dark: false,
//   onSelect: undefined,
// };

ContextMenu.Option = ContextMenuOption;

ContextMenu.Divider = ContextMenuDivider;

ContextMenu.Expand = ContextMenuExpand;

export default ContextMenu;
