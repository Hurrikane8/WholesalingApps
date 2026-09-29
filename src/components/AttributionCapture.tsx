"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/** Records the landing page and campaign parameters on the first page of each visit (spec 8.2). */
export function AttributionCapture() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
