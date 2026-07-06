"use client";

import { useState, useCallback } from "react";

const PRESETS: { label: string; alphabet: string }[] = [
  { label: "Default (A-Za-z0-9_-)", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-" },
  { label: "Alphanumeric", alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789" },
  { label: "Lowercase", alphabet: "abcdefghijklmnopqrstuvwxyz" },
  { label: "Numbers only", alphabet: "0123456789" },
  { label: "Hex lowercase", alphabet: "0123456789abcdef" },
  { label: "No lookalikes", alphabet: "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789" },
];

export default function NanoidGenerator() {
  const [size, setSize] = useState(21);
  const [count, setCount] = useState(1);
  const [alphabet, setAlphabet] = useState(PRESETS[0].alphabet);
  const [ids, setIds] = useState<string[]>([]);

  const generate = useCallback(() => {
    const chars = alphabet || PRESETS[0].alphabet;
    const result = Array.from({ length: count }, () =>
      Array.from({ length: size }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    );
    setIds(result);
  }, [size, count, alphabet]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Size</label>
          <input type="number" min={1} max={256} value={size} onChange={(e) => setSize(Math.max(1, Number(e.target.value)))} className="h-9 w-20 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Count</label>
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))} className="h-9 w-20 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        </div>
        <button onClick={generate} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Generate</button>
        {ids.length > 0 && <button onClick={() => navigator.clipboard.writeText(ids.join("\n"))} className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent">Copy All</button>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Alphabet</label>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => setAlphabet(p.alphabet)} className={`rounded-md border px-2 py-1 text-[11px] transition-colors ${alphabet === p.alphabet ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-foreground hover:border-primary/50"}`}>
              {p.label}
            </button>
          ))}
        </div>
        <input type="text" value={alphabet} onChange={(e) => setAlphabet(e.target.value)} className="h-9 rounded-md border border-border bg-input px-3 font-mono text-xs text-foreground" placeholder="Custom alphabet..." />
      </div>

      {ids.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          {ids.map((id, i) => (
            <div key={i} className="group flex items-center justify-between border-b border-border px-4 py-2 last:border-b-0">
              <code className="font-mono text-sm">{id}</code>
              <button onClick={() => navigator.clipboard.writeText(id)} className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}