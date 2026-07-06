"use client";

import { useState, useCallback } from "react";

const firstNames = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda", "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica", "Thomas", "Sarah", "Charles", "Karen"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const domains = ["gmail.com", "yahoo.com", "outlook.com", "example.com", "mail.com", "proton.me", "icloud.com"];
const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "London", "Paris", "Berlin", "Tokyo", "Sydney"];
const countries = ["USA", "UK", "Canada", "Germany", "France", "Japan", "Australia", "Brazil", "India", "Italy"];
const companies = ["Acme Corp", "Globex", "Initech", "Umbrella", "Stark Industries", "Wayne Enterprises", "Cyberdyne", "Wonka Industries"];
const jobTitles = ["Software Engineer", "Product Manager", "Designer", "Data Scientist", "DevOps Engineer", "CTO", "Marketing Lead", "Sales Director"];

type Template = "users" | "products" | "posts" | "custom";

function generateRecord(template: Template): Record<string, unknown> {
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const int = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const float = (min: number, max: number) => +(Math.random() * (max - min) + min).toFixed(2);

  switch (template) {
    case "users":
      return {
        id: int(1, 99999),
        firstName: pick(firstNames),
        lastName: pick(lastNames),
        email: `${pick(firstNames).toLowerCase()}.${pick(lastNames).toLowerCase()}@${pick(domains)}`,
        age: int(18, 75),
        city: pick(cities),
        country: pick(countries),
        active: Math.random() > 0.2,
        createdAt: new Date(Date.now() - int(0, 365 * 24 * 60 * 60 * 1000)).toISOString(),
      };
    case "products":
      return {
        id: int(1, 99999),
        name: `${pick(["Widget", "Gadget", "Doohickey", "Thingamajig", "Contraption"])} ${pick(["Pro", "Max", "Lite", "X", "Ultra"])}`,
        price: float(9.99, 999.99),
        category: pick(["Electronics", "Clothing", "Books", "Home", "Sports"]),
        inStock: Math.random() > 0.3,
        rating: float(1, 5),
        sku: `SKU-${int(10000, 99999)}`,
      };
    case "posts":
      return {
        id: int(1, 99999),
        title: pick(["How to Build Great Software", "10 Tips for Productivity", "The Future of AI", "Understanding TypeScript", "A Guide to Modern CSS"]),
        author: `${pick(firstNames)} ${pick(lastNames)}`,
        body: Array.from({ length: int(3, 6) }, () => pick(["Lorem ipsum dolor sit amet.", "Consectetur adipiscing elit.", "Sed do eiusmod tempor incididunt.", "Ut labore et dolore magna aliqua.", "Ut enim ad minim veniam."])).join(" "),
        tags: Array.from({ length: int(1, 4) }, () => pick(["tech", "programming", "design", "web", "mobile", "ai", "data"])),
        publishedAt: new Date(Date.now() - int(0, 365 * 24 * 60 * 60 * 1000)).toISOString(),
      };
    default:
      return {};
  }
}

export default function FakeJson() {
  const [count, setCount] = useState(5);
  const [template, setTemplate] = useState<Template>("users");
  const [output, setOutput] = useState("");

  const generate = useCallback(() => {
    const data = Array.from({ length: count }, () => generateRecord(template));
    setOutput(JSON.stringify(data, null, 2));
  }, [count, template]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Template</label>
          <select value={template} onChange={(e) => setTemplate(e.target.value as Template)} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
            <option value="users">Users</option>
            <option value="products">Products</option>
            <option value="posts">Blog Posts</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Records</label>
          <input type="number" min={1} max={100} value={count} onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))} className="h-9 w-20 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        </div>
        <button onClick={generate} className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">Generate</button>
        {output && <button onClick={() => navigator.clipboard.writeText(output)} className="h-9 rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent">Copy</button>}
      </div>
      {output && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Output ({count} records, {output.length.toLocaleString()} chars)</span>
            <button onClick={() => { const blob = new Blob([output], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${template}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 100); }} className="text-xs text-muted-foreground hover:text-foreground">Download</button>
          </div>
          <pre className="h-96 overflow-auto rounded-lg border border-border bg-card p-3 font-mono text-sm text-foreground">{output}</pre>
        </div>
      )}
    </div>
  );
}