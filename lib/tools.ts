import {
  Fingerprint,
  FileJson,
  Globe,
  Terminal,
  Container,
  Code2,
  Network,
  Image,
  ArrowLeftRight,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export interface ToolDef {
  slug: string;
  name: string;
  description: string;
  iconName: string;
  category: ToolCategory;
}

export type ToolCategory =
  | "generators"
  | "data"
  | "web"
  | "linux"
  | "docker"
  | "developer"
  | "networking"
  | "images"
  | "converters"
  | "cheatsheets";

export interface ToolCategoryDef {
  id: ToolCategory;
  label: string;
  iconName: string;
}

export const iconMap: Record<string, LucideIcon> = {
  Fingerprint,
  FileJson,
  Globe,
  Terminal,
  Container,
  Code2,
  Network,
  Image: Image,
  ArrowLeftRight,
  BookOpen,
};

export const categories: ToolCategoryDef[] = [
  { id: "generators", label: "Generators", iconName: "Fingerprint" },
  { id: "data", label: "Data Tools", iconName: "FileJson" },
  { id: "web", label: "Web Tools", iconName: "Globe" },
  { id: "linux", label: "Linux", iconName: "Terminal" },
  { id: "docker", label: "Docker", iconName: "Container" },
  { id: "developer", label: "Developer Tools", iconName: "Code2" },
  { id: "networking", label: "Networking", iconName: "Network" },
  { id: "images", label: "Images", iconName: "Image" },
  { id: "converters", label: "Converters", iconName: "ArrowLeftRight" },
  { id: "cheatsheets", label: "Cheatsheets", iconName: "BookOpen" },
];

export const tools: ToolDef[] = [
  // ── Generators ──────────────────────────────────────────
  { slug: "uuid-generator", name: "UUID Generator", description: "Generate UUID v4 and v7", iconName: "Fingerprint", category: "generators" },
  { slug: "nanoid-generator", name: "NanoID Generator", description: "Generate unique NanoIDs", iconName: "Fingerprint", category: "generators" },
  { slug: "password-generator", name: "Password Generator", description: "Generate secure passwords", iconName: "Fingerprint", category: "generators" },
  { slug: "token-generator", name: "Secure Token Generator", description: "Generate random tokens and API secrets", iconName: "Fingerprint", category: "generators" },
  { slug: "lorem-ipsum", name: "Lorem Ipsum Generator", description: "Generate placeholder text", iconName: "Fingerprint", category: "generators" },
  { slug: "fake-json", name: "Fake JSON Generator", description: "Generate mock JSON data", iconName: "Fingerprint", category: "generators" },
  { slug: "json-template-generator", name: "JSON Template Generator", description: "Generate data from a JSON template with placeholders", iconName: "FileJson", category: "generators" },

  // ── Data Tools ───────────────────────────────────────────
  { slug: "json-formatter", name: "JSON Formatter", description: "Format and beautify JSON", iconName: "FileJson", category: "data" },
  { slug: "json-to-yaml", name: "JSON → YAML", description: "Convert JSON to YAML", iconName: "FileJson", category: "data" },
  { slug: "base64", name: "Base64 Encode / Decode", description: "Encode and decode Base64 strings", iconName: "FileJson", category: "data" },

  // ── Web Tools ────────────────────────────────────────────
  { slug: "qr-code", name: "QR Code Generator", description: "Generate QR codes from text or URLs", iconName: "Globe", category: "web" },
  { slug: "url-encoder", name: "URL Encoder / Decoder", description: "Encode and decode URLs", iconName: "Globe", category: "web" },
  { slug: "jwt-decoder", name: "JWT Decoder", description: "Decode and inspect JWT tokens", iconName: "Globe", category: "web" },
  { slug: "html-escape", name: "HTML Escape / Unescape", description: "Escape and unescape HTML entities", iconName: "Globe", category: "web" },
  { slug: "url-parser", name: "URL Parser", description: "Parse and inspect URLs", iconName: "Globe", category: "web" },
  { slug: "http-status", name: "HTTP Status Explorer", description: "Explore HTTP status codes", iconName: "Globe", category: "web" },
  { slug: "mime-lookup", name: "MIME Type Lookup", description: "Look up MIME types", iconName: "Globe", category: "web" },

  // ── Linux ────────────────────────────────────────────────
  { slug: "chmod-calculator", name: "chmod Calculator", description: "Calculate file permissions", iconName: "Terminal", category: "linux" },
  { slug: "cron-generator", name: "Cron Expression Generator", description: "Build and explain cron expressions", iconName: "Terminal", category: "linux" },

  // ── Docker ───────────────────────────────────────────────
  { slug: "docker-compose", name: "Docker Compose Generator", description: "Generate docker-compose.yml files", iconName: "Container", category: "docker" },
  { slug: "dockerfile-creator", name: "Dockerfile Creator", description: "Build custom Dockerfiles with templates", iconName: "Container", category: "docker" },

  // ── Developer Tools ──────────────────────────────────────
  { slug: "regex-playground", name: "Regex Playground", description: "Test and debug regular expressions", iconName: "Code2", category: "developer" },
  { slug: "markdown-preview", name: "Markdown Preview", description: "Preview Markdown in real time", iconName: "Code2", category: "developer" },
  { slug: "text-diff", name: "Text Diff Viewer", description: "Compare two texts side by side", iconName: "Code2", category: "developer" },
  { slug: "hash-generator", name: "Hash Generator", description: "Generate MD5, SHA-1, SHA-256, SHA-512 hashes", iconName: "Code2", category: "developer" },
  { slug: "case-converter", name: "Case Converter", description: "Convert text between cases", iconName: "Code2", category: "developer" },

  // ── Networking ───────────────────────────────────────────
  { slug: "cidr-calculator", name: "CIDR Calculator", description: "Calculate CIDR subnets", iconName: "Network", category: "networking" },

  // ── Images ───────────────────────────────────────────────
  { slug: "color-picker", name: "Color Picker", description: "Pick and convert colors", iconName: "Image", category: "images" },
  { slug: "css-gradient", name: "CSS Gradient Generator", description: "Create CSS gradients visually", iconName: "Image", category: "images" },

  // ── Converters ──────────────────────────────────────────
  { slug: "timestamp-converter", name: "Unix Timestamp Converter", description: "Convert between Unix timestamps and dates", iconName: "ArrowLeftRight", category: "converters" },
  { slug: "number-base-converter", name: "Number Base Converter", description: "Convert numbers between bases", iconName: "ArrowLeftRight", category: "converters" },

  // ── Cheatsheets ──────────────────────────────────────────
  { slug: "git-cheatsheet", name: "Git Cheatsheet", description: "Common Git commands", iconName: "BookOpen", category: "cheatsheets" },
];

export function getToolsByCategory(category: ToolCategory): ToolDef[] {
  return tools.filter((t) => t.category === category);
}

export function getToolBySlug(slug: string): ToolDef | undefined {
  return tools.find((t) => t.slug === slug);
}

export function getAllSlugs(): string[] {
  return tools.map((t) => t.slug);
}