"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { bannerCode } from "@/config/adsterra";

export function ResponsiveBanner() {
  const hostRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Defer until after mount; cancelling also prevents Strict Mode's trial mount
    // from executing a second copy of third-party code.
    const timer = window.setTimeout(() => {
      const mobile = !window.matchMedia("(min-width: 768px)").matches;
      const frame = document.createElement("iframe");
      frame.title = "Advertisement";
      frame.width = mobile ? "320" : "728";
      frame.height = mobile ? "50" : "90";
      frame.dataset.bannerSize = mobile ? "320x50" : "728x90";
      // A separate document preserves the supplied parser-inserted GET CODE
      // (including atOptions and document.write support) without blocking React.
      // These are trusted static snippets, never user-provided executable input.
      frame.srcdoc = `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0;padding:0}</style></head><body>${mobile ? bannerCode.mobile : bannerCode.desktop}</body></html>`;
      host.replaceChildren(frame);
    }, 0);
    // Keep the device choice fixed for this visit, even when the window resizes.
    return () => {
      window.clearTimeout(timer);
      host.replaceChildren();
    };
  }, [pathname]);

  return (
    <aside className="ad-slot ad-banner" aria-label="Advertisement">
      <p className="ad-label">Advertisement</p>
      <div className="ad-banner-host" data-responsive-banner ref={hostRef} />
    </aside>
  );
}
