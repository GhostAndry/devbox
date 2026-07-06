"use client";

import { useState, useMemo, useEffect } from "react";

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const abs = Math.abs(diff);
  const seconds = Math.floor(abs / 1000);
  if (seconds < 60) return `${seconds}s ${diff < 0 ? "from now" : "ago"}`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${diff < 0 ? "from now" : "ago"}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${diff < 0 ? "from now" : "ago"}`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ${diff < 0 ? "from now" : "ago"}`;
  const months = Math.floor(days / 30);
  return `${months}mo ${diff < 0 ? "from now" : "ago"}`;
}

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const tsResult = useMemo(() => {
    const ts = Number(timestamp);
    if (isNaN(ts) || !timestamp) return null;
    const ms = ts > 1e12 ? ts : ts * 1000;
    const d = new Date(ms);
    if (isNaN(d.getTime())) return null;
    return {
      "ISO 8601": d.toISOString(),
      "UTC": d.toUTCString(),
      "Local": d.toLocaleString(),
      "Local Date": d.toLocaleDateString(),
      "Local Time": d.toLocaleTimeString(),
      "Unix (seconds)": Math.floor(ms / 1000).toString(),
      "Unix (milliseconds)": ms.toString(),
      "Relative": relativeTime(d),
    };
  }, [timestamp]);

  const dateResult = useMemo(() => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return {
      "Unix (seconds)": Math.floor(d.getTime() / 1000).toString(),
      "Unix (milliseconds)": d.getTime().toString(),
      "ISO 8601": d.toISOString(),
    };
  }, [dateInput]);

  const setNowTs = () => setTimestamp(Math.floor(now / 1000).toString());
  const setNowMs = () => setTimestamp(now.toString());

  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-center">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Current Unix Time</span>
        <p className="font-mono text-2xl font-bold">{Math.floor(now / 1000).toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{new Date(now).toLocaleString()}</p>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold">Unix Timestamp → Date</h3>
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Unix timestamp</label>
            <input type="text" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} placeholder="e.g. 1700000000" className="h-9 w-64 rounded-md border border-border bg-input px-3 text-sm font-mono text-foreground" />
          </div>
          <button onClick={setNowTs} className="h-9 rounded-md border border-border bg-card px-3 text-sm hover:bg-accent">Now (s)</button>
          <button onClick={setNowMs} className="h-9 rounded-md border border-border bg-card px-3 text-sm hover:bg-accent">Now (ms)</button>
        </div>
        {tsResult && (
          <div className="flex flex-col gap-2">
            {Object.entries(tsResult).map(([label, value]) => (
              <div key={label} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
                  <p className="font-mono text-sm truncate">{value}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(value)} className="ml-2 shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold">Date → Unix Timestamp</h3>
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Date & time</label>
            <input type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
          </div>
        </div>
        {dateResult && (
          <div className="flex flex-col gap-2">
            {Object.entries(dateResult).map(([label, value]) => (
              <div key={label} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
                  <p className="font-mono text-sm truncate">{value}</p>
                </div>
                <button onClick={() => navigator.clipboard.writeText(value)} className="ml-2 shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}