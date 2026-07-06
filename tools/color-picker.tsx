"use client";

import { useState, useMemo } from "react";

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) { case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break; case g: h = ((b - r) / d + 2) / 6; break; case b: h = ((r - g) / d + 4) / 6; break; }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const PALETTE_PRESETS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#84cc16", "#14b8a6"];

export default function ColorPicker() {
  const [color, setColor] = useState("#3b82f6");
  const [savedColors, setSavedColors] = useState<string[]>([]);

  const rgb = hexToRgb(color);
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null;
  const luminance = rgb ? getLuminance(rgb.r, rgb.g, rgb.b) : 0;
  const textColor = luminance > 0.5 ? "#000000" : "#ffffff";
  const whiteContrast = rgb ? contrastRatio(luminance, 1) : 0;
  const blackContrast = rgb ? contrastRatio(luminance, 0) : 0;

  const formats: Record<string, string> = rgb ? {
    HEX: color.toUpperCase(),
    RGB: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
    "RGB (css)": `rgb(${rgb.r} ${rgb.g} ${rgb.b})`,
    HSL: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "",
    "HEX + Alpha": `${color.toUpperCase()}FF`,
  } : {};

  const saveColor = () => {
    if (!savedColors.includes(color)) {
      setSavedColors((prev) => [color, ...prev].slice(0, 12));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Pick a color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-16 cursor-pointer rounded-md border border-border" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">HEX value</label>
          <input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-40 rounded-md border border-border bg-input px-3 font-mono text-sm text-foreground" />
        </div>
        <button onClick={saveColor} className="h-10 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent">💾 Save</button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {PALETTE_PRESETS.map((c) => (
          <button key={c} onClick={() => setColor(c)} className="h-8 w-8 rounded-md border border-border transition-transform hover:scale-110" style={{ backgroundColor: c }} title={c} />
        ))}
      </div>

      <div className="h-32 rounded-xl border border-border relative overflow-hidden" style={{ backgroundColor: color }}>
        <span className="absolute bottom-2 left-3 text-sm font-semibold" style={{ color: textColor }}>
          Preview — contrast: white {whiteContrast.toFixed(1)}:1 / black {blackContrast.toFixed(1)}:1
        </span>
      </div>

      {rgb && (
        <div className="flex flex-col gap-2">
          {Object.entries(formats).map(([label, value]) => (
            <div key={label} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
                <p className="font-mono text-sm">{value}</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(value)} className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
            </div>
          ))}
        </div>
      )}

      {savedColors.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Saved Colors</span>
          <div className="flex flex-wrap gap-1.5">
            {savedColors.map((c, i) => (
              <button key={i} onClick={() => setColor(c)} className="h-8 w-8 rounded-md border border-border transition-transform hover:scale-110" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}