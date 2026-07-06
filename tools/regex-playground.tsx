"use client";

import { useState, useCallback, useMemo } from "react";

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function suggestPatterns(text: string): { label: string; pattern: string; flags: string }[] {
  if (!text.trim()) return [];
  const suggestions: { label: string; pattern: string; flags: string }[] = [];

  // Match the whole text literally
  suggestions.push({
    label: "Match exact text",
    pattern: escapeRegex(text.trim()),
    flags: "g",
  });

  // Match each line
  const lines = text.split("\n").filter(Boolean);
  if (lines.length > 1) {
    suggestions.push({
      label: "Match any of these lines",
      pattern: lines.map((l) => escapeRegex(l.trim())).join("|"),
      flags: "gm",
    });
  }

  // Match words
  const words = [...new Set(text.match(/\b\w+\b/g) ?? [])];
  if (words.length >= 2) {
    suggestions.push({
      label: "Match any word",
      pattern: words.map((w) => escapeRegex(w)).join("|"),
      flags: "gi",
    });
  }

  // Match numbers
  const numbers = text.match(/\d+(?:\.\d+)?/g);
  if (numbers && numbers.length > 0) {
    suggestions.push({
      label: "Match numbers",
      pattern: "\\d+(?:\\.\\d+)?",
      flags: "g",
    });
  }

  // Match emails
  if (text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)) {
    suggestions.push({
      label: "Match emails",
      pattern: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
      flags: "gi",
    });
  }

  // Match URLs
  if (text.match(/https?:\/\/[^\s]+/)) {
    suggestions.push({
      label: "Match URLs",
      pattern: "https?://[^\\s]+",
      flags: "gi",
    });
  }

  // Match IP addresses
  if (text.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/)) {
    suggestions.push({
      label: "Match IP addresses",
      pattern: "\\b(?:\\d{1,3}\\.){3}\\d{1,3}\\b",
      flags: "g",
    });
  }

  // Match dates (ISO)
  if (text.match(/\d{4}-\d{2}-\d{2}/)) {
    suggestions.push({
      label: "Match ISO dates",
      pattern: "\\d{4}-\\d{2}-\\d{2}",
      flags: "g",
    });
  }

  return suggestions;
}

/* ── Pattern builder presets ──────────────────────────────────────────────── */

interface PatternChip {
  label: string;
  insert: string;
  description: string;
}

const CHAR_CLASSES: PatternChip[] = [
  { label: "a-z", insert: "[a-z]", description: "Lowercase letters" },
  { label: "A-Z", insert: "[A-Z]", description: "Uppercase letters" },
  { label: "0-9", insert: "[0-9]", description: "Digits" },
  { label: "a-zA-Z", insert: "[a-zA-Z]", description: "Any letter" },
  { label: "a-zA-Z0-9", insert: "[a-zA-Z0-9]", description: "Alphanumeric" },
  { label: "\\w", insert: "\\w", description: "Word char [a-zA-Z0-9_]" },
  { label: "\\W", insert: "\\W", description: "Non-word char" },
  { label: "\\d", insert: "\\d", description: "Digit [0-9]" },
  { label: "\\D", insert: "\\D", description: "Non-digit" },
  { label: "\\s", insert: "\\s", description: "Whitespace" },
  { label: "\\S", insert: "\\S", description: "Non-whitespace" },
  { label: ".", insert: ".", description: "Any character" },
  { label: "[^...]", insert: "[^", description: "Negated class" },
];

const ANCHORS: PatternChip[] = [
  { label: "^", insert: "^", description: "Start of line" },
  { label: "$", insert: "$", description: "End of line" },
  { label: "\\b", insert: "\\b", description: "Word boundary" },
  { label: "\\B", insert: "\\B", description: "Non-word boundary" },
];

const QUANTIFIERS: PatternChip[] = [
  { label: "+", insert: "+", description: "One or more" },
  { label: "*", insert: "*", description: "Zero or more" },
  { label: "?", insert: "?", description: "Optional (0 or 1)" },
  { label: "{n}", insert: "{", description: "Exactly n times" },
  { label: "{n,}", insert: "{", description: "At least n times" },
  { label: "{n,m}", insert: "{", description: "Between n and m" },
];

const GROUPS: PatternChip[] = [
  { label: "(...)", insert: "(", description: "Capturing group" },
  { label: "(?:...)", insert: "(?:", description: "Non-capturing group" },
  { label: "(?<name>...)", insert: "(?<", description: "Named group" },
  { label: "|", insert: "|", description: "Alternation (OR)" },
];

const FLAGS_CHIPS: { label: string; flag: string; description: string }[] = [
  { label: "g", flag: "g", description: "Global — all matches" },
  { label: "i", flag: "i", description: "Case insensitive" },
  { label: "m", flag: "m", description: "Multiline — ^$ match lines" },
  { label: "s", flag: "s", description: "Dotall — . matches newline" },
  { label: "u", flag: "u", description: "Unicode" },
  { label: "v", flag: "v", description: "Unicode sets" },
];

