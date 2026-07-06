import Link from "next/link";
import { categories, getToolsByCategory, iconMap } from "@/lib/tools";
import { Wrench, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col px-8 py-12">
      {/* ── Hero ─────────────────────────────────────── */}
      <div className="mb-16 flex flex-col items-center gap-5 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Wrench className="h-10 w-10 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            DevBox
          </h1>
          <p className="max-w-lg text-lg text-muted-foreground">
            A fast, offline-first developer toolbox that lives in your browser.
            Pick a tool from the sidebar to get started.
          </p>
        </div>
      </div>

      {/* ── Tool Grid ─────────────────────────────────── */}
      <div className="grid w-full max-w-5xl grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => {
          const CatIcon = iconMap[cat.iconName];
          const catTools = getToolsByCategory(cat.id);
          if (catTools.length === 0) return null;

          return (
            <div
              key={cat.id}
              className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <CatIcon className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {cat.label}
                </h2>
              </div>
              <ul className="flex flex-col gap-1">
                {catTools.map((tool) => (
                  <li key={tool.slug}>
                    <Link
                      href={`/${tool.slug}`}
                      className="group/link flex items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <span>{tool.name}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover/link:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
