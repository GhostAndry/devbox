"use client";

import { useState, useMemo } from "react";

type GradientType = "linear" | "radial" | "conic";

interface Stop { color: string; position: number }

export default function CssGradient() {
  const [type, setType] = useState<GradientType>("linear");
  const [angle, setAngle] = useState(90);
  const [stops, setStops] = useState<Stop[]>([
    { color: "#3b82f6", position: 0 },
    { color: "#8b5cf6", position: 100 },
  ]);

  const addStop = () => {
    if (stops.length >= 5) return;
    const last = stops[stops.length - 1];
    const mid = Math.round((last.position + (stops[stops.length - 2]?.position ?? 0)) / 2) || 50;
    setStops([...stops.slice(0, -1), { color: "#ec4899", position: mid }, last].sort((a, b) => a.position - b.position));
  };

  const removeStop = (i: number) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((_, idx) => idx !== i));
  };

  const updateStop = (i: number, field: keyof Stop, value: string | number) => {
    const next = [...stops];
    next[i] = { ...next[i], [field]: value };
    setStops(next);
  };

  const css = useMemo(() => {
    const stopStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    switch (type) {
      case "linear": return `background: linear-gradient(${angle}deg, ${stopStr});`;
      case "radial": return `background: radial-gradient(circle, ${stopStr});`;
      case "conic": return `background: conic-gradient(from ${angle}deg, ${stopStr});`;
    }
  }, [type, angle, stops]);

  const gradientStyle = useMemo(() => {
    const stopStr = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    switch (type) {
      case "linear": return { background: `linear-gradient(${angle}deg, ${stopStr})` };
      case "radial": return { background: `radial-gradient(circle, ${stopStr})` };
      case "conic": return { background: `conic-gradient(from ${angle}deg, ${stopStr})` };
    }
  }, [type, angle, stops]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as GradientType)} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
            <option value="conic">Conic</option>
          </select>
        </div>
        {(type === "linear" || type === "conic") && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Angle ({angle}°)</label>
            <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="h-9 w-32" />
          </div>
        )}
        <button onClick={addStop} className="h-9 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent">+ Add Stop</button>
      </div>

      <div className="flex flex-wrap gap-3">
        {stops.map((stop, i) => (
          <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <input type="color" value={stop.color} onChange={(e) => updateStop(i, "color", e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border" />
            <input type="text" value={stop.color} onChange={(e) => updateStop(i, "color", e.target.value)} className="h-8 w-24 rounded border border-border bg-input px-2 font-mono text-xs text-foreground" />
            <input type="number" min={0} max={100} value={stop.position} onChange={(e) => updateStop(i, "position", Number(e.target.value))} className="h-8 w-14 rounded border border-border bg-input px-2 text-xs text-foreground" />
            <span className="text-xs text-muted-foreground">%</span>
            {stops.length > 2 && (
              <button onClick={() => removeStop(i)} className="text-xs text-muted-foreground hover:text-red-400">✕</button>
            )}
          </div>
        ))}
      </div>

      <div className="h-48 rounded-xl border border-border" style={gradientStyle} />

      <div className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <code className="font-mono text-sm break-all">{css}</code>
        <button onClick={() => navigator.clipboard.writeText(css)} className="ml-2 shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
      </div>
    </div>
  );
}