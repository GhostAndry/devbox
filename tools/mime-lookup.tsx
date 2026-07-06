"use client";

import { useState } from "react";

const MIME_TYPES: Record<string, { mime: string; category: string }> = {
  ".html": { mime: "text/html", category: "Text" },
  ".css": { mime: "text/css", category: "Text" },
  ".js": { mime: "application/javascript", category: "Code" },
  ".mjs": { mime: "application/javascript", category: "Code" },
  ".ts": { mime: "application/typescript", category: "Code" },
  ".tsx": { mime: "application/typescript", category: "Code" },
  ".jsx": { mime: "application/javascript", category: "Code" },
  ".json": { mime: "application/json", category: "Data" },
  ".xml": { mime: "application/xml", category: "Data" },
  ".pdf": { mime: "application/pdf", category: "Document" },
  ".zip": { mime: "application/zip", category: "Archive" },
  ".tar": { mime: "application/x-tar", category: "Archive" },
  ".gz": { mime: "application/gzip", category: "Archive" },
  ".rar": { mime: "application/vnd.rar", category: "Archive" },
  ".7z": { mime: "application/x-7z-compressed", category: "Archive" },
  ".png": { mime: "image/png", category: "Image" },
  ".jpg": { mime: "image/jpeg", category: "Image" },
  ".jpeg": { mime: "image/jpeg", category: "Image" },
  ".gif": { mime: "image/gif", category: "Image" },
  ".svg": { mime: "image/svg+xml", category: "Image" },
  ".webp": { mime: "image/webp", category: "Image" },
  ".ico": { mime: "image/x-icon", category: "Image" },
  ".avif": { mime: "image/avif", category: "Image" },
  ".bmp": { mime: "image/bmp", category: "Image" },
  ".mp4": { mime: "video/mp4", category: "Video" },
  ".webm": { mime: "video/webm", category: "Video" },
  ".avi": { mime: "video/x-msvideo", category: "Video" },
  ".mov": { mime: "video/quicktime", category: "Video" },
  ".mp3": { mime: "audio/mpeg", category: "Audio" },
  ".wav": { mime: "audio/wav", category: "Audio" },
  ".ogg": { mime: "audio/ogg", category: "Audio" },
  ".flac": { mime: "audio/flac", category: "Audio" },
  ".aac": { mime: "audio/aac", category: "Audio" },
  ".txt": { mime: "text/plain", category: "Text" },
  ".csv": { mime: "text/csv", category: "Data" },
  ".md": { mime: "text/markdown", category: "Text" },
  ".yaml": { mime: "text/yaml", category: "Data" },
  ".yml": { mime: "text/yaml", category: "Data" },
  ".toml": { mime: "text/toml", category: "Data" },
  ".woff": { mime: "font/woff", category: "Font" },
  ".woff2": { mime: "font/woff2", category: "Font" },
  ".ttf": { mime: "font/ttf", category: "Font" },
  ".otf": { mime: "font/otf", category: "Font" },
  ".eot": { mime: "application/vnd.ms-fontobject", category: "Font" },
  ".wasm": { mime: "application/wasm", category: "Code" },
  ".doc": { mime: "application/msword", category: "Document" },
  ".docx": { mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", category: "Document" },
  ".xls": { mime: "application/vnd.ms-excel", category: "Document" },
  ".xlsx": { mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", category: "Document" },
  ".ppt": { mime: "application/vnd.ms-powerpoint", category: "Document" },
  ".pptx": { mime: "application/vnd.openxmlformats-officedocument.presentationml.presentation", category: "Document" },
};

const CATEGORIES = ["All", "Text", "Code", "Data", "Image", "Video", "Audio", "Archive", "Document", "Font"];

export default function MimeLookup() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = Object.entries(MIME_TYPES).filter(([ext, { mime, category: cat }]) => {
    const matchesSearch = `${ext} ${mime}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || cat === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search extension or MIME type..." className="h-9 flex-1 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        {filtered.map(([ext, { mime, category: cat }]) => (
          <div key={ext} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
            <div className="flex items-center gap-3">
              <code className="font-mono text-sm font-bold">{ext}</code>
              <span className="text-sm text-muted-foreground">{mime}</span>
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{cat}</span>
            </div>
            <button onClick={() => navigator.clipboard.writeText(mime)} className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
          </div>
        ))}
      </div>
    </div>
  );
}