"use client";

import { useState, useMemo } from "react";

export default function UrlParser() {
  const [input, setInput] = useState("https://example.com:8080/path/to/page?query=value&sort=asc#section");

  const { result, error, params } = useMemo(() => {
    try {
      const url = new URL(input);
      const r: Record<string, string> = {
        "Full URL": url.href,
        "Origin": url.origin,
        "Protocol": url.protocol,
        "Hostname": url.hostname,
        "Port": url.port || "(default)",
        "Pathname": url.pathname,
        "Search": url.search || "(none)",
        "Hash": url.hash || "(none)",
        "Username": url.username || "(none)",
        "Password": url.password ? "••••" : "(none)",
      };
      const p: Record<string, string> = {};
      url.searchParams.forEach((v, k) => { p[k] = v; });
      return { result: r, params: p, error: "" };
    } catch (e) {
      return { result: null, params: null, error: (e as Error).message };
    }
  }, [input]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">URL</label>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="h-9 w-full rounded-md border border-border bg-input px-3 font-mono text-sm text-foreground" />
        </div>
      </div>

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {result && (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">URL Parts</span>
            {Object.entries(result).map(([label, value]) => (
              <div key={label} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
                  <p className="font-mono text-sm break-all">{value}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(value)} className="ml-4 shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
              </div>
            ))}
          </div>

          {params && Object.keys(params).length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Query Parameters ({Object.keys(params).length})</span>
              {Object.entries(params).map(([key, value]) => (
                <div key={key} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{key}</span>
                    <p className="font-mono text-sm break-all">{value}</p>
                  </div>
                  <button onClick={() => navigator.clipboard.writeText(value)} className="ml-4 shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}