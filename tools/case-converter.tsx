"use client";

import { useState, useMemo } from "react";

type CaseType = "camel" | "pascal" | "snake" | "kebab" | "constant" | "title" | "sentence" | "lower" | "upper" | "dot" | "path" | "train";

function toWords(str: string): string[] {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_.\/]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function convertCase(str: string, type: CaseType): string {
  if (!str.trim()) return "";
  const words = toWords(str);
  if (words.length === 0) return "";
  switch (type) {
    case "camel":
      return words.map((w, i) => (i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())).join("");
    case "pascal":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("");
    case "snake":
      return words.map((w) => w.toLowerCase()).join("_");
    case "kebab":
      return words.map((w) => w.toLowerCase()).join("-");
    case "constant":
      return words.map((w) => w.toUpperCase()).join("_");
    case "title":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    case "sentence":
      return words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w.toLowerCase())).join(" ");
    case "lower":
      return str.toLowerCase();
    case "upper":
      return str.toUpperCase();
    case "dot":
      return words.map((w) => w.toLowerCase()).join(".");
    case "path":
      return words.map((w) => w.toLowerCase()).join("/");
    case "train":
      return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join("-");
  }
}

const cases: { type: CaseType; label: string; example: string }[] = [
  { type: "camel", label: "camelCase", example: "helloWorld" },
  { type: "pascal", label: "PascalCase", example: "HelloWorld" },
  { type: "snake", label: "snake_case", example: "hello_world" },
  { type: "kebab", label: "kebab-case", example: "hello-world" },
  { type: "constant", label: "CONSTANT_CASE", example: "HELLO_WORLD" },
  { type: "train", label: "Train-Case", example: "Hello-World" },
  { type: "title", label: "Title Case", example: "Hello World" },
  { type: "sentence", label: "Sentence case", example: "Hello world" },
  { type: "lower", label: "lowercase", example: "hello world" },
  { type: "upper", label: "UPPERCASE", example: "HELLO WORLD" },
  { type: "dot", label: "dot.case", example: "hello.world" },
  { type: "path", label: "path/case", example: "hello/world" },
];

export default function CaseConverter() {
  const [input, setInput] = useState("hello world example");

  const results = useMemo(() => {
    return cases.map(({ type, label, example }) => ({
      type,
      label,
      example,
      result: convertCase(input, type),
    }));
  }, [input]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Input text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-24 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground"
          placeholder="Enter text to convert..."
          spellCheck={false}
        />
      </div>

      <div className="flex flex-col gap-2">
        {results.map(({ type, label, result }) => (
          <div
            key={type}
            className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] text-primary">
                {label}
              </span>
              <code className="truncate font-mono text-sm">{result || "—"}</code>
            </div>
            <button
              onClick={() => result && navigator.clipboard.writeText(result)}
              className="shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground"
            >
              Copy
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}