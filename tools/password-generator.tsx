"use client";

import { useState, useCallback, useMemo } from "react";

const WORDS = ["apple", "banana", "cherry", "dragon", "eagle", "falcon", "guitar", "hammer", "island", "jungle", "knight", "lemon", "mountain", "nebula", "ocean", "panda", "quartz", "rocket", "sunset", "tiger", "umbrella", "violet", "walnut", "xenon", "yacht", "zebra"];

function getStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 16) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (password.length >= 24) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "Strong", color: "bg-green-500" };
  return { score, label: "Very Strong", color: "bg-emerald-500" };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [uppercase, setUppercase] = useState(true);
  const [lowercase, setLowercase] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [count, setCount] = useState(1);
  const [passwords, setPasswords] = useState<string[]>([]);
  const [mode, setMode] = useState<"random" | "passphrase">("random");
  const [wordCount, setWordCount] = useState(4);
  const [separator, setSeparator] = useState("-");

  const generate = useCallback(() => {
    if (mode === "passphrase") {
      const result = Array.from({ length: count }, () =>
        Array.from({ length: wordCount }, () => WORDS[Math.floor(Math.random() * WORDS.length)]).join(separator)
      );
      setPasswords(result);
      return;
    }
    let chars = "";
    if (uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (numbers) chars += "0123456789";
    if (symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

    const result = Array.from({ length: count }, () =>
      Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
    );
    setPasswords(result);
  }, [length, uppercase, lowercase, numbers, symbols, count, mode, wordCount, separator]);

  const entropy = useMemo(() => {
    if (mode === "passphrase") return wordCount * Math.log2(WORDS.length);
    let pool = 0;
    if (lowercase) pool += 26;
    if (uppercase) pool += 26;
    if (numbers) pool += 10;
    if (symbols) pool += 26;
    return length * Math.log2(pool || 26);
  }, [mode, length, uppercase, lowercase, numbers, symbols, wordCount]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        <button onClick={() => setMode("random")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mode === "random" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Random</button>
        <button onClick={() => setMode("passphrase")} className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mode === "passphrase" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>Passphrase</button>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        {mode === "random" ? (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Length</label>
            <input type="number" min={4} max={128} value={length} onChange={(e) => setLength(Math.max(4, Math.min(128, Number(e.target.value))))} className="h-9 w-20 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Words</label>
              <input type="number" min={2} max={12} value={wordCount} onChange={(e) => setWordCount(Math.max(2, Number(e.target.value)))} className="h-9 w-20 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Separator</label>
              <select value={separator} onChange={(e) => setSeparator(e.target.value)} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
                <option value="-">- (hyphen)</option>
                <option value=".">. (dot)</option>
                <option value="_">_ (underscore)</option>
                <option value=" ">(space)</option>
              </select>
            </div>
          </>
        )}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Count</label>
          <input type="number" min={1} max={20} value={count} onChange={(e) => setCount(Math.max(1, Math.min(20, Number(e.target.value))))} className="h-9 w-20 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        </div>
      </div>

      {mode === "random" && (
        <div className="flex flex-wrap gap-4">
          {[
            { label: "A-Z", value: uppercase, set: setUppercase },
            { label: "a-z", value: lowercase, set: setLowercase },
            { label: "0-9", value: numbers, set: setNumbers },
            { label: "!@#$...", value: symbols, set: setSymbols },
          ].map(({ label, value, set }) => (
            <label key={label} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} className="h-4 w-4 rounded border-border" />
              {label}
            </label>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button onClick={generate} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Generate</button>
        <span className="text-xs text-muted-foreground">Entropy: ~{entropy.toFixed(1)} bits</span>
      </div>

      {passwords.length > 0 && (
        <div className="rounded-lg border border-border bg-card">
          {passwords.map((pw, i) => {
            const strength = getStrength(pw);
            return (
              <div key={i} className="group flex items-center justify-between border-b border-border px-4 py-2 last:border-b-0">
                <div className="flex min-w-0 items-center gap-3">
                  <code className="font-mono text-sm truncate">{pw}</code>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className={`h-1.5 w-12 rounded-full bg-muted overflow-hidden`}>
                      <div className={`h-full rounded-full ${strength.color}`} style={{ width: `${(strength.score / 5) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{strength.label}</span>
                  </div>
                </div>
                <button onClick={() => navigator.clipboard.writeText(pw)} className="ml-2 shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}