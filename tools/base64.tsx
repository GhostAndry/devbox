"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState("");
  const [lineLength, setLineLength] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); setError(""); return; }
    try {
      let result: string;
      if (mode === "encode") {
        result = btoa(unescape(encodeURIComponent(input)));
        if (lineLength > 0) {
          result = result.match(new RegExp(`.{1,${lineLength}}`, "g"))?.join("\n") ?? result;
        }
      } else {
        result = decodeURIComponent(escape(atob(input.replace(/\s/g, ""))));
      }
      setOutput(result);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, mode, lineLength]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (mode === "encode") {
        setInput(reader.result as string);
      } else {
        const b64 = (reader.result as string).split(",")[1] || (reader.result as string);
        setInput(b64);
      }
      // Release the file reference — everything is now in memory
      e.target.value = "";
    };
    if (mode === "encode") reader.readAsText(file);
    else reader.readAsDataURL(file);
  }, [mode]);

  const swap = () => {
    setMode((m) => (m === "encode" ? "decode" : "encode"));
    setInput(output);
    setOutput("");
    setError("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Mode</label>
          <select
            value={mode}
            onChange={(e) => { setMode(e.target.value as "encode" | "decode"); setOutput(""); setError(""); }}
            className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground"
          >
            <option value="encode">Encode</option>
            <option value="decode">Decode</option>
          </select>
        </div>
        {mode === "encode" && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Line wrap</label>
            <select
              value={lineLength}
              onChange={(e) => setLineLength(Number(e.target.value))}
              className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground"
            >
              <option value={0}>None</option>
              <option value={64}>64 chars</option>
              <option value={76}>76 chars (MIME)</option>
            </select>
          </div>
        )}
        <button onClick={swap} className="h-9 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent" title="Swap input/output">
          ⇄ Swap
        </button>
        <label className="flex h-9 cursor-pointer items-center rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent">
          📁 File
          <input type="file" onChange={handleFile} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Input</label>
            <span className="text-[10px] text-muted-foreground">{input.length.toLocaleString()} chars</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="h-80 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground"
            placeholder={mode === "encode" ? "Text to encode..." : "Base64 to decode..."}
            spellCheck={false}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Output</label>
            {output && (
              <button
                onClick={() => navigator.clipboard.writeText(output)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Copy
              </button>
            )}
          </div>
          {error ? (
            <div className="h-80 overflow-auto rounded-lg border border-destructive/30 bg-destructive/10 p-3 font-mono text-sm text-destructive">
              {error}
            </div>
          ) : (
            <textarea
              readOnly
              value={output}
              className="h-80 rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground"
              placeholder="Result will appear here..."
            />
          )}
        </div>
      </div>
    </div>
  );
}