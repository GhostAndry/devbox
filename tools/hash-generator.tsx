"use client";

import { useState, useCallback, useEffect, useRef } from "react";

async function hashText(algorithm: string, text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Pure JS MD5 implementation
function md5(str: string): string {
  function r(d: number, a: number, b: number, x: number, s: number, t: number) {
    return add(add(d, add(add(a, x), t)), b) << s | add(add(d, add(add(a, x), t)), b) >>> (32 - s);
  }
  function add(x: number, y: number) { return (x + y) & 0xFFFFFFFF; }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return r((a + q + x + t) | 0, a, b, x, s, t); }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }

  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) bytes.push(str.charCodeAt(i) & 0xFF);
  const len = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bitLen = len * 8;
  for (let i = 0; i < 4; i++) bytes.push((bitLen >>> (i * 8)) & 0xFF);
  for (let i = 0; i < 4; i++) bytes.push(0);

  let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
  for (let k = 0; k < bytes.length; k += 64) {
    const w = new Array(16);
    for (let i = 0; i < 16; i++) w[i] = bytes[k + i * 4] | (bytes[k + i * 4 + 1] << 8) | (bytes[k + i * 4 + 2] << 16) | (bytes[k + i * 4 + 3] << 24);
    let aa = a, bb = b, cc = c, dd = d;
    a = ff(a, b, c, d, w[0], 7, 0xD76AA478); d = ff(d, a, b, c, w[1], 12, 0xE8C7B756); c = ff(c, d, a, b, w[2], 17, 0x242070DB); b = ff(b, c, d, a, w[3], 22, 0xC1BDCEEE);
    a = ff(a, b, c, d, w[4], 7, 0xF57C0FAF); d = ff(d, a, b, c, w[5], 12, 0x4787C62A); c = ff(c, d, a, b, w[6], 17, 0xA8304613); b = ff(b, c, d, a, w[7], 22, 0xFD469501);
    a = ff(a, b, c, d, w[8], 7, 0x698098D8); d = ff(d, a, b, c, w[9], 12, 0x8B44F7AF); c = ff(c, d, a, b, w[10], 17, 0xFFFF5BB1); b = ff(b, c, d, a, w[11], 22, 0x895CD7BE);
    a = ff(a, b, c, d, w[12], 7, 0x6B901122); d = ff(d, a, b, c, w[13], 12, 0xFD987193); c = ff(c, d, a, b, w[14], 17, 0xA679438E); b = ff(b, c, d, a, w[15], 22, 0x49B40821);
    a = gg(a, b, c, d, w[1], 5, 0xF61E2562); d = gg(d, a, b, c, w[6], 9, 0xC040B340); c = gg(c, d, a, b, w[11], 14, 0x265E5A51); b = gg(b, c, d, a, w[0], 20, 0xE9B6C7AA);
    a = gg(a, b, c, d, w[5], 5, 0xD62F105D); d = gg(d, a, b, c, w[10], 9, 0x02441453); c = gg(c, d, a, b, w[15], 14, 0xD8A1E681); b = gg(b, c, d, a, w[4], 20, 0xE7D3FBC8);
    a = gg(a, b, c, d, w[9], 5, 0x21E1CDE6); d = gg(d, a, b, c, w[14], 9, 0xC33707D6); c = gg(c, d, a, b, w[3], 14, 0xF4D50D87); b = gg(b, c, d, a, w[8], 20, 0x455A14ED);
    a = gg(a, b, c, d, w[13], 5, 0xA9E3E905); d = gg(d, a, b, c, w[2], 9, 0xFCEFA3F8); c = gg(c, d, a, b, w[7], 14, 0x676F02D9); b = gg(b, c, d, a, w[12], 20, 0x8D2A4C8A);
    a = hh(a, b, c, d, w[5], 4, 0xFFFA3942); d = hh(d, a, b, c, w[8], 11, 0x8771F681); c = hh(c, d, a, b, w[11], 16, 0x6D9D6122); b = hh(b, c, d, a, w[14], 23, 0xFDE5380C);
    a = hh(a, b, c, d, w[1], 4, 0xA4BEEA44); d = hh(d, a, b, c, w[4], 11, 0x4BDECFA9); c = hh(c, d, a, b, w[7], 16, 0xF6BB4B60); b = hh(b, c, d, a, w[10], 23, 0xBEBFBC70);
    a = hh(a, b, c, d, w[13], 4, 0x289B7EC6); d = hh(d, a, b, c, w[0], 11, 0xEAA127FA); c = hh(c, d, a, b, w[3], 16, 0xD4EF3085); b = hh(b, c, d, a, w[6], 23, 0x04881D05);
    a = hh(a, b, c, d, w[9], 4, 0xD9D4D039); d = hh(d, a, b, c, w[12], 11, 0xE6DB99E5); c = hh(c, d, a, b, w[15], 16, 0x1FA27CF8); b = hh(b, c, d, a, w[2], 23, 0xC4AC5665);
    a = ii(a, b, c, d, w[0], 6, 0xF4292244); d = ii(d, a, b, c, w[7], 10, 0x432AFF97); c = ii(c, d, a, b, w[14], 15, 0xAB9423A7); b = ii(b, c, d, a, w[5], 21, 0xFC93A039);
    a = ii(a, b, c, d, w[12], 6, 0x655B59C3); d = ii(d, a, b, c, w[3], 10, 0x8F0CCC92); c = ii(c, d, a, b, w[10], 15, 0xFFEFF47D); b = ii(b, c, d, a, w[1], 21, 0x85845DD1);
    a = ii(a, b, c, d, w[8], 6, 0x6FA87E4F); d = ii(d, a, b, c, w[15], 10, 0xFE2CE6E0); c = ii(c, d, a, b, w[6], 15, 0xA3014314); b = ii(b, c, d, a, w[13], 21, 0x4E0811A1);
    a = ii(a, b, c, d, w[4], 6, 0xF7537E82); d = ii(d, a, b, c, w[11], 10, 0xBD3AF235); c = ii(c, d, a, b, w[2], 15, 0x2AD7D2BB); b = ii(b, c, d, a, w[9], 21, 0xEB86D391);
    a = add(a, aa); b = add(b, bb); c = add(c, cc); d = add(d, dd);
  }
  const toHex = (n: number) => { const s = (n >>> 0).toString(16); return "0000000".slice(s.length) + s; };
  return toHex(a) + toHex(b) + toHex(c) + toHex(d);
}

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [hmacKey, setHmacKey] = useState("");
  const [hmacResult, setHmacResult] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const generate = useCallback(async () => {
    if (!input) { setHashes({}); return; }
    const results: Record<string, string> = {};
    results["MD5"] = md5(input);
    for (const algo of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]) {
      results[algo] = await hashText(algo, input);
    }
    setHashes(results);
  }, [input]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(generate, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [generate]);

  const generateHmac = useCallback(async () => {
    if (!hmacKey || !input) return;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(hmacKey);
    const key = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(input));
    const hashArray = Array.from(new Uint8Array(signature));
    setHmacResult(hashArray.map((b) => b.toString(16).padStart(2, "0")).join(""));
  }, [input, hmacKey]);

  const handleFile = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const buffer = await file.arrayBuffer();
    const results: Record<string, string> = {};
    results["MD5"] = md5(new TextDecoder().decode(buffer));
    for (const algo of ["SHA-1", "SHA-256", "SHA-384", "SHA-512"]) {
      const h = await crypto.subtle.digest(algo, buffer);
      results[algo] = Array.from(new Uint8Array(h)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    setHashes(results);
    // Release the file reference — everything is now in memory
    e.target.value = "";
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-muted-foreground">Input text</label>
          <label className="flex cursor-pointer items-center text-xs text-muted-foreground hover:text-foreground">
            📁 Hash file
            <input type="file" onChange={handleFile} className="hidden" />
          </label>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="h-32 rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground"
          placeholder="Enter text to hash..."
          spellCheck={false}
        />
      </div>

      {Object.keys(hashes).length > 0 && (
        <div className="flex flex-col gap-2">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="group flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{algo}</span>
                <code className="break-all font-mono text-sm">{hash}</code>
              </div>
              <button onClick={() => navigator.clipboard.writeText(hash)} className="shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border p-4">
        <h3 className="mb-3 text-sm font-semibold">HMAC-SHA256</h3>
        <div className="flex flex-col gap-3">
          <input type="text" value={hmacKey} onChange={(e) => setHmacKey(e.target.value)} placeholder="Secret key" className="h-9 rounded-md border border-border bg-input px-3 text-sm text-foreground" />
          <button onClick={generateHmac} className="h-9 w-fit rounded-md border border-border bg-card px-4 text-sm font-medium hover:bg-accent">Generate HMAC</button>
          {hmacResult && (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
              <code className="break-all font-mono text-sm">{hmacResult}</code>
              <button onClick={() => navigator.clipboard.writeText(hmacResult)} className="shrink-0 text-xs text-muted-foreground hover:text-foreground">Copy</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}