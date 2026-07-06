"use client";

import { useState } from "react";
import { Search, Copy, Check, File, Image, Film, Music, Archive, FileText, Code, Database, Type } from "lucide-react";

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

const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
  Text: { icon: Type, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  Code: { icon: Code, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  Data: { icon: Database, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  Image: { icon: Image, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  Video: { icon: Film, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  Audio: { icon: Music, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  Archive: { icon: Archive, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  Document: { icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  Font: { icon: Type, color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
};

export default function MimeLookup() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = Object.entries(MIME_TYPES).filter(([ext, { mime, category: cat }]) => {
    const matchesSearch = `${ext} ${mime}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || cat === category;
    return matchesSearch && matchesCategory;
  });

  const copyMime = async (mime: string) => {
    await navigator.clipboard.writeText(mime);
    setCopied(mime);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search extension or MIME type..."
            className="h-10 w-full rounded-lg border border-border bg-input pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/60 transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-lg border border-border bg-input px-3 text-sm text-foreground transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:w-36"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Category Pills (mobile-friendly quick filter) */}
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat;
          const config = cat !== "All" ? categoryConfig[cat] : null;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
              }`}
            >
              {config && <config.icon className="h-3 w-3" />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center justify-center rounded-full bg-muted px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">
          {filtered.length}
        </span>
        {filtered.length === 1 ? "result" : "results"} found
      </div>

      {/* Results Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <File className="h-10 w-10 text-muted-foreground/40" />
          <div>
            <p className="text-sm font-medium text-muted-foreground">No MIME types found</p>
            <p className="text-xs text-muted-foreground/60">Try a different search or category</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {filtered.map(([ext, { mime, category: cat }]) => {
            const config = categoryConfig[cat];
            const Icon = config?.icon ?? File;
            const isCopied = copied === mime;
            return (
              <div
                key={ext}
                className={`group relative flex flex-col gap-2 rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 ${config?.border ?? "border-border"}`}
              >
                {/* Top row: icon + extension + category */}
                <div className="flex items-center gap-2.5">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config?.bg ?? "bg-muted"}`}>
                    <Icon className={`h-4 w-4 ${config?.color ?? "text-muted-foreground"}`} />
                  </div>
                  <code className="font-mono text-sm font-bold text-foreground">{ext}</code>
                  <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${config?.bg ?? "bg-muted"} ${config?.color ?? "text-muted-foreground"}`}>
                    {cat}
                  </span>
                </div>

                {/* MIME type */}
                <p className="font-mono text-xs text-muted-foreground break-all leading-relaxed">{mime}</p>

                {/* Copy button */}
                <button
                  onClick={() => copyMime(mime)}
                  className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                    isCopied
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "opacity-0 group-hover:opacity-100 bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                  title="Copy MIME type"
                >
                  {isCopied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}