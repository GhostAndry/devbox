"use client";

import { useState, useCallback, useEffect } from "react";

const LOREM_WORDS = ["lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"];

function generateSentence(): string {
  const len = 6 + Math.floor(Math.random() * 10);
  const words = Array.from({ length: len }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateParagraph(): string {
  return Array.from({ length: 3 + Math.floor(Math.random() * 5) }, generateSentence).join(" ");
}

type Mode = "paragraphs" | "sentences" | "words" | "bytes";

export default function LoremIpsum() {
  const [mode, setMode] = useState<Mode>("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [startWithLorem, setStartWithLorem] = useState(true);

  const generate = useCallback(() => {
    let result = "";
    switch (mode) {
      case "paragraphs":
        result = Array.from({ length: count }, generateParagraph).join("\n\n");
        break;
      case "sentences":
        result = Array.from({ length: count }, generateSentence).join(" ");
        break;
      case "words":
        result = Array.from({ length: count }, () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]).join(" ");
        break;
      case "bytes":
        result = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
        while (new Blob([result]).size < count) result += generateSentence() + " ";
        break;
    }
    if (startWithLorem && mode !== "words") {
      result = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " + result.replace(/^Lorem ipsum dolor sit amet, consectetur adipiscing elit\.\s*/, "");
    }
    setOutput(result);
  }, [mode, count, startWithLorem]);

  useEffect(() => { generate(); }, [generate]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Type</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as Mode)} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value="paragraphs">Paragraphs</option>
            <option value="sentences">Sentences</option>
            <option value="words">Words</option>
            <option value="bytes">Bytes</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">{mode === "bytes" ? "Bytes" : "Count"}</label>
          <input type="number" min={1} max={mode === "bytes" ? 1048576 : 100} value={count} onChange={(e) => setCount(Math.max(1, Number(e.target.value)))} className="h-9 w-24 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer pb-1">
          <input type="checkbox" checked={startWithLorem} onChange={(e) => setStartWithLorem(e.target.checked)} className="h-4 w-4 rounded border-border" />
          Start with "Lorem ipsum"
        </label>
        <button onClick={generate} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Regenerate</button>
        {output && <button onClick={() => navigator.clipboard.writeText(output)} className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent">Copy</button>}
      </div>

      {output && (
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Output ({output.length.toLocaleString()} chars, {new Blob([output]).size.toLocaleString()} bytes)
          </span>
          <div className="rounded-lg border border-border bg-card p-4 text-sm leading-relaxed">{output}</div>
        </div>
      )}
    </div>
  );
}