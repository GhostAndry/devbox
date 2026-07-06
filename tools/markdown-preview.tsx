"use client";

import { useState, useMemo } from "react";

export default function MarkdownPreview() {
  const [input, setInput] = useState("# Hello World\n\nThis is **markdown** preview.\n\n- Item 1\n- Item 2\n- Item 3\n\n```js\nconsole.log('hello');\n```\n\n> A blockquote\n\n| Col A | Col B |\n|-------|-------|\n| a     | b     |\n");

  const html = useMemo(() => renderMarkdown(input), [input]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">Markdown</label>
            <span className="text-[10px] text-muted-foreground">{input.length.toLocaleString()} chars</span>
          </div>
          <textarea value={input} onChange={(e) => setInput(e.target.value)} className="h-[600px] rounded-lg border border-border bg-input p-3 font-mono text-sm text-foreground" spellCheck={false} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Preview</label>
          <div className="h-[600px] overflow-auto rounded-lg border border-border bg-card p-4 text-sm text-foreground prose prose-invert max-w-none [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-1 [&_code]:rounded [&_code]:bg-primary/10 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_pre]:rounded-lg [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:mb-3 [&_pre]:overflow-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_blockquote]:mb-2 [&_table]:w-full [&_table]:mb-3 [&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-1 [&_th]:text-left [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-1 [&_hr]:border-border [&_hr]:my-4 [&_a]:text-primary [&_a]:underline [&_img]:max-w-full [&_img]:rounded" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </div>
    </div>
  );
}

function renderMarkdown(md: string): string {
  // Code blocks (fenced)
  let html = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
  });

  // Inline code
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headers
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Images
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Horizontal rules
  html = html.replace(/^(---|\*\*\*|___)$/gm, "<hr />");

  // Blockquotes
  html = html.replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>");

  // Tables
  html = html.replace(/((?:^\|.+\|$\n?)+)/gm, (table: string) => {
    const rows = table.trim().split("\n").filter((r) => !r.match(/^\|[\s\-:|]+\|$/));
    if (rows.length === 0) return table;
    const cells = rows.map((row) =>
      row.split("|").filter(Boolean).map((c) => c.trim())
    );
    const isHeader = cells.length > 0;
    let result = "<table>";
    cells.forEach((row, i) => {
      result += "<tr>";
      row.forEach((cell) => {
        result += i === 0 ? `<th>${cell}</th>` : `<td>${cell}</td>`;
      });
      result += "</tr>";
    });
    result += "</table>";
    return result;
  });

  // Unordered lists
  html = html.replace(/^[\-\*] (.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");

  // Paragraphs
  html = html.replace(/\n{2,}/g, "</p><p>");
  html = html.replace(/\n/g, "<br />");

  return `<p>${html}</p>`;
}