"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  Search,
  Star,
  Download,
  Shield,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Loader2,
  Copy,
  Plus,
  Layers,
  Container,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────────────────── */

interface DockerHubImage {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  pulls: number;
  isOfficial: boolean;
}

interface EnvVar {
  key: string;
  defaultValue: string;
  description: string;
}

interface SelectedService {
  image: string;
  envVars: EnvVar[];
  envOverrides: Record<string, string>;
}

type SortMode = "relevance" | "stars" | "downloads" | "official";

/* ── Known env vars ──────────────────────────────────────────────────────── */

const KNOWN_ENV: Record<string, EnvVar[]> = {
  nginx: [
    { key: "NGINX_HOST", defaultValue: "localhost", description: "Hostname" },
    { key: "NGINX_PORT", defaultValue: "80", description: "Port" },
  ],
  postgres: [
    { key: "POSTGRES_PASSWORD", defaultValue: "secret", description: "Superuser password" },
    { key: "POSTGRES_USER", defaultValue: "postgres", description: "Superuser username" },
    { key: "POSTGRES_DB", defaultValue: "mydb", description: "Default database" },
    { key: "POSTGRES_INITDB_ARGS", defaultValue: "", description: "initdb arguments" },
    { key: "POSTGRES_HOST_AUTH_METHOD", defaultValue: "scram-sha-256", description: "Auth method" },
  ],
  redis: [
    { key: "REDIS_PASSWORD", defaultValue: "", description: "Auth password" },
    { key: "REDIS_MAXMEMORY", defaultValue: "256mb", description: "Max memory" },
    { key: "REDIS_MAXMEMORY_POLICY", defaultValue: "allkeys-lru", description: "Eviction policy" },
  ],
  mysql: [
    { key: "MYSQL_ROOT_PASSWORD", defaultValue: "secret", description: "Root password" },
    { key: "MYSQL_DATABASE", defaultValue: "mydb", description: "Default database" },
    { key: "MYSQL_USER", defaultValue: "user", description: "User" },
    { key: "MYSQL_PASSWORD", defaultValue: "secret", description: "User password" },
  ],
  mongo: [
    { key: "MONGO_INITDB_ROOT_USERNAME", defaultValue: "root", description: "Root username" },
    { key: "MONGO_INITDB_ROOT_PASSWORD", defaultValue: "secret", description: "Root password" },
    { key: "MONGO_INITDB_DATABASE", defaultValue: "mydb", description: "Default database" },
  ],
  mariadb: [
    { key: "MARIADB_ROOT_PASSWORD", defaultValue: "secret", description: "Root password" },
    { key: "MARIADB_DATABASE", defaultValue: "mydb", description: "Default database" },
    { key: "MARIADB_USER", defaultValue: "user", description: "User" },
    { key: "MARIADB_PASSWORD", defaultValue: "secret", description: "User password" },
  ],
  rabbitmq: [
    { key: "RABBITMQ_DEFAULT_USER", defaultValue: "guest", description: "Default user" },
    { key: "RABBITMQ_DEFAULT_PASS", defaultValue: "guest", description: "Default password" },
    { key: "RABBITMQ_DEFAULT_VHOST", defaultValue: "/", description: "Virtual host" },
  ],
  elasticsearch: [
    { key: "discovery.type", defaultValue: "single-node", description: "Discovery type" },
    { key: "ES_JAVA_OPTS", defaultValue: "-Xms512m -Xmx512m", description: "JVM options" },
    { key: "xpack.security.enabled", defaultValue: "false", description: "Security enabled" },
  ],
  minio: [
    { key: "MINIO_ROOT_USER", defaultValue: "minioadmin", description: "Root user" },
    { key: "MINIO_ROOT_PASSWORD", defaultValue: "minioadmin", description: "Root password" },
  ],
  adminer: [
    { key: "ADMINER_DEFAULT_SERVER", defaultValue: "postgres", description: "Default DB server" },
    { key: "ADMINER_DESIGN", defaultValue: "pepa-linha", description: "UI theme" },
  ],
  node: [
    { key: "NODE_ENV", defaultValue: "development", description: "Environment" },
    { key: "PORT", defaultValue: "3000", description: "App port" },
  ],
  python: [
    { key: "PYTHONUNBUFFERED", defaultValue: "1", description: "Unbuffered stdout" },
    { key: "PYTHONDONTWRITEBYTECODE", defaultValue: "1", description: "No .pyc files" },
  ],
  traefik: [
    { key: "TRAEFIK_API_INSECURE", defaultValue: "true", description: "Enable insecure API" },
    { key: "TRAEFIK_PROVIDERS_DOCKER", defaultValue: "true", description: "Enable Docker provider" },
  ],
  vault: [
    { key: "VAULT_DEV_ROOT_TOKEN_ID", defaultValue: "root", description: "Dev root token" },
    { key: "VAULT_DEV_LISTEN_ADDRESS", defaultValue: "0.0.0.0:8200", description: "Listen address" },
  ],
  consul: [
    { key: "CONSUL_BIND_INTERFACE", defaultValue: "eth0", description: "Bind interface" },
    { key: "CONSUL_CLIENT_INTERFACE", defaultValue: "eth0", description: "Client interface" },
  ],
  grafana: [
    { key: "GF_SECURITY_ADMIN_USER", defaultValue: "admin", description: "Admin user" },
    { key: "GF_SECURITY_ADMIN_PASSWORD", defaultValue: "admin", description: "Admin password" },
  ],
  prometheus: [
    { key: "PROMETHEUS_CONFIG", defaultValue: "/etc/prometheus/prometheus.yml", description: "Config path" },
  ],
  influxdb: [
    { key: "INFLUXDB_ADMIN_USER", defaultValue: "admin", description: "Admin user" },
    { key: "INFLUXDB_ADMIN_PASSWORD", defaultValue: "secret", description: "Admin password" },
    { key: "INFLUXDB_DB", defaultValue: "mydb", description: "Database name" },
  ],
  keycloak: [
    { key: "KEYCLOAK_ADMIN", defaultValue: "admin", description: "Admin user" },
    { key: "KEYCLOAK_ADMIN_PASSWORD", defaultValue: "admin", description: "Admin password" },
  ],
  docker: [
    { key: "DOCKER_HOST", defaultValue: "unix:///var/run/docker.sock", description: "Docker socket" },
  ],
};

