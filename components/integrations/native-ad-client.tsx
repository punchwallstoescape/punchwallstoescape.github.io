"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function NativeAdClient({ scriptUrl, containerId }: { scriptUrl: string; containerId: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const timer = window.setTimeout(() => {
      // The official ID is unique; only one mounted slot may own it.
      if (document.getElementById(containerId)) return;
      const container = document.createElement("div");
      container.id = containerId;
      host.appendChild(container);

      const script = document.createElement("script");
      script.async = true;
      script.src = scriptUrl;
      script.dataset.cfasync = "false";
      script.dataset.gameWikiNativeAd = containerId;
      host.insertBefore(script, container);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      host.replaceChildren();
    };
  }, [containerId, scriptUrl, pathname]);

  return <aside className="ad-slot ad-native" aria-label="Advertisement">
    <p className="ad-label">Advertisement</p>
    <div ref={hostRef} data-native-ad-slot />
  </aside>;
}
