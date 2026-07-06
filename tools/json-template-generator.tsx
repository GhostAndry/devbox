"use client";

import { useState, useCallback } from "react";
import data from "@/lib/data.json";

type PlaceholderType =
  | "string"
  | "number"
  | "float"
  | "boolean"
  | "date"
  | "datetime"
  | "email"
  | "uuid"
  | "url"
  | "firstName"
  | "lastName"
  | "fullName"
  | "phone"
  | "city"
  | "country"
  | "company"
  | "jobTitle"
  | "color"
  | "ip"
  | "enum"
  | "street"
  | "zipCode"
  | "latitude"
  | "longitude"
  | "lorem"
  | "loremSentence"
  | "loremParagraph"
  | "username"
  | "domain"
  | "age"
  | "price"
  | "percentage"
  | "id"
  | "timestamp"
  | "creditCard"
  | "iban"
  | "macAddress"
  | "userAgent"
  | "mimeType"
  | "httpMethod"
  | "statusCode"
  | "emoji"
  | "hex"
  | "base64"
  | "slug"
  | "semver";

interface EnumOption {
  values: string[];
}

interface PlaceholderDef {
  type: PlaceholderType;
  enumOptions?: EnumOption;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateValue(type: PlaceholderType, enumOptions?: EnumOption): unknown {
  switch (type) {
    case "string":
      return `string_${randomInt(100, 999)}`;
    case "number":
      return randomInt(1, 1000);
    case "float":
      return randomFloat(0, 1000, 2);
    case "boolean":
      return Math.random() > 0.5;
    case "date":
      return new Date(Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000)).toISOString().split("T")[0];
    case "datetime":
      return new Date(Date.now() - randomInt(0, 365 * 24 * 60 * 60 * 1000)).toISOString();
    case "email":
      return `${randomItem(data.firstNames).toLowerCase()}${randomInt(1, 999)}@${randomItem(data.domains)}`;
    case "uuid":
      return crypto.randomUUID();
    case "url":
      return `https://${randomItem(["example", "mysite", "api", "app", "dashboard"])}.com/${randomItem(["users", "posts", "items", "orders"])}/${randomInt(1, 9999)}`;
    case "firstName":
      return randomItem(data.firstNames);
    case "lastName":
      return randomItem(data.lastNames);
    case "fullName":
      return `${randomItem(data.firstNames)} ${randomItem(data.lastNames)}`;
    case "phone":
      return `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
    case "city":
      return randomItem(data.cities);
    case "country":
      return randomItem(data.countries);
    case "company":
      return randomItem(data.companies);
    case "jobTitle":
      return randomItem(data.jobTitles);
    case "color":
      return `#${randomInt(0, 0xffffff).toString(16).padStart(6, "0")}`;
    case "ip":
      return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 255)}`;
    case "enum":
      return enumOptions ? randomItem(enumOptions.values) : "unknown";
    case "street":
      return `${randomInt(1, 9999)} ${randomItem(data.streetNames)}`;
    case "zipCode":
      return `${randomInt(10000, 99999)}`;
    case "latitude":
      return randomFloat(-90, 90, 6);
    case "longitude":
      return randomFloat(-180, 180, 6);
    case "lorem":
      return randomItem(data.loremWords);
    case "loremSentence":
      return Array.from({ length: randomInt(5, 15) }, () => randomItem(data.loremWords)).join(" ") + ".";
    case "loremParagraph":
      return Array.from({ length: randomInt(3, 6) }, () =>
        Array.from({ length: randomInt(8, 20) }, () => randomItem(data.loremWords)).join(" ")
      ).join(". ") + ".";
    case "username":
      return `${randomItem(data.firstNames).toLowerCase()}_${randomItem(data.lastNames).toLowerCase()}${randomInt(1, 99)}`;
    case "domain":
      return `${randomItem(["example", "mysite", "api", "app", "dashboard", "blog", "shop", "cdn"])}.com`;
    case "age":
      return randomInt(18, 80);
    case "price":
      return randomFloat(0.99, 999.99, 2);
    case "percentage":
      return randomInt(0, 100);
    case "id":
      return randomInt(1, 999999);
    case "timestamp":
      return Math.floor(Date.now() / 1000) - randomInt(0, 365 * 24 * 60 * 60);
    case "creditCard":
      return `${randomInt(4000, 4999)}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`;
    case "iban":
      return `GB${randomInt(10, 99)}BARC${randomInt(10000000, 99999999)}`;
    case "macAddress":
      return Array.from({ length: 6 }, () => randomInt(0, 255).toString(16).padStart(2, "0")).join(":");
    case "userAgent":
      return randomItem([
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
        "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
      ]);
    case "mimeType":
      return randomItem(["application/json", "text/html", "image/png", "image/jpeg", "application/pdf", "text/css", "application/javascript", "image/svg+xml", "application/zip", "audio/mpeg"]);
    case "httpMethod":
      return randomItem(["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"]);
    case "statusCode":
      return randomItem([200, 201, 204, 301, 302, 400, 401, 403, 404, 500, 502, 503]);
    case "emoji":
      return randomItem(["🚀", "💡", "🔥", "⭐", "🎉", "❤️", "👍", "🤖", "✨", "🌈", "🍕", "🎸", "🏆", "💻", "📚", "🔑", "⚡", "🎯", "🧩", "🌍"]);
    case "hex":
      return randomInt(0, 0xffffff).toString(16).padStart(6, "0");
    case "base64":
      return btoa(`data_${randomInt(1000, 9999)}`);
    case "slug":
      return `${randomItem(data.loremWords)}-${randomItem(data.loremWords)}-${randomInt(1, 99)}`;
    case "semver":
      return `${randomInt(0, 10)}.${randomInt(0, 20)}.${randomInt(0, 99)}`;
    default:
      return null;
  }
}

function parsePlaceholders(template: string): Map<string, PlaceholderDef> {
  const placeholders = new Map<string, PlaceholderDef>();
  // Match {{placeholderName}} or {{placeholderName:type}} or {{placeholderName:enum:[val1,val2,...]}}
  const regex = /\{\{(\w+)(?::(\w+))?(?::\[([^\]]+)\])?\}\}/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(template)) !== null) {
    const [, name, type, enumValues] = match;
    const pType = (type as PlaceholderType) || "string";
    const def: PlaceholderDef = { type: pType };
    if (pType === "enum" && enumValues) {
      def.enumOptions = { values: enumValues.split(",").map((v) => v.trim()) };
    }
    placeholders.set(name, def);
  }
  return placeholders;
}

function generateFromTemplate(template: string, count: number): string {
  const placeholders = parsePlaceholders(template);

  const results = Array.from({ length: count }, () => {
    let filled = template;
    for (const [name, def] of placeholders) {
      const value = generateValue(def.type, def.enumOptions);
      // Replace all occurrences of this placeholder
      const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(
        `\\{\\{${escaped}(?::\\w+)?(?:\\:\\[[^\\]]+\\])?\\}\\}`,
        "g"
      );
      filled = filled.replace(pattern, typeof value === "string" ? value : JSON.stringify(value));
    }
    // Try to parse as JSON to pretty-print, otherwise return as-is
    try {
      return JSON.parse(filled);
    } catch {
      return filled;
    }
  });

  return JSON.stringify(results, null, 2);
}

const EXAMPLE_TEMPLATE = `{
  "id": "{{id:uuid}}",
  "name": "{{name:fullName}}",
  "email": "{{email:email}}",
  "age": "{{age:age}}",
  "active": "{{active:boolean}}",
  "role": "{{role:enum:[admin,user,editor,guest]}}",
  "address": {
    "street": "{{street:street}}",
    "city": "{{city:city}}",
    "country": "{{country:country}}",
    "zip": "{{zip:zipCode}}"
  },
  "company": "{{company:company}}",
  "jobTitle": "{{jobTitle:jobTitle}}",
  "salary": "{{salary:price}}",
  "createdAt": "{{createdAt:datetime}}"
}`;

const HELP_ITEMS = [
  // ── Basic ──
  { type: "string", desc: "Random short string" },
  { type: "number", desc: "Random integer 1–1000" },
  { type: "float", desc: "Random float 0–1000" },
  { type: "boolean", desc: "Random true / false" },
  { type: "enum:[a,b,c]", desc: "Random pick from list" },
  // ── Identity ──
  { type: "firstName", desc: "Random first name" },
  { type: "lastName", desc: "Random last name" },
  { type: "fullName", desc: "Random full name" },
  { type: "username", desc: "Random username" },
  { type: "email", desc: "Random email address" },
  { type: "phone", desc: "Random phone number" },
  { type: "age", desc: "Random age 18–80" },
  // ── Location ──
  { type: "street", desc: "Random street address" },
  { type: "city", desc: "Random city" },
  { type: "country", desc: "Random country" },
  { type: "zipCode", desc: "Random ZIP code" },
  { type: "latitude", desc: "Random latitude" },
  { type: "longitude", desc: "Random longitude" },
  // ── Business ──
  { type: "company", desc: "Random company name" },
  { type: "jobTitle", desc: "Random job title" },
  { type: "price", desc: "Random price 0.99–999.99" },
  { type: "percentage", desc: "Random 0–100%" },
  // ── Tech ──
  { type: "uuid", desc: "Random UUID v4" },
  { type: "id", desc: "Random numeric ID" },
  { type: "url", desc: "Random URL" },
  { type: "domain", desc: "Random domain name" },
  { type: "ip", desc: "Random IPv4 address" },
  { type: "macAddress", desc: "Random MAC address" },
  { type: "userAgent", desc: "Random User-Agent string" },
  { type: "mimeType", desc: "Random MIME type" },
  { type: "httpMethod", desc: "Random HTTP method" },
  { type: "statusCode", desc: "Random HTTP status code" },
  { type: "slug", desc: "Random URL slug" },
  { type: "semver", desc: "Random semver version" },
  // ── Date/Time ──
  { type: "date", desc: "Random ISO date (YYYY-MM-DD)" },
  { type: "datetime", desc: "Random ISO datetime" },
  { type: "timestamp", desc: "Random Unix timestamp" },
  // ── Finance ──
  { type: "creditCard", desc: "Random credit card number" },
  { type: "iban", desc: "Random IBAN" },
  // ── Content ──
  { type: "lorem", desc: "Random lorem ipsum word" },
  { type: "loremSentence", desc: "Random lorem sentence" },
  { type: "loremParagraph", desc: "Random lorem paragraph" },
  { type: "emoji", desc: "Random emoji" },
  // ── Encoding ──
  { type: "color", desc: "Random hex color" },
  { type: "hex", desc: "Random hex string" },
  { type: "base64", desc: "Random base64 string" },
];

export default function JsonTemplateGenerator() {
  const [template, setTemplate] = useState(EXAMPLE_TEMPLATE);
  const [count, setCount] = useState(5);
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [showHelp, setShowHelp] = useState(false);

  const generate = useCallback(() => {
    try {
      setError("");
      if (!template.trim()) {
        setError("Template cannot be empty");
        return;
      }
      const result = generateFromTemplate(template, Math.max(1, Math.min(100, count)));
      setOutput(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    }
  }, [template, count]);

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Entries</label>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
            className="h-9 w-20 rounded-md border border-border bg-input px-3 text-sm text-foreground"
          />
        </div>
        <button onClick={generate} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Generate
        </button>
        <button onClick={() => setTemplate(EXAMPLE_TEMPLATE)} className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent">
          Reset Example
        </button>
        <button onClick={() => setShowHelp(!showHelp)} className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent">
          {showHelp ? "Hide" : "Show"} Placeholders
        </button>
        {output && (
          <button onClick={() => navigator.clipboard.writeText(output)} className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent">
            Copy Output
          </button>
        )}
      </div>

      {/* Placeholder reference */}
      {showHelp && (
        <div className="rounded-lg border border-border bg-card p-3">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Available Placeholders</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3 lg:grid-cols-4">
            {HELP_ITEMS.map((item) => (
              <div key={item.type} className="flex items-baseline gap-2 text-sm">
                <code className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs text-primary">{"{{field:" + item.type + "}}"}</code>
                <span className="text-muted-foreground">{item.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Template input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">JSON Template</label>
        <textarea
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          className="h-64 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground"
          spellCheck={false}
          placeholder='{"id": "{{id:uuid}}", "name": "{{name:fullName}}"}'
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Output */}
      {output && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Generated Output</label>
          <pre className="h-80 overflow-auto rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}