"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Copy, X, ChevronDown, ChevronUp, FileCode, Search, Star, Download, Shield, Check, Loader2 } from "lucide-react";

/* ── Types ───────────────────────────────────────────────────────────────── */

interface DockerfileLine {
  instruction: string;
  value: string;
}

interface DockerHubImage {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  pulls: number;
  isOfficial: boolean;
}

const INSTRUCTIONS: { name: string; description: string; placeholder: string }[] = [
  { name: "FROM", description: "Base image", placeholder: "node:20-alpine" },
  { name: "LABEL", description: "Add metadata", placeholder: "maintainer=\"you@example.com\"" },
  { name: "RUN", description: "Execute commands during build", placeholder: "apt-get update && apt-get install -y curl" },
  { name: "COPY", description: "Copy files from host", placeholder: ". /app" },
  { name: "ADD", description: "Copy files or URLs", placeholder: "https://example.com/file.tar.gz /app/" },
  { name: "WORKDIR", description: "Set working directory", placeholder: "/app" },
  { name: "ENV", description: "Set environment variable", placeholder: "NODE_ENV=production" },
  { name: "ARG", description: "Build-time variable", placeholder: "VERSION=latest" },
  { name: "EXPOSE", description: "Expose a port", placeholder: "3000" },
  { name: "VOLUME", description: "Create mount point", placeholder: "/data" },
  { name: "USER", description: "Set user", placeholder: "node" },
  { name: "CMD", description: "Default command", placeholder: '["node", "server.js"]' },
  { name: "ENTRYPOINT", description: "Entrypoint executable", placeholder: '["docker-entrypoint.sh"]' },
  { name: "HEALTHCHECK", description: "Container health check", placeholder: "CMD curl -f http://localhost/ || exit 1" },
  { name: "SHELL", description: "Override default shell", placeholder: '["/bin/bash", "-c"]' },
];

const TEMPLATES: { name: string; lines: DockerfileLine[] }[] = [
  {
    name: "Node.js",
    lines: [
      { instruction: "FROM", value: "node:20-alpine" },
      { instruction: "WORKDIR", value: "/app" },
      { instruction: "COPY", value: "package*.json ./" },
      { instruction: "RUN", value: "npm ci --only=production" },
      { instruction: "COPY", value: ". ." },
      { instruction: "EXPOSE", value: "3000" },
      { instruction: "USER", value: "node" },
      { instruction: "CMD", value: '["node", "server.js"]' },
    ],
  },
  {
    name: "Python",
    lines: [
      { instruction: "FROM", value: "python:3.12-slim" },
      { instruction: "WORKDIR", value: "/app" },
      { instruction: "COPY", value: "requirements.txt ." },
      { instruction: "RUN", value: "pip install --no-cache-dir -r requirements.txt" },
      { instruction: "COPY", value: ". ." },
      { instruction: "EXPOSE", value: "8000" },
      { instruction: "CMD", value: '["python", "app.py"]' },
    ],
  },
  {
    name: "Go",
    lines: [
      { instruction: "FROM", value: "golang:1.22-alpine AS builder" },
      { instruction: "WORKDIR", value: "/app" },
      { instruction: "COPY", value: "go.mod go.sum ./" },
      { instruction: "RUN", value: "go mod download" },
      { instruction: "COPY", value: ". ." },
      { instruction: "RUN", value: "CGO_ENABLED=0 go build -o /app/server ." },
      { instruction: "FROM", value: "alpine:3.20" },
      { instruction: "COPY", value: "--from=builder /app/server /server" },
      { instruction: "EXPOSE", value: "8080" },
      { instruction: "CMD", value: '["/server"]' },
    ],
  },
  {
    name: "Rust",
    lines: [
      { instruction: "FROM", value: "rust:1.78-alpine AS builder" },
      { instruction: "WORKDIR", value: "/app" },
      { instruction: "COPY", value: "Cargo.toml Cargo.lock ./" },
      { instruction: "RUN", value: "mkdir src && echo 'fn main() {}' > src/main.rs && cargo build --release && rm -rf src" },
      { instruction: "COPY", value: ". ." },
      { instruction: "RUN", value: "cargo build --release" },
      { instruction: "FROM", value: "alpine:3.20" },
      { instruction: "COPY", value: "--from=builder /app/target/release/app /app" },
      { instruction: "CMD", value: '["/app"]' },
    ],
  },
  {
    name: "Nginx static",
    lines: [
      { instruction: "FROM", value: "nginx:alpine" },
      { instruction: "COPY", value: "./dist /usr/share/nginx/html" },
      { instruction: "COPY", value: "./nginx.conf /etc/nginx/nginx.conf" },
      { instruction: "EXPOSE", value: "80" },
      { instruction: "CMD", value: '["nginx", "-g", "daemon off;"]' },
    ],
  },
];

/* ── Component ───────────────────────────────────────────────────────────── */

