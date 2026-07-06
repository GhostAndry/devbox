"use client";

import { useState, useCallback } from "react";

export default function TokenGenerator() {
  const [bytes, setBytes] = useState(32);
  const [encoding, setEncoding] = useState<"hex" | "base64" | "base64url">("hex");
  const [count, setCount] = useState(1);
  const [tokens, setTokens] = useState<string[]>([]);

  const generate = useCallback(() => {
    const result = Array.from({ length: count }, () => {
      const arr = new Uint8Array(bytes);
      crypto.getRandomValues(arr);
      if (encoding === "hex") return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
      const binary = String.fromCharCode(...arr);
      if (encoding === "base64") return btoa(binary);
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    });
    setTokens(result);
  }, [bytes, encoding, count]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Bytes</label>
          <input type="number" min={1} max={1024} value={bytes} onChange={(e) => setBytes(Math.max(1, Number(e.target.value)))} className="h-9 w-20 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Encoding</label>
          <select value={encoding} onChange={(e) => setEncoding(e.target.value as "hex" | "base64" | "base64url")} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value="hex">Hex</option>
            <option value="base64">Base64</option>
            <option value="base64url">Base64URL</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Count</label>
          <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value))))} className="h-9 w-20 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        </div>
        <button onClick={generate} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Generate</button>
        {tokens.length > 0 && <button onClick={() => navigator.clipboard.writeText(tokens.join("\n"))} className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent">Copy All</button>}
      </div>

      {tokens.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          {tokens.map((t, i) => (
            <div key={i} className="group flex items-center justify-between border-b border-border px-4 py-2 last:border-b-0">
              <code className="break-all font-mono text-sm">{t}</code>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <span className="text-[10px] text-muted-foreground">{t.length} chars</span>
                <button onClick={() => navigator.clipboard.writeText(t)} className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}