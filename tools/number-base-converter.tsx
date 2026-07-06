"use client";

import { useState, useMemo } from "react";

const BASES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 32, 36];

export default function NumberBaseConverter() {
  const [input, setInput] = useState("255");
  const [fromBase, setFromBase] = useState(10);

  const { results, error } = useMemo(() => {
    try {
      const num = parseInt(input, fromBase);
      if (isNaN(num)) throw new Error("Invalid number for the given base");
      const r: Record<string, string> = {};
      for (const base of BASES) {
        r[`Base ${base}`] = base === 10 ? num.toString() : num.toString(base).toUpperCase();
      }
      r["Binary (bits)"] = num.toString(2).padStart(Math.ceil(num.toString(2).length / 8) * 8, "0");
      return { results: r, error: "" };
    } catch (e) {
      return { results: null, error: (e as Error).message };
    }
  }, [input, fromBase]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Number</label>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="h-9 w-48 rounded-md border border-border bg-input px-3 font-mono text-sm text-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">From base</label>
          <select value={fromBase} onChange={(e) => setFromBase(Number(e.target.value))} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            {BASES.map((b) => <option key={b} value={b}>Base {b}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {results && (
        <div className="flex flex-col gap-2">
          {Object.entries(results).map(([label, value]) => (
            <div key={label} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
                <p className="font-mono text-sm truncate">{value}</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(value)} className="ml-2 shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}