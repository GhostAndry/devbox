"use client";

import { useState, useMemo } from "react";

type Perms = { read: boolean; write: boolean; execute: boolean };

export default function ChmodCalculator() {
  const [owner, setOwner] = useState<Perms>({ read: true, write: true, execute: false });
  const [group, setGroup] = useState<Perms>({ read: true, write: false, execute: false });
  const [other, setOther] = useState<Perms>({ read: true, write: false, execute: false });
  const [setuid, setSetuid] = useState(false);
  const [setgid, setSetgid] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [octalInput, setOctalInput] = useState("");

  const toOctal = (perms: Perms) => (perms.read ? 4 : 0) + (perms.write ? 2 : 0) + (perms.execute ? 1 : 0);

  const special = (setuid ? 4 : 0) + (setgid ? 2 : 0) + (sticky ? 1 : 0);
  const octal = `${special || ""}${toOctal(owner)}${toOctal(group)}${toOctal(other)}`.replace(/^0+/, "") || "0";

  const toSymbolic = (perms: Perms) => `${perms.read ? "r" : "-"}${perms.write ? "w" : "-"}${perms.execute ? "x" : "-"}`;
  const symbolic = `${toSymbolic(owner)}${toSymbolic(group)}${toSymbolic(other)}`;

  const command = `chmod ${octal} file.txt`;

  const applyOctal = (val: string) => {
    setOctalInput(val);
    const cleaned = val.replace(/[^0-7]/g, "");
    if (cleaned.length === 3) {
      const [o, g, ot] = cleaned.split("").map(Number);
      setOwner({ read: !!(o & 4), write: !!(o & 2), execute: !!(o & 1) });
      setGroup({ read: !!(g & 4), write: !!(g & 2), execute: !!(g & 1) });
      setOther({ read: !!(ot & 4), write: !!(ot & 2), execute: !!(ot & 1) });
      setSetuid(false); setSetgid(false); setSticky(false);
    } else if (cleaned.length === 4) {
      const [s, o, g, ot] = cleaned.split("").map(Number);
      setOwner({ read: !!(o & 4), write: !!(o & 2), execute: !!(o & 1) });
      setGroup({ read: !!(g & 4), write: !!(g & 2), execute: !!(g & 1) });
      setOther({ read: !!(ot & 4), write: !!(ot & 2), execute: !!(ot & 1) });
      setSetuid(!!(s & 4)); setSetgid(!!(s & 2)); setSticky(!!(s & 1));
    }
  };

  const PermToggle = ({ label, perms, setPerms }: { label: string; perms: Perms; setPerms: (p: Perms) => void }) => (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold">{label}</span>
      {(["read", "write", "execute"] as const).map((perm) => (
        <label key={perm} className="flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={perms[perm]} onChange={(e) => setPerms({ ...perms, [perm]: e.target.checked })} className="h-4 w-4 rounded border-border" />
          {perm.charAt(0).toUpperCase() + perm.slice(1)} ({perm === "read" ? "r" : perm === "write" ? "w" : "x"})
        </label>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted-foreground">Octal input (e.g. 755, 644, 1777)</label>
        <input
          type="text"
          value={octalInput}
          onChange={(e) => applyOctal(e.target.value)}
          placeholder="e.g. 755"
          className="h-9 w-32 rounded-md border border-border bg-input px-3 font-mono text-sm text-foreground"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <PermToggle label="Owner (u)" perms={owner} setPerms={setOwner} />
        <PermToggle label="Group (g)" perms={group} setPerms={setGroup} />
        <PermToggle label="Other (o)" perms={other} setPerms={setOther} />
      </div>

      <div className="flex flex-wrap gap-4">
        {[
          { label: "Setuid (4)", value: setuid, set: setSetuid },
          { label: "Setgid (2)", value: setgid, set: setSetgid },
          { label: "Sticky (1)", value: sticky, set: setSticky },
        ].map(({ label, value, set }) => (
          <label key={label} className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={value} onChange={(e) => set(e.target.checked)} className="h-4 w-4 rounded border-border" />
            {label}
          </label>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {[
          { label: "Octal", value: octal },
          { label: "Symbolic", value: symbolic },
          { label: "Command", value: command },
        ].map(({ label, value }) => (
          <div key={label} className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
              <p className="font-mono text-2xl font-bold">{value}</p>
            </div>
            <button onClick={() => navigator.clipboard.writeText(value)} className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground">Copy</button>
          </div>
        ))}
      </div>
    </div>
  );
}