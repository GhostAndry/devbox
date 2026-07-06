"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export default function UrlEncoder() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [encodeMode, setEncodeMode] = useState<"component" | "uri">("component");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); return; }
    try {
      if (mode === "encode") {
        setOutput(encodeMode === "component" ? encodeURIComponent(input) : encodeURI(input));
      } else {
        setOutput(encodeMode === "component" ? decodeURIComponent(input) : decodeURI(input));
      }
    } catch (e) {
      setOutput(`Error: ${(e as Error).message}`);
    }
  }, [input, mode, encodeMode]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const swap = () => {
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setInput(output);
    setOutput("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Mode</label>
          <select value={mode} onChange={(e) => { setMode(e.target.value as "encode" | "decode"); setOutput(""); }} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value="encode">Encode</option>
            <option value="decode">Decode</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <select value={encodeMode} onChange={(e) => setEncodeMode(e.target.value as "component" | "uri")} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value="component">encodeURIComponent (full)</option>
            <option value="uri">encodeURI (preserve URL)</option>
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
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-80 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground" placeholder={mode === "encode" ? "Text to encode..." : "URL-encoded text..."} spellCheck={false} />
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