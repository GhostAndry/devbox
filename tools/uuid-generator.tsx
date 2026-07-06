"use client";

import { useState, useCallback, useEffect, useRef } from "react";

function formatUuid(uuid: string, format: string): string {
  switch (format) {
    case "no-dashes": return uuid.replace(/-/g, "");
    case "uppercase": return uuid.toUpperCase();
    case "urn": return `urn:uuid:${uuid}`;
    default: return uuid;
  }
}

export default function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [version, setVersion] = useState<4 | 7>(4);
  const [count, setCount] = useState(1);
  const [format, setFormat] = useState<"standard" | "no-dashes" | "uppercase" | "urn">("standard");
  const initialized = useRef(false);

  const generateV4 = useCallback(() => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }, []);

  const generateV7 = useCallback(() => {
    const timestamp = Date.now();
    const hex = timestamp.toString(16).padStart(12, "0");
    const rand = () => Math.floor(Math.random() * 16).toString(16);
    return (
      hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-7" + rand() + rand() + rand() +
      "-" + ((Math.random() * 4) | 8).toString(16) + rand() + rand() + rand() +
      "-" + Array.from({ length: 12 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
    );
  }, []);

  const generate = useCallback(() => {
    const fn = version === 4 ? generateV4 : generateV7;
    setUuids(Array.from({ length: count }, () => formatUuid(fn(), format)));
  }, [version, count, generateV4, generateV7, format]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      generate();
    }
  }, [generate]);

  const copyAll = () => navigator.clipboard.writeText(uuids.join("\n"));
  const copyAsJson = () => navigator.clipboard.writeText(JSON.stringify(uuids, null, 2));
  const copyAsCsv = () => navigator.clipboard.writeText(uuids.join(","));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Version</label>
          <select value={version} onChange={(e) => setVersion(Number(e.target.value) as 4 | 7)} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value={4}>UUID v4 (random)</option>
            <option value={7}>UUID v7 (time-ordered)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as typeof format)} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value="standard">Standard (dashes)</option>
            <option value="no-dashes">No dashes</option>
            <option value="uppercase">Uppercase</option>
            <option value="urn">URN</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Count</label>
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))} className="h-9 w-20 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        </div>
        <button onClick={generate} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Regenerate</button>
      </div>

      {uuids.length > 0 && (
        <>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyAll} className="rounded-md border border-border bg-card px-3 py-1 text-xs hover:bg-accent">Copy All</button>
            <button onClick={copyAsJson} className="rounded-md border border-border bg-card px-3 py-1 text-xs hover:bg-accent">Copy as JSON</button>
            <button onClick={copyAsCsv} className="rounded-md border border-border bg-card px-3 py-1 text-xs hover:bg-accent">Copy as CSV</button>
          </div>
          <div className="rounded-lg border border-border bg-card">
            {uuids.map((uuid, i) => (
              <div key={i} className="group flex items-center justify-between border-b border-border px-4 py-2 last:border-b-0">
                <code className="font-mono text-sm">{uuid}</code>
                <button onClick={() => navigator.clipboard.writeText(uuid)} className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}