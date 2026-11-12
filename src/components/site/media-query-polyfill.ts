// Safari before 14 (still the engine inside some iOS in-app browsers such as KakaoTalk on iOS 13)
// gives MediaQueryList only addListener/removeListener. framer-motion calls addEventListener
// unguarded when any motion component mounts, which throws and unmounts the page. Map the modern
// methods onto the old ones before anything renders. Imported for its side effect by
// consent-context.tsx, which both root layouts load.
if (typeof window !== "undefined" && typeof MediaQueryList !== "undefined") {
  const proto = MediaQueryList.prototype as MediaQueryList & {
    addListener: (listener: (event: MediaQueryListEvent) => void) => void;
    removeListener: (listener: (event: MediaQueryListEvent) => void) => void;
  };
  if (typeof proto.addEventListener !== "function" && typeof proto.addListener === "function") {
    Object.defineProperty(proto, "addEventListener", {
      configurable: true,
      writable: true,
      value(this: MediaQueryList, type: string, listener: (event: MediaQueryListEvent) => void) {
        if (type === "change" && typeof listener === "function") this.addListener(listener);
      },
    });
    Object.defineProperty(proto, "removeEventListener", {
      configurable: true,
      writable: true,
      value(this: MediaQueryList, type: string, listener: (event: MediaQueryListEvent) => void) {
        if (type === "change" && typeof listener === "function") this.removeListener(listener);
      },
    });
  }
}

export {};
