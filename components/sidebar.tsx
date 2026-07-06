"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  categories,
  getToolsByCategory,
  iconMap,
} from "@/lib/tools";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronRight, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const activeSlug = pathname.startsWith("/") ? pathname.slice(1) : pathname;

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-sidebar transition-all duration-200 overflow-hidden",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex h-14 items-center gap-2.5 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Wrench className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <span className="text-base font-semibold tracking-tight text-foreground">
            DevBox
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      <div className="mx-3 h-px bg-border" />

      {/* ── Navigation ─────────────────────────────────── */}
      <ScrollArea className="flex-1 overflow-hidden px-2 py-3">
        <nav className="flex flex-col gap-1">
          {categories.map((cat) => {
            const catTools = getToolsByCategory(cat.id);
            if (catTools.length === 0) return null;

            const CatIcon = iconMap[cat.iconName];

            return (
              <div key={cat.id} className="mb-3">
                {/* Category header */}
                {collapsed ? (
                  <Tooltip>
                    <TooltipTrigger className="flex w-full items-center justify-center rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      <CatIcon className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{cat.label}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <div className="flex items-center gap-2 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    <CatIcon className="h-3 w-3" />
                    {cat.label}
                  </div>
                )}

                {/* Tool links */}
                {catTools.map((tool) => {
                  const ToolIcon = iconMap[tool.iconName];
                  const isActive = activeSlug === tool.slug;

                  if (collapsed) {
                    return (
                      <Tooltip key={tool.slug}>
                        <TooltipTrigger className={cn(
                          "flex w-full items-center justify-center rounded-lg px-2 py-1.5 text-sm transition-all",
                          isActive
                            ? "bg-primary/15 text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}>
                          <Link href={`/${tool.slug}`} className="flex items-center justify-center">
                            <ToolIcon className="h-4 w-4 shrink-0" />
                          </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p className="font-medium">{tool.name}</p>
                          <p className="text-xs text-muted-foreground">{tool.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <Link
                      key={tool.slug}
                      href={`/${tool.slug}`}
                      className={cn(
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-all",
                        isActive
                          ? "bg-primary/15 text-primary font-medium"
                          : "text-muted-foreground hover:bg-accent hover:text-foreground"
                      )}
                    >
                      <ToolIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}