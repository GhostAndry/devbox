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
    <div className="flex flex-1 flex-col px-8 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <ToolIcon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{tool.name}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {tool.description}
          </p>
        </div>
      </div>
      <Component />
    </div>
  );
}