export default function RegexPlayground() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"test" | "generate">("test");

  const suggestions = useMemo(() => suggestPatterns(testString), [testString]);

  const getMatches = useCallback(() => {
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { text: string; index: number; groups: Record<string, string> }[] = [];
      let match;
      if (flags.includes("g")) {
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.groups ? { ...match.groups } : {},
          });
          if (!match[0]) break;
        }
      } else {
        match = regex.exec(testString);
        if (match) {
          matches.push({
            text: match[0],
            index: match.index,
            groups: match.groups ? { ...match.groups } : {},
          });
        }
      }
      setError("");
      return matches;
    } catch (e) {
      setError((e as Error).message);
      return [];
    }
  }, [pattern, flags, testString]);

  const matches = pattern ? getMatches() : [];

  const highlightText = () => {
    if (!pattern || error) return testString;
    let result = "";
    let lastIndex = 0;
    for (const m of matches) {
      result += testString.slice(lastIndex, m.index);
      result += `<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">${testString.slice(m.index, m.index + m.text.length)}</mark>`;
      lastIndex = m.index + m.text.length;
    }
    result += testString.slice(lastIndex);
    return result;
  };

  const applySuggestion = (s: { pattern: string; flags: string }) => {
    setPattern(s.pattern);
    setFlags(s.flags);
    setMode("test");
  };

  const insertAtCursor = (text: string) => {
    setPattern((prev) => prev + text);
  };

  const toggleFlag = (flag: string) => {
    setFlags((prev) =>
      prev.includes(flag) ? prev.replace(flag, "") : prev + flag
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        <button
          onClick={() => setMode("test")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "test"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Test Regex
        </button>
        <button
          onClick={() => setMode("generate")}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            mode === "generate"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Generate Regex
        </button>
      </div>

      {/* ── TEST MODE ──────────────────────────────────── */}
      {mode === "test" && (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1.5 flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground">Pattern</label>
              <div className="flex h-9 items-center rounded-md border border-border bg-input">
                <span className="px-2 text-muted-foreground">/</span>
                <input
                  type="text"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="h-full flex-1 bg-transparent font-mono text-sm outline-none text-foreground min-w-0"
                  placeholder="regex pattern"
                />
                <span className="text-muted-foreground">/</span>
                <input
                  type="text"
                  value={flags}
                  onChange={(e) => setFlags(e.target.value)}
                  className="h-full w-12 bg-transparent font-mono text-sm outline-none text-foreground"
                  placeholder="flags"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* ── Pattern Builder ──────────────────────── */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Pattern Builder
            </span>

            {/* Character classes */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground">Character classes</span>
              <div className="flex flex-wrap gap-1">
                {CHAR_CLASSES.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => insertAtCursor(c.insert)}
                    title={c.description}
                    className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Anchors */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground">Anchors</span>
              <div className="flex flex-wrap gap-1">
                {ANCHORS.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => insertAtCursor(c.insert)}
                    title={c.description}
                    className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantifiers */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground">Quantifiers</span>
              <div className="flex flex-wrap gap-1">
                {QUANTIFIERS.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => insertAtCursor(c.insert)}
                    title={c.description}
                    className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Groups */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground">Groups &amp; alternation</span>
              <div className="flex flex-wrap gap-1">
                {GROUPS.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => insertAtCursor(c.insert)}
                    title={c.description}
                    className="rounded-md border border-border bg-card px-2 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flags */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-muted-foreground">Flags</span>
              <div className="flex flex-wrap gap-1">
                {FLAGS_CHIPS.map((f) => {
                  const active = flags.includes(f.flag);
                  return (
                    <button
                      key={f.flag}
                      onClick={() => toggleFlag(f.flag)}
                      title={f.description}
                      className={`rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors ${
                        active
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Test string</label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="h-40 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground"
              placeholder="Enter text to test against..."
              spellCheck={false}
            />
          </div>

          {matches.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Matches ({matches.length})
              </span>
              <div
                className="rounded-lg border border-border bg-card p-3 font-mono text-sm"
                dangerouslySetInnerHTML={{ __html: highlightText() || testString }}
              />
              <div className="flex flex-wrap gap-2">
                {matches.map((m, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-yellow-500/10 px-2 py-0.5 font-mono text-sm text-yellow-400"
                  >
                    &quot;{m.text}&quot; @ {m.index}
                  </span>
                ))}
              </div>
            </div>
          )}

          {pattern && !error && matches.length === 0 && (
            <p className="text-sm text-muted-foreground">No matches found.</p>
          )}
        </>
      )}

      {/* ── GENERATE MODE ──────────────────────────────── */}
      {mode === "generate" && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Enter sample text — we&apos;ll suggest regex patterns
            </label>
            <textarea
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              className="h-48 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground"
              placeholder="Paste text you want to match with a regex…"
              spellCheck={false}
            />
          </div>

          {suggestions.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Suggested Patterns ({suggestions.length})
              </span>
              <div className="flex flex-col gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => applySuggestion(s)}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{s.label}</p>
                      <code className="mt-1 block truncate text-xs text-muted-foreground">
                        /{s.pattern}/{s.flags}
                      </code>
                    </div>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      Click to test →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {testString.trim() && suggestions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No patterns detected. Try pasting text with emails, URLs, numbers, or multiple lines.
            </p>
          )}
        </>
      )}
    </div>
  );
}