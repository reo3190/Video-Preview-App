import React, { useEffect, useState } from "react";
import { isErr } from "./api";

export const onCheckOpen = (
  callback: (id: "openFile" | "openDirectory") => void
) => {
  useEffect(() => {
    const removeListener = window.electron.onCheckOpen(callback);
    return () => {
      removeListener();
    };
  }, []);
};
