"use client";

import { useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button type="button" onClick={copy} className="ml-2 inline-flex rounded-theme border border-border px-2 py-1 text-xs font-bold text-foreground hover:border-primary" aria-label={`Copy ${code}`}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
