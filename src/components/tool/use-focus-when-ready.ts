"use client";

import { useEffect, useRef } from "react";

/**
 * Returns a ref for a tool's work area and focuses it when `ready` turns true. The drop zone that
 * held focus unmounts once the first file arrives, which would otherwise drop focus to <body>.
 */
export default function useFocusWhenReady<T extends HTMLElement>(ready: boolean) {
  const ref = useRef<T>(null);
  const wasReady = useRef(ready);
  useEffect(() => {
    if (ready && !wasReady.current) ref.current?.focus({ preventScroll: true });
    wasReady.current = ready;
  }, [ready]);
  return ref;
}
