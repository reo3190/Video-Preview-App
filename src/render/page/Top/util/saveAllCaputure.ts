import { handleSaveImages } from "../../Player/util/saveCaputure";

const handleSaveAllImages = async (
  nameList: Record<Path, string>,
  data: Markers,
  metaMap: Map<string, [Size, FPS, number]>,
  setProgress: React.Dispatch<React.SetStateAction<number>>
): Promise<MarkersRender> => {
  let markersRender: MarkersRender = {};

  const count = Object.keys(data).length;
  setProgress(0);

  for (const [index, [videoPath, marker]] of Object.entries(data).entries()) {
    setProgress(((index + 1) / count) * 100);

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
  setProgress(100);

  return markersRender;
};

export { handleSaveAllImages };
