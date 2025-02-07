import { handleSaveImages } from "../../Player/util/saveCaputure";

const handleSaveAllImages = async (
  data: Markers,
  metaMap: Map<string, [Size, FPS]>
): Promise<MarkersRender> => {
  let markersRender: MarkersRender = {};

  for (const [videoPath, marker] of Object.entries(data)) {
    if (!videoPath || !marker) continue;
    const meta = metaMap.get(videoPath) || null;
    if (!meta) continue;
    const res = await handleSaveImages(marker, videoPath, meta[0], meta[1]);
    markersRender = { ...markersRender, ...res };
  }

  return markersRender;
};

export { handleSaveAllImages };