export default function DockerfileCreator() {
  const [lines, setLines] = useState<DockerfileLine[]>([
    { instruction: "FROM", value: "alpine:latest" },
  ]);

  /* ── Docker Hub search ────────────────────────────────────────────────── */
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [imageSearch, setImageSearch] = useState("");
  const [imageResults, setImageResults] = useState<DockerHubImage[]>([]);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [targetLineIndex, setTargetLineIndex] = useState<number | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const searchDockerHub = useCallback(async (query: string) => {
    if (query.length < 2) { setImageResults([]); return; }
    setImageLoading(true);
    setImageError("");
    try {
      const res = await fetch(`/api/docker-search?query=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const images: DockerHubImage[] = (data.results || []).map(
        (r: { repo_name: string; short_description: string; star_count: number; pull_count: number; is_official: boolean }) => ({
          name: r.repo_name,
          fullName: r.repo_name.startsWith("library/") ? r.repo_name.slice(8) : r.repo_name,
          description: r.short_description || "",
          stars: r.star_count || 0,
          pulls: r.pull_count || 0,
          isOfficial: r.is_official || false,
        })
      );
      setImageResults(images);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setImageLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchDockerHub(imageSearch), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [imageSearch, searchDockerHub]);

  const openImageSearch = (lineIndex: number) => {
    setTargetLineIndex(lineIndex);
    setImageSearch("");
    setImageResults([]);
    setShowImageSearch(true);
  };

  const pickImage = (image: DockerHubImage) => {
    if (targetLineIndex !== null) {
      updateLine(targetLineIndex, "value", `${image.fullName}:latest`);
    }
    setShowImageSearch(false);
    setTargetLineIndex(null);
  };

  const formatDownloads = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toString();

  /* ── Line management ───────────────────────────────────────────────────── */

  const addLine = (instruction: string) => {
    setLines((prev) => [...prev, { instruction, value: "" }]);
  };

  const removeLine = (index: number) => {
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLine = (index: number, field: "instruction" | "value", val: string) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: val } : l)));
  };

  const moveLine = (index: number, direction: -1 | 1) => {
    setLines((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const applyTemplate = (template: typeof TEMPLATES[number]) => {
    setLines([...template.lines]);
  };

  const dockerfile = lines
    .map((l) => `${l.instruction}${l.value ? ` ${l.value}` : ""}`)
    .join("\n");

  return (
    <div className="flex flex-col gap-6">
      {/* ── Image Search Modal ────────────────────────── */}
      {showImageSearch && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[10vh]" onClick={() => setShowImageSearch(false)}>
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl border border-border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={imageSearch}
                onChange={(e) => setImageSearch(e.target.value)}
                placeholder="Search Docker Hub for a base image…"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <button onClick={() => setShowImageSearch(false)} className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {imageLoading && (
                <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching Docker Hub…
                </div>
              )}
              {!imageLoading && imageSearch.length >= 2 && imageResults.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No images found.</p>
              )}
              {!imageLoading && imageSearch.length < 2 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Type at least 2 characters to search.</p>
              )}
              <div className="flex flex-col gap-1">
                {imageResults.map((img) => (
                  <button
                    key={img.name}
                    onClick={() => pickImage(img)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent border border-transparent"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      {img.isOfficial && (
                        <span className="flex shrink-0 items-center gap-0.5 rounded bg-blue-500/20 px-1 py-0.5 text-[10px] font-semibold text-blue-400">
                          <Shield className="h-2.5 w-2.5" /> OFFICIAL
                        </span>
                      )}
                      <span className="truncate font-mono text-sm font-medium text-foreground">{img.fullName}</span>
                      <span className="hidden truncate text-xs text-muted-foreground sm:inline">{img.description}</span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-0.5"><Star className="h-3 w-3" /> {img.stars.toLocaleString()}</span>
                      <span className="flex items-center gap-0.5"><Download className="h-3 w-3" /> {formatDownloads(img.pulls)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Templates */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Templates</span>
        <div className="flex flex-wrap gap-1.5">
          {TEMPLATES.map((t) => (
            <button
              key={t.name}
              onClick={() => applyTemplate(t)}
              className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Add Instruction</span>
        <div className="flex flex-wrap gap-1">
          {INSTRUCTIONS.map((inst) => (
            <button
              key={inst.name}
              onClick={() => addLine(inst.name)}
              title={inst.description}
              className="rounded-md border border-border bg-card px-2 py-1 text-[11px] font-mono transition-colors hover:border-primary/50 hover:bg-primary/5"
            >
              {inst.name}
            </button>
          ))}
        </div>
      </div>

      {/* Dockerfile lines */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Dockerfile</span>
        <div className="flex flex-col gap-1">
          {lines.map((line, i) => {
            const inst = INSTRUCTIONS.find((x) => x.name === line.instruction);
            const isFrom = line.instruction === "FROM";
            return (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 group">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveLine(i, -1)} className="text-muted-foreground hover:text-foreground" title="Move up">
                    <ChevronUp className="h-3 w-3" />
                  </button>
                  <button onClick={() => moveLine(i, 1)} className="text-muted-foreground hover:text-foreground" title="Move down">
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
                <select
                  value={line.instruction}
                  onChange={(e) => updateLine(i, "instruction", e.target.value)}
                  className="h-8 w-28 shrink-0 rounded border border-border bg-input px-2 font-mono text-xs text-foreground"
                >
                  {INSTRUCTIONS.map((x) => (
                    <option key={x.name} value={x.name}>{x.name}</option>
                  ))}
                </select>
                <div className="flex flex-1 items-center gap-1">
                  <input
                    type="text"
                    value={line.value}
                    onChange={(e) => updateLine(i, "value", e.target.value)}
                    placeholder={inst?.placeholder ?? ""}
                    className="h-8 flex-1 rounded border border-border bg-input px-2 font-mono text-xs text-foreground"
                  />
                  {isFrom && (
                    <button
                      onClick={() => openImageSearch(i)}
                      title="Search Docker Hub"
                      className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Search className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => removeLine(i)}
                  className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Output */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Output</span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                const blob = new Blob([dockerfile], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "Dockerfile";
                a.click();
                setTimeout(() => URL.revokeObjectURL(url), 100);
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <FileCode className="h-3 w-3" /> Download
            </button>
            <button
              onClick={() => navigator.clipboard.writeText(dockerfile)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
        </div>
        <pre className="h-80 overflow-auto rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground">
          {dockerfile || "# Your Dockerfile will appear here..."}
        </pre>
      </div>
    </div>
  );
}
