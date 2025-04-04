import { handleSaveImages } from "../../Player/util/saveCaputure";

const handleSaveAllImages = async (
  nameList: Record<Path, string>,
  data: Markers,
  metaMap: Map<string, [Size, FPS, number]>
): Promise<MarkersRender> => {
  let markersRender: MarkersRender = {};

  for (const [videoPath, marker] of Object.entries(data)) {
    if (!videoPath || !marker) continue;
    const meta = metaMap.get(videoPath) || null;
    if (!meta) continue;
    if (!(videoPath in nameList)) continue;
    const name = nameList[videoPath];
    const res = await handleSaveImages(
      name,
      marker,
      videoPath,
      meta[0],
      meta[1]
    );
    markersRender = { ...markersRender, ...res };
  }

  return markersRender;
};

export { handleSaveAllImages };
