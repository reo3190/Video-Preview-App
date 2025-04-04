import { createBridge } from "../render/Comp/ContextMenu/src/lib";

export interface ContextMenuTriggerData {
  img: string | null;
  video: Video | null;
}

export const ContextMenuBridge = createBridge<ContextMenuTriggerData>({
  img: null,
  video: null,
});
