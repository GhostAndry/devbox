"use client";

import { useState } from "react";
import { Search, Copy, Check, File, Image, Film, Music, Archive, FileText, Code, Database, Type, X } from "lucide-react";

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

const categoryConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string; dot: string }> = {
  Text: { icon: Type, color: "text-blue-400", bg: "bg-blue-500/10", dot: "bg-blue-400" },
  Code: { icon: Code, color: "text-purple-400", bg: "bg-purple-500/10", dot: "bg-purple-400" },
  Data: { icon: Database, color: "text-cyan-400", bg: "bg-cyan-500/10", dot: "bg-cyan-400" },
  Image: { icon: Image, color: "text-pink-400", bg: "bg-pink-500/10", dot: "bg-pink-400" },
  Video: { icon: Film, color: "text-rose-400", bg: "bg-rose-500/10", dot: "bg-rose-400" },
  Audio: { icon: Music, color: "text-amber-400", bg: "bg-amber-500/10", dot: "bg-amber-400" },
  Archive: { icon: Archive, color: "text-orange-400", bg: "bg-orange-500/10", dot: "bg-orange-400" },
  Document: { icon: FileText, color: "text-emerald-400", bg: "bg-emerald-500/10", dot: "bg-emerald-400" },
  Font: { icon: Type, color: "text-indigo-400", bg: "bg-indigo-500/10", dot: "bg-indigo-400" },
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
    <div className="flex flex-col gap-4">
      {/* Search bar — full width, big touch target */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search extension or MIME type..."
          className="h-11 w-full rounded-xl border border-border bg-input pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 transition-colors focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Category pills — horizontally scrollable on mobile */}
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const isActive = category === cat;
          const config = cat !== "All" ? categoryConfig[cat] : null;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-95 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "border border-border bg-card text-muted-foreground active:bg-muted"
              }`}
            >
              {config && <config.icon className="h-3 w-3" />}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <p className="text-xs text-muted-foreground">
        <span className="font-mono font-semibold text-foreground">{filtered.length}</span>{" "}
        {filtered.length === 1 ? "result" : "results"}
      </p>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-20 text-center">
          <File className="h-8 w-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No MIME types found</p>
        </div>
      ) : (
        /* Compact list — always single column, clean rows */
        <div className="flex flex-col">
          {filtered.map(([ext, { mime, category: cat }]) => {
            const config = categoryConfig[cat];
            const Icon = config?.icon ?? File;
            const isCopied = copied === mime;
            return (
              <button
                key={ext}
                onClick={() => copyMime(mime)}
                className="group flex items-center gap-3 border-b border-border/50 px-1 py-3 text-left transition-colors active:bg-muted/50 last:border-b-0"
              >
                {/* Colored dot + icon */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config?.bg ?? "bg-muted"}`}>
                  <Icon className={`h-4 w-4 ${config?.color ?? "text-muted-foreground"}`} />
                </div>

                {/* Extension + MIME */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <code className="font-mono text-sm font-semibold text-foreground">{ext}</code>
                    <span className={`shrink-0 rounded-full px-1.5 py-px text-[10px] font-medium ${config?.bg ?? "bg-muted"} ${config?.color ?? "text-muted-foreground"}`}>
                      {cat}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-muted-foreground truncate">{mime}</p>
                </div>

                {/* Copy feedback */}
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                  isCopied
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-muted-foreground/40 group-active:text-primary"
                }`}>
                  {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}