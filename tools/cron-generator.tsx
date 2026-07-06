"use client";

import { useState, useMemo } from "react";

const COMMON_EXPRESSIONS = [
  { expression: "* * * * *", description: "Every minute" },
  { expression: "*/5 * * * *", description: "Every 5 minutes" },
  { expression: "*/15 * * * *", description: "Every 15 minutes" },
  { expression: "0 * * * *", description: "Every hour" },
  { expression: "0 */6 * * *", description: "Every 6 hours" },
  { expression: "0 0 * * *", description: "Every day at midnight" },
  { expression: "0 9 * * 1-5", description: "Weekdays at 9am" },
  { expression: "0 0 * * 0", description: "Every Sunday at midnight" },
  { expression: "0 0 1 * *", description: "First day of every month" },
  { expression: "0 9-17 * * *", description: "Every hour 9am-5pm" },
  { expression: "0 0 1 1 *", description: "Once a year (Jan 1)" },
  { expression: "*/30 9-17 * * 1-5", description: "Every 30 min, weekdays 9-5" },
];

function describeCron(expr: string): string {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return "Invalid cron expression (need 5 fields)";
  const [min, hour, dom, month, dow] = parts;
  const descriptions: string[] = [];

  if (min === "*" && hour === "*" && dom === "*" && month === "*" && dow === "*") return "Every minute";

  if (min.startsWith("*/")) descriptions.push(`Every ${min.slice(2)} minute(s)`);
  else if (min === "*") descriptions.push("Every minute");
  else if (min.includes(",")) descriptions.push(`At minutes ${min}`);
  else if (min.includes("-")) descriptions.push(`Minutes ${min.replace("-", " to ")}`);
  else descriptions.push(`At minute ${min}`);

  if (hour.startsWith("*/")) descriptions.push(`every ${hour.slice(2)} hour(s)`);
  else if (hour === "*") descriptions.push("of every hour");
  else if (hour.includes(",")) descriptions.push(`at hours ${hour}`);
  else if (hour.includes("-")) descriptions.push(`from ${hour.replace("-", ":00 to ")}:00`);
  else descriptions.push(`at ${hour}:00`);

  if (dom !== "*") {
    if (dom.startsWith("*/")) descriptions.push(`every ${dom.slice(2)} day(s)`);
    else if (dom.includes(",")) descriptions.push(`on days ${dom}`);
    else descriptions.push(`on day ${dom}`);
  }

  if (month !== "*") {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    if (month.includes(",")) descriptions.push(`in ${month.split(",").map((m) => months[parseInt(m) - 1] || m).join(", ")}`);
    else descriptions.push(`in ${months[parseInt(month) - 1] || month}`);
  }

  if (dow !== "*") {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    if (dow.includes(",")) descriptions.push(`on ${dow.split(",").map((d) => days[parseInt(d)] || d).join(", ")}`);
    else if (dow.includes("-")) descriptions.push(`on ${dow.replace("-", " to ")}`);
    else descriptions.push(`on ${days[parseInt(dow)] || dow}`);
  }

  return descriptions.join(" ");
}

function getNextRuns(expr: string, count = 5): Date[] {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) return [];
  const [min, hour, dom, month, dow] = parts;
  const runs: Date[] = [];
  const now = new Date();
  let cursor = new Date(now);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);

  const maxIter = 525600;
  for (let i = 0; i < maxIter && runs.length < count; i++) {
    const m = cursor.getMinutes();
    const h = cursor.getHours();
    const d = cursor.getDate();
    const mo = cursor.getMonth() + 1;
    const dw = cursor.getDay();

    const matchMin = min === "*" || min.split(",").some((p) => { if (p.startsWith("*/")) return m % parseInt(p.slice(2)) === 0; if (p.includes("-")) { const [lo, hi] = p.split("-").map(Number); return m >= lo && m <= hi; } return parseInt(p) === m; });
    const matchHour = hour === "*" || hour.split(",").some((p) => { if (p.startsWith("*/")) return h % parseInt(p.slice(2)) === 0; if (p.includes("-")) { const [lo, hi] = p.split("-").map(Number); return h >= lo && h <= hi; } return parseInt(p) === h; });
    const matchDom = dom === "*" || dom.split(",").some((p) => parseInt(p) === d);
    const matchMonth = month === "*" || month.split(",").some((p) => parseInt(p) === mo);
    const matchDow = dow === "*" || dow.split(",").some((p) => parseInt(p) === dw);

    if (matchMin && matchHour && matchDom && matchMonth && matchDow) {
      runs.push(new Date(cursor));
      cursor.setMinutes(cursor.getMinutes() + 1);
    } else {
      cursor.setMinutes(cursor.getMinutes() + 1);
    }
  }
  return runs;
}

export default function CronGenerator() {
  const [minute, setMinute] = useState("*");
  const [hour, setHour] = useState("*");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("*");

  const expression = `${minute} ${hour} ${dom} ${month} ${dow}`;
  const description = useMemo(() => describeCron(expression), [expression]);
  const nextRuns = useMemo(() => getNextRuns(expression, 5), [expression]);

  const applyPreset = (expr: string) => {
    const p = expr.split(" ");
    setMinute(p[0]); setHour(p[1]); setDom(p[2]); setMonth(p[3]); setDow(p[4]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-4">
        {[
          { key: "minute", label: "Minute (0-59)", value: minute, set: setMinute },
          { key: "hour", label: "Hour (0-23)", value: hour, set: setHour },
          { key: "dom", label: "Day of Month (1-31)", value: dom, set: setDom },
          { key: "month", label: "Month (1-12)", value: month, set: setMonth },
          { key: "dow", label: "Day of Week (0-6)", value: dow, set: setDow },
        ].map(({ key, label, value, set }) => (
          <div key={key} className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">{label}</label>
            <input type="text" value={value} onChange={(e) => set(e.target.value)} className="h-9 w-28 rounded-md border border-border bg-input px-3 font-mono text-sm text-foreground" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Cron Expression</span>
            <p className="font-mono text-2xl font-bold">{expression}</p>
          </div>
          <button onClick={() => navigator.clipboard.writeText(expression)} className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Description</span>
          <p className="text-sm">{description}</p>
        </div>
        {nextRuns.length > 0 && (
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Next 5 runs</span>
            <div className="mt-1 flex flex-col gap-0.5">
              {nextRuns.map((d, i) => (
                <code key={i} className="font-mono text-sm">{d.toLocaleString()}</code>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-semibold">Common Expressions</h3>
        <div className="flex flex-col gap-1.5">
          {COMMON_EXPRESSIONS.map(({ expression: expr, description: desc }) => (
            <button key={expr} onClick={() => applyPreset(expr)} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2 text-left hover:bg-accent">
              <div>
                <code className="font-mono text-sm">{expr}</code>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <span className="text-xs text-muted-foreground">Use →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}