"use client";

import { useState } from "react";

const STATUS_CODES: Record<number, { phrase: string; description: string }> = {
  100: { phrase: "Continue", description: "The server has received the request headers and the client should proceed to send the request body." },
  101: { phrase: "Switching Protocols", description: "The server is switching protocols as requested by the client." },
  102: { phrase: "Processing", description: "The server is processing the request but no response is available yet." },
  103: { phrase: "Early Hints", description: "Used to return some response headers before final HTTP message." },
  200: { phrase: "OK", description: "The request has succeeded." },
  201: { phrase: "Created", description: "The request has been fulfilled and a new resource has been created." },
  202: { phrase: "Accepted", description: "The request has been accepted for processing, but processing is not complete." },
  204: { phrase: "No Content", description: "The server successfully processed the request but is not returning any content." },
  206: { phrase: "Partial Content", description: "The server is delivering only part of the resource due to a range header." },
  301: { phrase: "Moved Permanently", description: "The resource has been permanently moved to a new URI." },
  302: { phrase: "Found", description: "The resource has been temporarily moved to a different URI." },
  304: { phrase: "Not Modified", description: "The resource has not been modified since the last request." },
  307: { phrase: "Temporary Redirect", description: "The resource is temporarily at a different URI, method must not change." },
  308: { phrase: "Permanent Redirect", description: "The resource is permanently at a different URI, method must not change." },
  400: { phrase: "Bad Request", description: "The server cannot process the request due to client error." },
  401: { phrase: "Unauthorized", description: "Authentication is required to access the resource." },
  403: { phrase: "Forbidden", description: "The client does not have permission to access the resource." },
  404: { phrase: "Not Found", description: "The requested resource could not be found." },
  405: { phrase: "Method Not Allowed", description: "The request method is not supported for the resource." },
  408: { phrase: "Request Timeout", description: "The server timed out waiting for the request." },
  409: { phrase: "Conflict", description: "The request conflicts with the current state of the server." },
  410: { phrase: "Gone", description: "The resource is no longer available and will not be available again." },
  418: { phrase: "I'm a teapot", description: "The server refuses to brew coffee because it is a teapot. (RFC 2324)" },
  422: { phrase: "Unprocessable Entity", description: "The request was well-formed but contains semantic errors." },
  429: { phrase: "Too Many Requests", description: "The client has sent too many requests in a given amount of time." },
  500: { phrase: "Internal Server Error", description: "The server encountered an unexpected condition." },
  502: { phrase: "Bad Gateway", description: "The server received an invalid response from an upstream server." },
  503: { phrase: "Service Unavailable", description: "The server is not ready to handle the request." },
  504: { phrase: "Gateway Timeout", description: "The server did not receive a timely response from an upstream server." },
};

const CATEGORIES = ["All", "Informational (1xx)", "Success (2xx)", "Redirection (3xx)", "Client Error (4xx)", "Server Error (5xx)"];

function getCategory(code: number): string {
  if (code >= 100 && code < 200) return "Informational (1xx)";
  if (code >= 200 && code < 300) return "Success (2xx)";
  if (code >= 300 && code < 400) return "Redirection (3xx)";
  if (code >= 400 && code < 500) return "Client Error (4xx)";
  return "Server Error (5xx)";
}

function getCategoryColor(code: number): string {
  if (code >= 100 && code < 200) return "bg-blue-500/10 text-blue-400";
  if (code >= 200 && code < 300) return "bg-green-500/10 text-green-400";
  if (code >= 300 && code < 400) return "bg-yellow-500/10 text-yellow-400";
  if (code >= 400 && code < 500) return "bg-orange-500/10 text-orange-400";
  return "bg-red-500/10 text-red-400";
}

export default function HttpStatusCodeExplorer() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = Object.entries(STATUS_CODES).filter(([code, { phrase, description }]) => {
    const matchesSearch = `${code} ${phrase} ${description}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === "All" || getCategory(Number(code)) === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search status codes..." className="h-9 flex-1 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground">
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map(([code, { phrase, description }]) => (
          <div key={code} className="group flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
            <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${getCategoryColor(Number(code))}`}>{code}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{phrase}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(code)} className="shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
          </div>
        ))}
      </div>
    </div>
  );
}