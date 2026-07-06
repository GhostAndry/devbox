"use client";

import { useState, useCallback, useEffect, useRef } from "react";

const ENTITIES: Record<string, string> = {
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;",
  "`": "&#96;", "¢": "&cent;", "£": "&pound;", "¥": "&yen;", "€": "&euro;",
  "©": "&copy;", "®": "&reg;", "™": "&trade;", "←": "&larr;", "→": "&rarr;",
};

export default function HtmlEscape() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"escape" | "unescape">("escape");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); return; }
    if (mode === "escape") {
      let result = input;
      for (const [char, entity] of Object.entries(ENTITIES)) {
        result = result.replaceAll(char, entity);
      }
      setOutput(result);
    } else {
      let result = input;
      for (const [char, entity] of Object.entries(ENTITIES)) {
        result = result.replaceAll(entity, char);
      }
      setOutput(result);
    }
  }, [input, mode]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const swap = () => {
    setMode((m) => (m === "escape" ? "unescape" : "escape"));
    setInput(output);
    setOutput("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Mode</label>
          <select value={mode} onChange={(e) => { setMode(e.target.value as "escape" | "unescape"); setOutput(""); }} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value="escape">Escape</option>
            <option value="unescape">Unescape</option>
          </select>
        </div>
        <button onClick={swap} className="h-9 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent">⇄ Swap</button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Input</label>
            <span className="text-[10px] text-muted-foreground">{input.length.toLocaleString()} chars</span>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-80 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground" placeholder={mode === "escape" ? "HTML to escape..." : "Escaped HTML to unescape..."} spellCheck={false} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Output</label>
            {output && <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-muted-foreground hover:text-foreground">Copy</button>}
          </div>
          <textarea readOnly value={output} className="h-80 rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground" placeholder="Result..." />
        </div>
      </div>
    </div>
  );
}