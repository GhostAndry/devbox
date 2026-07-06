"use client";

import { useState, useCallback, useEffect, useRef } from "react";

export default function JwtDecoder() {
  const [input, setInput] = useState("");
  const [header, setHeader] = useState("");
  const [payload, setPayload] = useState("");
  const [signature, setSignature] = useState("");
  const [error, setError] = useState("");
  const [expiry, setExpiry] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const decode = useCallback(() => {
    if (!input.trim()) { setHeader(""); setPayload(""); setSignature(""); setError(""); setExpiry(null); return; }
    try {
      const parts = input.trim().split(".");
      if (parts.length < 2) throw new Error("Invalid JWT format (need header.payload.signature)");
      const decodeB64 = (str: string) => {
        const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
        return JSON.parse(atob(padded.replace(/-/g, "+").replace(/_/g, "/")));
      };
      setHeader(JSON.stringify(decodeB64(parts[0]), null, 2));
      const payloadObj = decodeB64(parts[1]);
      setPayload(JSON.stringify(payloadObj, null, 2));
      setSignature(parts[2] || "(none)");
      setError("");

      if (payloadObj.exp) {
        const expDate = new Date(payloadObj.exp * 1000);
        const now = new Date();
        const diff = expDate.getTime() - now.getTime();
        if (diff < 0) setExpiry(`⛔ Expired ${Math.abs(Math.round(diff / 1000 / 60))} min ago (${expDate.toLocaleString()})`);
        else if (diff < 3600000) setExpiry(`⚠️ Expires in ${Math.round(diff / 1000 / 60)} min (${expDate.toLocaleString()})`);
        else setExpiry(`✅ Expires ${expDate.toLocaleString()}`);
      } else {
        setExpiry(null);
      }
    } catch (e) {
      setError((e as Error).message);
      setHeader("");
      setPayload("");
      setSignature("");
      setExpiry(null);
    }
  }, [input]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(decode, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [decode]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">JWT Token</label>
        <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-32 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground" placeholder="Paste your JWT token here..." spellCheck={false} />
      </div>

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {expiry && <div className="rounded-lg border border-border bg-card p-3 text-sm">{expiry}</div>}

      {header && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Header</label>
            <button onClick={() => navigator.clipboard.writeText(header)} className="text-xs text-muted-foreground hover:text-foreground">Copy</button>
          </div>
          <pre className="overflow-auto rounded-lg border border-border bg-card p-3 font-mono text-sm">{header}</pre>
        </div>
      )}

      {payload && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Payload</label>
            <button onClick={() => navigator.clipboard.writeText(payload)} className="text-xs text-muted-foreground hover:text-foreground">Copy</button>
          </div>
          <pre className="overflow-auto rounded-lg border border-border bg-card p-3 font-mono text-sm">{payload}</pre>
        </div>
      )}

      {signature && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Signature</label>
          <code className="break-all rounded-lg border border-border bg-card p-3 font-mono text-xs text-muted-foreground">{signature}</code>
        </div>
      )}
    </div>
  );
}