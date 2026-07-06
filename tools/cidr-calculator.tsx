"use client";

import { useState, useMemo } from "react";

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  return (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3];
}

function intToIp(n: number): string {
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

function getIpClass(ip: string): string {
  const first = parseInt(ip.split(".")[0]);
  if (first < 128) return "A";
  if (first < 192) return "B";
  if (first < 224) return "C";
  if (first < 240) return "D (Multicast)";
  return "E (Reserved)";
}

function isPrivate(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  return false;
}

export default function CidrCalculator() {
  const [input, setInput] = useState("192.168.1.0/24");

  const result = useMemo(() => {
    try {
      const [ipStr, prefixStr] = input.split("/");
      const prefix = parseInt(prefixStr);
      if (isNaN(prefix) || prefix < 0 || prefix > 32) throw new Error("Invalid prefix");

      const parts = ipStr.split(".").map(Number);
      if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) throw new Error("Invalid IP");

      const ip = ipToInt(ipStr);
      const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
      const network = (ip & mask) >>> 0;
      const broadcast = (network | ~mask) >>> 0;
      const firstHost = prefix >= 31 ? network : (network + 1) >>> 0;
      const lastHost = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;
      const totalHosts = Math.pow(2, 32 - prefix);
      const usableHosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.max(0, totalHosts - 2);

      return {
        error: "",
        data: {
          "Network Address": intToIp(network),
          "Broadcast Address": intToIp(broadcast),
          "Subnet Mask": intToIp(mask),
          "Wildcard Mask": intToIp(~mask >>> 0),
          "First Host": intToIp(firstHost),
          "Last Host": intToIp(lastHost),
          "Total Hosts": totalHosts.toLocaleString(),
          "Usable Hosts": usableHosts.toLocaleString(),
          "CIDR Prefix": `/${prefix}`,
          "IP Class": getIpClass(ipStr),
          "Private": isPrivate(ipStr) ? "Yes" : "No",
          "Binary Subnet Mask": intToIp(mask).split(".").map((o) => parseInt(o).toString(2).padStart(8, "0")).join("."),
        },
      };
    } catch (e) {
      return { error: (e as Error).message, data: null };
    }
  }, [input]);

  const presets = ["192.168.1.0/24", "10.0.0.0/8", "172.16.0.0/12", "10.0.0.0/16", "192.168.0.0/23", "10.0.0.0/28"];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">CIDR Notation</label>
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} className="h-9 w-48 rounded-md border border-border bg-input px-3 font-mono text-sm text-foreground" placeholder="192.168.1.0/24" />
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {presets.map((p) => (
          <button key={p} onClick={() => setInput(p)} className={`rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors ${input === p ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-foreground hover:border-primary/50"}`}>
            {p}
          </button>
        ))}
      </div>

      {result.error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{result.error}</div>}

      {result.data && (
        <div className="flex flex-col gap-2">
          {Object.entries(result.data).map(([label, value]) => (
            <div key={label} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
                <p className="font-mono text-sm truncate">{value}</p>
              </div>
              <button onClick={() => navigator.clipboard.writeText(value)} className="ml-2 shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}