"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export default function JsonToYaml() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"json2yaml" | "yaml2json">("json2yaml");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const convert = useCallback(() => {
    if (!input.trim()) { setOutput(""); setError(""); return; }
    try {
      if (mode === "json2yaml") {
        const obj = JSON.parse(input);
        setOutput(jsonToYaml(obj));
      } else {
        const obj = parseYaml(input);
        setOutput(JSON.stringify(obj, null, 2));
      }
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  }, [input, mode]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(convert, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [convert]);

  const swap = () => {
    setMode((m) => (m === "json2yaml" ? "yaml2json" : "json2yaml"));
    setInput(output);
    setOutput("");
    setError("");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Mode</label>
          <select value={mode} onChange={(e) => { setMode(e.target.value as "json2yaml" | "yaml2json"); setOutput(""); setError(""); }} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value="json2yaml">JSON → YAML</option>
            <option value="yaml2json">YAML → JSON</option>
          </select>
        </div>
        <button onClick={swap} className="h-9 rounded-md border border-border bg-card px-3 text-sm font-medium hover:bg-accent">⇄ Swap</button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">{mode === "json2yaml" ? "JSON Input" : "YAML Input"}</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-80 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground" placeholder={mode === "json2yaml" ? '{"key": "value"}' : "key: value"} spellCheck={false} />
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">{mode === "json2yaml" ? "YAML Output" : "JSON Output"}</label>
            {output && <button onClick={() => navigator.clipboard.writeText(output)} className="text-xs text-muted-foreground hover:text-foreground">Copy</button>}
          </div>
          {error ? <div className="h-80 overflow-auto rounded-lg border border-destructive/30 bg-destructive/10 p-3 font-mono text-sm text-destructive">{error}</div> : <pre className="h-80 overflow-auto rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground">{output || "Output will appear here..."}</pre>}
        </div>
      </div>
    </div>
  );
}

function jsonToYaml(obj: unknown, indent = 0): string {
  const prefix = "  ".repeat(indent);
  if (obj === null) return "null";
  if (typeof obj === "boolean") return obj ? "true" : "false";
  if (typeof obj === "number") return String(obj);
  if (typeof obj === "string") {
    if (obj === "" || obj.includes("\n") || obj.includes(": ") || obj.includes("#") || obj.startsWith(" ") || obj.endsWith(" ") || /^[\d]/.test(obj) && !/^\d+(\.\d+)?$/.test(obj)) {
      return `"${obj.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    // Quote strings that look like booleans/null/numbers but are actually strings
    if (obj === "true" || obj === "false" || obj === "null" || obj === "~" || /^\d+(\.\d+)?$/.test(obj)) {
      return `"${obj}"`;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return "[]";
    return obj.map((item) => {
      if (typeof item === "object" && item !== null) {
        const inner = jsonToYaml(item, indent + 1);
        const lines = inner.split("\n");
        // First line gets "- " prefix, subsequent lines keep their indent
        return `${prefix}- ${lines[0]}${lines.length > 1 ? "\n" + lines.slice(1).join("\n") : ""}`;
      }
      return `${prefix}- ${jsonToYaml(item, indent)}`;
    }).join("\n");
  }
  if (typeof obj === "object") {
    const entries = Object.entries(obj as Record<string, unknown>);
    if (entries.length === 0) return "{}";
    return entries.map(([key, val]) => {
      const yamlVal = jsonToYaml(val, indent + 1);
      if (typeof val === "object" && val !== null && !Array.isArray(val) && Object.keys(val as object).length > 0) {
        return `${prefix}${key}:\n${yamlVal}`;
      }
      if (Array.isArray(val) && val.length > 0) {
        return `${prefix}${key}:\n${yamlVal}`;
      }
      return `${prefix}${key}: ${yamlVal}`;
    }).join("\n");
  }
  return String(obj);
}

/* ── YAML → JSON parser ─────────────────────────────────────────────────── */

function parseScalar(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "true" || trimmed === "yes" || trimmed === "on") return true;
  if (trimmed === "false" || trimmed === "no" || trimmed === "off") return false;
  if (trimmed === "null" || trimmed === "~" || trimmed === "") return null;
  if (/^-?\d+$/.test(trimmed)) return parseInt(trimmed, 10);
  if (/^-?\d+\.\d+$/.test(trimmed)) return parseFloat(trimmed);
  // Quoted string
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }
  return trimmed;
}

function getIndent(line: string): number {
  return line.search(/\S/);
}

function parseYamlBlock(lines: string[], startIdx: number, baseIndent: number): { value: unknown; nextIdx: number } {
  let i = startIdx;
  // Skip empty lines
  while (i < lines.length && lines[i].trim() === "") i++;
  if (i >= lines.length) return { value: null, nextIdx: i };

  const line = lines[i];
  const indent = getIndent(line);
  if (indent < baseIndent) return { value: null, nextIdx: i };

  const content = line.slice(indent);

  // Array item: "- ..."
  if (content.startsWith("- ")) {
    const items: unknown[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === "") { i++; continue; }
      const lIndent = getIndent(l);
      if (lIndent < indent) break; // back to parent
      if (lIndent !== indent || !l.slice(lIndent).startsWith("- ")) break; // not an array item

      const afterDash = l.slice(lIndent + 2);
      if (afterDash.trim() === "") {
        // Empty item (null)
        items.push(null);
        i++;
      } else if (afterDash.includes(":")) {
        // Object item: "- key: value" — collect following indented lines as the object
        const objFirstLine = " ".repeat(indent + 2) + afterDash;
        const objLines: string[] = [objFirstLine];
        i++;
        while (i < lines.length) {
          const nl = lines[i];
          if (nl.trim() === "") { i++; continue; }
          const nlIndent = getIndent(nl);
          if (nlIndent <= indent) break;
          objLines.push(nl);
          i++;
        }
        const parsed = parseYamlObject(objLines, 0, indent + 2);
        items.push(parsed);
      } else {
        // Scalar item: "- value"
        items.push(parseScalar(afterDash));
        i++;
      }
    }
    return { value: items, nextIdx: i };
  }

  // Object: "key: ..."
  if (content.includes(":")) {
    const objLines: string[] = [];
    while (i < lines.length) {
      const l = lines[i];
      if (l.trim() === "") { i++; continue; }
      const lIndent = getIndent(l);
      if (lIndent < indent) break;
      objLines.push(l);
      i++;
    }
    return { value: parseYamlObject(objLines, 0, indent), nextIdx: i };
  }

  // Scalar
  return { value: parseScalar(content), nextIdx: i + 1 };
}

function parseYamlObject(lines: string[], startIdx: number, baseIndent: number): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let i = startIdx;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === "") { i++; continue; }
    const indent = getIndent(line);
    if (indent < baseIndent) break;
    if (indent !== baseIndent) { i++; continue; }

    const content = line.slice(indent);
    const colonIdx = content.indexOf(":");
    if (colonIdx === -1) { i++; continue; }

    const key = content.slice(0, colonIdx).trim();
    const afterColon = content.slice(colonIdx + 1);

    if (afterColon.trim() === "") {
      // Value is on following lines (nested object/array)
      i++;
      const nested = parseYamlBlock(lines, i, indent + 1);
      result[key] = nested.value;
      i = nested.nextIdx;
    } else {
      // Inline scalar value
      result[key] = parseScalar(afterColon);
      i++;
    }
  }

  return result;
}

function parseYaml(yaml: string): unknown {
  const lines = yaml.split("\n");
  const parsed = parseYamlBlock(lines, 0, 0);
  return parsed.value;
}