/* ── Component ───────────────────────────────────────────────────────────── */

export default function DockerCompose() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<DockerHubImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Map<string, SelectedService>>(new Map());
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("relevance");
  const [officialOnly, setOfficialOnly] = useState(false);
  const [minStars, setMinStars] = useState(0);
  const [minDownloads, setMinDownloads] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  /* ── Search ────────────────────────────────────────────────────────────── */

  const searchDockerHub = useCallback(async (query: string) => {
    if (query.length < 2) { setResults([]); return; }
    setLoading(true);
    setError("");
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
      setResults(images);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchDockerHub(search), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search, searchDockerHub]);

  /* ── Filter & sort ─────────────────────────────────────────────────────── */

  const filteredResults = results
    .filter((img) => {
      if (officialOnly && !img.isOfficial) return false;
      if (img.stars < minStars) return false;
      if (img.pulls < minDownloads) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortMode) {
        case "stars": return b.stars - a.stars;
        case "downloads": return b.pulls - a.pulls;
        case "official": return (b.isOfficial ? 1 : 0) - (a.isOfficial ? 1 : 0);
        default: return 0;
      }
    });

  /* ── Env vars ──────────────────────────────────────────────────────────── */

  const fetchEnvVars = useCallback(async (image: DockerHubImage): Promise<EnvVar[]> => {
    const shortName = image.fullName.split("/").pop()?.replace(/[^a-z0-9]/gi, "").toLowerCase() ?? "";
    for (const [key, vars] of Object.entries(KNOWN_ENV)) {
      if (shortName.includes(key) || image.fullName.toLowerCase().includes(key)) return vars;
    }
    return [];
  }, []);

  /* ── Toggle ────────────────────────────────────────────────────────────── */

  const toggleService = useCallback(async (image: DockerHubImage) => {
    const key = image.name;
    if (selected.has(key)) {
      setSelected((prev) => { const next = new Map(prev); next.delete(key); return next; });
    } else {
      setSelected((prev) => { const next = new Map(prev); next.set(key, { image: `${image.fullName}:latest`, envVars: [], envOverrides: {} }); return next; });
      const envVars = await fetchEnvVars(image);
      setSelected((prev) => {
        const next = new Map(prev);
        const existing = next.get(key);
        if (existing) {
          const overrides: Record<string, string> = {};
          envVars.forEach((v) => { overrides[v.key] = v.defaultValue; });
          next.set(key, { ...existing, envVars, envOverrides: overrides });
        }
        return next;
      });
    }
  }, [selected, fetchEnvVars]);

  const toggleExpand = (name: string) => setExpanded((prev) => ({ ...prev, [name]: !prev[name] }));

  const updateEnv = (svcKey: string, key: string, value: string) => {
    setSelected((prev) => {
      const next = new Map(prev);
      const svc = next.get(svcKey);
      if (svc) next.set(svcKey, { ...svc, envOverrides: { ...svc.envOverrides, [key]: value } });
      return next;
    });
  };

  /* ── Generate compose ──────────────────────────────────────────────────── */

  const compose = (() => {
    const blocks: string[] = [];
    selected.forEach((svc, key) => {
      const name = key.split("/").pop()?.replace(/[^a-zA-Z0-9_-]/g, "-") ?? key;
      const lines = [`  ${name}:`, `    image: ${svc.image}`];
      if (svc.envVars.length > 0) {
        lines.push("    environment:");
        svc.envVars.forEach((v) => {
          lines.push(`      ${v.key}: "${svc.envOverrides[v.key] ?? v.defaultValue}"`);
        });
      }
      blocks.push(lines.join("\n"));
    });
    return `services:\n${blocks.join("\n\n")}`;
  })();

  const formatDownloads = (n: number) => n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : n.toString();

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <div className="flex flex-col gap-4">
      {/* Selected services summary */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{selected.size} service{selected.size !== 1 ? "s" : ""} selected</span>
          <div className="ml-auto flex flex-wrap gap-1.5">
            {Array.from(selected.keys()).map((key) => {
              const name = key.split("/").pop() ?? key;
              return (
                <span key={key} className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  {name}
                  <button onClick={() => toggleService({ name: key, fullName: name, description: "", stars: 0, pulls: 0, isOfficial: false })} className="hover:text-red-400">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Add service button */}
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Add a service from Docker Hub
      </button>

      {/* ── Modal ──────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-[10vh]" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl border border-border bg-background shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Modal header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search Docker Hub (nginx, postgres, redis…)"
                className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                autoFocus
              />
              <button onClick={() => setShowModal(false)} className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mr-1">Sort</span>
              {([
                { mode: "relevance" as const, label: "Relevance" },
                { mode: "stars" as const, label: "Stars" },
                { mode: "downloads" as const, label: "Downloads" },
                { mode: "official" as const, label: "Official" },
              ]).map(({ mode, label }) => (
                <button
                  key={mode}
                  onClick={() => setSortMode(mode)}
                  className={`rounded-md px-2 py-0.5 text-[11px] transition-colors ${
                    sortMode === mode ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
              <span className="mx-1 text-border">|</span>
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                <input type="checkbox" checked={officialOnly} onChange={(e) => setOfficialOnly(e.target.checked)} className="h-3.5 w-3.5 rounded border-border" />
                Official only
              </label>
              <select value={minStars} onChange={(e) => setMinStars(Number(e.target.value))} className="h-7 rounded border border-border bg-input px-1.5 text-[11px] text-foreground">
                <option value={0}>Any stars</option>
                <option value={10}>10+ stars</option>
                <option value={100}>100+ stars</option>
                <option value={1000}>1K+ stars</option>
              </select>
              <select value={minDownloads} onChange={(e) => setMinDownloads(Number(e.target.value))} className="h-7 rounded border border-border bg-input px-1.5 text-[11px] text-foreground">
                <option value={0}>Any downloads</option>
                <option value={100000}>100K+</option>
                <option value={1000000}>1M+</option>
                <option value={10000000}>10M+</option>
                <option value={100000000}>100M+</option>
              </select>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2">
              {loading && (
                <div className="flex items-center gap-2 py-8 justify-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Searching Docker Hub…
                </div>
              )}

              {!loading && search.length >= 2 && filteredResults.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">No images found.</p>
              )}

              {!loading && search.length < 2 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Type at least 2 characters to search.</p>
              )}

              <div className="flex flex-col gap-1">
                {filteredResults.map((img) => {
                  const isSelected = selected.has(img.name);
                  return (
                    <button
                      key={img.name}
                      onClick={() => toggleService(img)}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        isSelected ? "bg-primary/10 border border-primary/30" : "hover:bg-accent border border-transparent"
                      }`}
                    >
                      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs transition-colors ${
                        isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      }`}>
                        {isSelected && <Check className="h-3 w-3" />}
                      </div>
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
                  );
                })}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between border-t border-border px-4 py-2">
              <span className="text-xs text-muted-foreground">
                {selected.size} service{selected.size !== 1 ? "s" : ""} selected
              </span>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected services detail */}
      {selected.size > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Configuration</span>
          {Array.from(selected.entries()).map(([key, svc]) => {
            const isExpanded = expanded[key];
            const envVars = svc.envVars;
            const name = key.split("/").pop()?.replace(/[^a-zA-Z0-9_-]/g, "-") ?? key;
            return (
              <div key={key} className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Container className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-sm font-medium">{name}</span>
                  <code className="text-xs text-muted-foreground">{svc.image}</code>
                  {envVars.length > 0 && (
                    <button onClick={() => toggleExpand(key)} className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                      Env vars {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                  )}
                </div>
                {isExpanded && envVars.length > 0 && (
                  <div className="border-t border-border px-3 py-2">
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {envVars.map((v) => (
                        <div key={v.key} className="flex items-center gap-1.5">
                          <code className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[11px] text-primary">{v.key}</code>
                          <input
                            type="text"
                            value={svc.envOverrides[v.key] ?? v.defaultValue}
                            onChange={(e) => updateEnv(key, v.key, e.target.value)}
                            className="h-7 flex-1 rounded border border-border bg-input px-2 font-mono text-xs text-foreground"
                            title={v.description}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Output */}
      {selected.size > 0 && (
        <>
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">docker-compose.yml</label>
            <button onClick={() => navigator.clipboard.writeText(compose)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <pre className="h-96 overflow-auto rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground">{compose}</pre>
        </>
      )}
    </div>
  );
}
