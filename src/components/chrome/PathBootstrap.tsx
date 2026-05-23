"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCompassStore } from "@/store/compass";
import type { CompassPath } from "@/lib/path";

/**
 * Reads `?path=preset|custom` from the URL and pushes it into the store.
 * Mirrors the behavior of `_v3-path.js` from the demo, minus the sessionStorage
 * fallback — Next handles router-state continuity, and the store survives
 * client-side navigation between steps within the create flow.
 */
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
