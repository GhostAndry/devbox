"use client";

import { type ToolDef, iconMap } from "@/lib/tools";
import { dynamicRegistry } from "@/tools/registry";

interface ToolPageProps {
  tool: ToolDef;
}

export function ToolPage({ tool }: ToolPageProps) {
  const Component = dynamicRegistry[tool.slug];
  const ToolIcon = iconMap[tool.iconName];

  if (!Component) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="rounded-xl border border-dashed border-border bg-card px-8 py-12 text-center">
          <h2 className="mb-2 text-xl font-semibold">{tool.name}</h2>
          <p className="text-muted-foreground">
            This tool is not yet implemented. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 sm:h-10 sm:w-10">
          <ToolIcon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{tool.name}</h1>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm line-clamp-2">
            {tool.description}
          </p>
        </div>
      </div>
      <Component />
    </div>
  );
}