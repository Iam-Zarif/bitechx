"use client";
import { useEffect } from "react";
export default (t) =>
  useEffect(() => {
    if (t) document.title = t;
  }, [t]);
