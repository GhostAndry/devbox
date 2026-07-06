import { tools, getToolBySlug } from "@/lib/tools";
import { notFound } from "next/navigation";
import { ToolPage } from "./tool-page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return tools.map((tool) => ({
    slug: tool.slug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return { title: "Not Found" };
  return {
    title: `${tool.name} — DevBox`,
    description: tool.description,
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  return <ToolPage tool={tool} />;
}