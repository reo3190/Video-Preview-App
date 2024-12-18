import React, { useRef, useState } from "react";

interface Props {
  path: string;
}

const VideoSeeker: React.FC<Props> = React.memo(({ path }) => {
  console.log("load:" + path);
  const videoRef = useRef<HTMLVideoElement | null>(null); // video要素の参照
  const [isSeeking, setIsSeeking] = useState<boolean>(false); // シーク中フラグ
  const [lastMouseX, setLastMouseX] = useState<number | null>(null); // 前回のマウス位置

  const MOVE_THRESHOLD = 10; // 一定距離 (ピクセル)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSeeking || !videoRef.current) return;

    const videoElement = videoRef.current;
    const rect = videoElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left; // 動画上のマウスX座標

    if (lastMouseX !== null && Math.abs(mouseX - lastMouseX) < MOVE_THRESHOLD) {
      // 前回位置から一定距離動いていない場合は処理をスキップ
      return;
    }

    // 前回位置を更新
    setLastMouseX(mouseX);

    const width = rect.width; // 動画の幅
    const duration = videoElement.duration; // 動画の長さ（秒）

    // マウス位置を秒数に変換
    const newTime = (mouseX / width) * duration;

    // 動画の時間を更新（範囲内か確認）
    if (newTime >= 0 && newTime <= duration) {
      videoElement.currentTime = newTime;
    }
  };

  const handleMouseLeave = () => {
    setIsSeeking(false);
    setLastMouseX(null); // シーク終了時にリセット

    if (!videoRef.current) return;
    const videoElement = videoRef.current;
    videoElement.currentTime = 0;
  };

  const handleMouseEnter = () => {
    setIsSeeking(true);
    setLastMouseX(null);
  };

  return (
    <div
      style={{ width: "250px", height: "auto", position: "relative" }}
      onMouseMove={handleMouseMove}
      // onMouseDown={handleMouseDown}
      // onMouseUp={handleMouseUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        width="100%"
        height="100%"
        src={`file:\\${path}`}
        preload="auto"
        // controls
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          cursor: "pointer",
          backgroundColor: "transparent",
        }}
      ></div>
    </div>
  );
});

export default VideoSeeker;
