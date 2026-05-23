"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCompassStore } from "@/store/compass";
import type { CompassPath } from "@/lib/path";

export function PathBootstrap() {
  const params = useSearchParams();
  const setPath = useCompassStore((s) => s.setPath);

  useEffect(() => {
    const p = params.get("path");
    if (p === "preset" || p === "custom") {
      setPath(p as CompassPath);
    }
  }, [params, setPath]);

  return null;
}
