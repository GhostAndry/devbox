"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [stats, setStats] = useState<{ keys: number; depth: number; size: string } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const format = useCallback(() => {
    if (!input.trim()) { setOutput(""); setError(""); setStats(null); return; }
    try {
      let parsed = JSON.parse(input);
      if (sortKeys) parsed = sortObjectKeys(parsed);
      const formatted = JSON.stringify(parsed, null, indent);
      setOutput(formatted);
      setError("");
      const size = new Blob([formatted]).size;
      setStats({
        keys: countKeys(parsed),
        depth: getDepth(parsed),
        size: size < 1024 ? `${size} B` : size < 1048576 ? `${(size / 1024).toFixed(1)} KB` : `${(size / 1048576).toFixed(1)} MB`,
      });
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
      setStats(null);
    }
  }, [input, indent, sortKeys]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(format, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [format]);

  const minify = useCallback(() => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }, [input]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <button onClick={format} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Format</button>
        <button onClick={minify} className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent">Minify</button>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Indent</label>
          <select value={indent} onChange={(e) => setIndent(Number(e.target.value))} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={8}>8 spaces</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer pb-1">
          <input type="checkbox" checked={sortKeys} onChange={(e) => setSortKeys(e.target.checked)} className="h-4 w-4 rounded border-border" />
          Sort keys
        </label>
      </div>

      {stats && (
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span>{stats.keys} keys</span>
          <span>Depth: {stats.depth}</span>
          <span>{stats.size}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Input</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-80 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground" placeholder="Paste your JSON here..." spellCheck={false} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Output</label>
            {output && <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-muted-foreground hover:text-foreground">Copy</button>}
          </div>
          {error ? (
            <div className="h-80 overflow-auto rounded-lg border border-destructive/30 bg-destructive/10 p-3 font-mono text-sm text-destructive">{error}</div>
          ) : (
            <pre className="h-80 overflow-auto rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground">{output || "Formatted JSON will appear here..."}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortObjectKeys);
  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj as Record<string, unknown>).sort().reduce((acc, key) => {
      acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
      return acc;
    }, {} as Record<string, unknown>);
  }
  return obj;
}

function countKeys(obj: unknown): number {
  if (Array.isArray(obj)) return obj.reduce((sum, item) => sum + countKeys(item), 0);
  if (obj !== null && typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    return entries.length + entries.reduce((sum, [, v]) => sum + countKeys(v), 0);
  }
  return 0;
}

function getDepth(obj: unknown): number {
  if (Array.isArray(obj)) return obj.length === 0 ? 1 : 1 + Math.max(...obj.map(getDepth));
  if (obj !== null && typeof obj === "object") {
    const vals = Object.values(obj as Record<string, unknown>);
    return vals.length === 0 ? 1 : 1 + Math.max(...vals.map(getDepth));
  }
  return 0;
}