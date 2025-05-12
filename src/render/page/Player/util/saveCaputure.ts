import { CaptureDraw, CompositeImages } from "./capture";
import { frame2time } from "../../../../hook/api";

const handleSaveImages = async (
  name: string,
  markers: Marker,
  path: string,
  size: Size,
  fps: number,
  setProgress?: React.Dispatch<React.SetStateAction<number>>
): Promise<MarkersRender> => {
  if (!markers) return {};

  const frames = Object.keys(markers || {}).map(Number);

  const saveData = frames.map((e) => {
    const canvas = CaptureDraw(size, markers[e]);
    return {
      frame: e,
      sec: frame2time(e, fps),
      paint: canvas,
    };
  });

  const res = await window.electron.getCaputureData(path, saveData);
  const comp = await Promise.all(
    saveData.map(async (d, i) => {
      const frame = d.frame;
      const base64 = await CompositeImages(res[frame], d.paint);
      return { [d.frame]: base64 }; // 各フレーム番号とbase64を持つオブジェクトを返す
    })
  );

  // 結果をオブジェクトに変換
  const compObject: MarkerRender = comp.reduce((acc, item) => {
    const [key, value] = Object.entries(item)[0]; // 1つのキーと値を取得
    acc[Number(key)] = value; // オブジェクトに追加
    return acc;
  }, {});

  return { [name]: compObject };
};

export { handleSaveImages };
