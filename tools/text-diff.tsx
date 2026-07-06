"use client";

import { useState, useMemo } from "react";

type DiffLine = { type: "same" | "added" | "removed"; line: string; lineA?: number; lineB?: number };

function computeLCS(a: string[], b: string[]): number[][] {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp;
}

function computeDiff(a: string[], b: string[]): DiffLine[] {
  const dp = computeLCS(a, b);
  const result: DiffLine[] = [];
  let i = a.length, j = b.length;
  const temp: DiffLine[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      temp.push({ type: "same", line: a[i - 1], lineA: i, lineB: j });
      i--; j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      temp.push({ type: "added", line: b[j - 1], lineB: j });
      j--;
    } else {
      temp.push({ type: "removed", line: a[i - 1], lineA: i });
      i--;
    }
  }
  return temp.reverse();
}

export default function TextDiff() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");

  const diff = useMemo(() => {
    if (!textA && !textB) return [];
    const linesA = textA.split("\n");
    const linesB = textB.split("\n");
    return computeDiff(linesA, linesB);
  }, [textA, textB]);

  const stats = useMemo(() => {
    const added = diff.filter((d) => d.type === "added").length;
    const removed = diff.filter((d) => d.type === "removed").length;
    return { added, removed, total: diff.length };
  }, [diff]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Original</label>
          <textarea value={textA} onChange={(e) => setTextA(e.target.value)} className="h-64 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground" placeholder="Original text..." spellCheck={false} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Modified</label>
          <textarea value={textB} onChange={(e) => setTextB(e.target.value)} className="h-64 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground" placeholder="Modified text..." spellCheck={false} />
        </div>
      </div>

      {diff.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">
              Diff
              <span className="ml-2 text-[10px] text-muted-foreground">
                <span className="text-green-400">+{stats.added}</span> / <span className="text-red-400">-{stats.removed}</span> / {stats.total} total
              </span>
            </label>
          </div>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            {diff.map((line, i) => (
              <div key={i} className={`flex border-b border-border last:border-b-0 font-mono text-sm ${line.type === "added" ? "bg-green-500/10" : line.type === "removed" ? "bg-red-500/10" : ""}`}>
                <span className="shrink-0 w-12 text-right px-2 py-1 text-[10px] text-muted-foreground select-none border-r border-border">
                  {line.type === "added" ? `+${line.lineB}` : line.type === "removed" ? `-${line.lineA}` : ` ${line.lineA}`}
                </span>
                <span className="shrink-0 w-5 text-center py-1 text-[10px] select-none">
                  {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                </span>
                <span className={`py-1 px-2 ${line.type === "added" ? "text-green-400" : line.type === "removed" ? "text-red-400" : "text-foreground"}`}>
                  {line.line || " "}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}