"use client";

import { useState, useMemo } from "react";

export default function QrCode() {
  const [text, setText] = useState("https://example.com");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("000000");
  const [bgColor, setBgColor] = useState("ffffff");

  const qrUrl = useMemo(() => {
    if (!text.trim()) return "";
    const encoded = encodeURIComponent(text);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&color=${fgColor}&bgcolor=${bgColor}`;
  }, [text, size, fgColor, bgColor]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Text or URL</label>
          <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Size (px)</label>
          <input type="number" min={64} max={1024} step={32} value={size} onChange={(e) => setSize(Math.max(64, Number(e.target.value)))} className="h-9 w-24 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Foreground</label>
          <div className="flex items-center gap-2">
            <input type="color" value={`#${fgColor}`} onChange={(e) => setFgColor(e.target.value.slice(1))} className="h-9 w-10 cursor-pointer rounded border border-border" />
            <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6))} className="h-9 w-20 rounded-md border border-border bg-input px-2 font-mono text-xs text-foreground" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Background</label>
          <div className="flex items-center gap-2">
            <input type="color" value={`#${bgColor}`} onChange={(e) => setBgColor(e.target.value.slice(1))} className="h-9 w-10 cursor-pointer rounded border border-border" />
            <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6))} className="h-9 w-20 rounded-md border border-border bg-input px-2 font-mono text-xs text-foreground" />
          </div>
        </div>
      </div>

      {qrUrl && (
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-lg border border-border p-4" style={{ backgroundColor: `#${bgColor}` }}>
            <img src={qrUrl} alt="QR Code" className="rounded" width={size} height={size} />
          </div>
          <div className="flex gap-3">
            <a href={qrUrl} download="qrcode.png" className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent">Download PNG</a>
            <button onClick={async () => {
              const res = await fetch(qrUrl);
              const blob = await res.blob();
              await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
            }} className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-accent">Copy Image</button>
          </div>
        </div>
      )}
    </div>
  );
}