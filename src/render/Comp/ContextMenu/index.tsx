import React, { useEffect, useState } from "react";
import { useDataContext } from "../../../hook/UpdateContext";
import { ContextMenu, useContextMenu, ContextMenuOption } from "./src/lib";
import RangeForm from "./RangeForm";
import SelectForm from "./SelectForm";
import { ContextMenuBridge } from "../../../hook/ContextMenuBridge";

type NaiveClipboardData =
  | {
      color: string;
      shape: string;
    }
  | undefined;

function VideoContextMenu() {
  const {
    videoMarkers,
    resetVideoMarker,
    editVideoList,
    setEditVideoList,
    tab,
  } = useDataContext();
  const { img, video } = useContextMenu(ContextMenuBridge);

  const [showRangeForm, setShowRangeForm] = useState<Boolean>(false);
  const [showSelectForm, setShowSelectForm] = useState<Boolean>(false);

  const [_img, setImg] = useState<string>("");
  const [_video, setVideo] = useState<Video>({
    name: "",
    path: "",
    extension: "",
    directory: [],
  });

  const marker = video ? videoMarkers[video.path] || {} : {};
  const markerCount = Object.keys(marker).length;

  const handleRange = () => {
    console.log("範囲");
    setShowRangeForm(true);
  };

  const handleSelect = () => {
    console.log("選択");
    setShowSelectForm(true);
  };

  const handleMarkerDelete = () => {
    if (video) {
      resetVideoMarker(video.path);
      if (!video.seq) {
        setEditVideoList(
          editVideoList.filter((e) => {
            return e != video;
          })
        );
      }
    }
  };

  const handleSequenceDelete = () => {
    if (video && video.seq) {
      if (markerCount > 0) {
        resetVideoMarker(video.path);
      }
      setEditVideoList(
        editVideoList.filter((e) => {
          return e != video;
        })
      );
    }
  };

  useEffect(() => {
    if (img) {
      setImg(img);
    }
    if (video) {
      setVideo(video);
    }
  }, [img, video]);

  const seqCreateBool = video && !video.seq && tab != "EDIT";
  const paintBool = markerCount > 0;
  const seqBool = video && video.seq;

  return (
    <>
      <ContextMenu dark={true} bridge={ContextMenuBridge}>
        {seqCreateBool && (
          <>
            <ContextMenuOption onClick={handleRange}>
              シーケンスを作成(範囲)
            </ContextMenuOption>
            <ContextMenuOption onClick={handleSelect}>
              シーケンスを作成(選択)
            </ContextMenuOption>
          </>
        )}

        {seqCreateBool && (paintBool || seqBool) && <ContextMenu.Divider />}

        {paintBool && (
          <ContextMenuOption onClick={handleMarkerDelete}>
            ペイントデータを削除
          </ContextMenuOption>
        )}
        {seqBool && (
          <>
            <ContextMenuOption onClick={handleSequenceDelete}>
              シーケンスを削除
            </ContextMenuOption>
          </>
        )}
      </ContextMenu>
      <div className="context-form">
        {showRangeForm && (
          <RangeForm
            img={_img}
            video={_video}
            setShowRangeForm={setShowRangeForm}
          />
        )}
        {showSelectForm && (
          <SelectForm
            img={_img}
            video={_video}
            setShowSelectForm={setShowSelectForm}
          />
        )}
      </div>
    </>
  );
}

export default VideoContextMenu;
