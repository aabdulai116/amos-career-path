import { Fragment, type ReactNode } from "react";
import { parseMarkdown, type Block, type Inline } from "@/lib/markdown";

/**
 * Renders the note subset as React elements. Nothing here builds an HTML
 * string, so a note can never inject markup, and hrefs have already been
 * filtered to safe schemes by the parser.
 */

const renderInline = (nodes: Inline[]): ReactNode =>
  nodes.map((node, index) => {
    const key = `${node.type}-${index}`;
    switch (node.type) {
      case "text":
        return <Fragment key={key}>{node.value}</Fragment>;
      case "strong":
        return <strong key={key}>{renderInline(node.children)}</strong>;
      case "em":
        return <em key={key}>{renderInline(node.children)}</em>;
      case "code":
        return (
          <code
            key={key}
            className="rounded bg-[var(--background)] px-1 py-0.5 font-mono text-[0.9em]"
          >
            {node.value}
          </code>
        );
      case "link":
        return (
          <a
            key={key}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] underline underline-offset-2"
          >
            {renderInline(node.children)}
          </a>
        );
    }
  });

const renderBlock = (block: Block, index: number): ReactNode => {
  const key = `${block.type}-${index}`;
  switch (block.type) {
    case "heading": {
      const className =
        block.level === 1
          ? "mt-3 text-base font-semibold first:mt-0"
          : block.level === 2
            ? "mt-3 text-sm font-semibold first:mt-0"
            : "mt-3 text-xs font-semibold tracking-wide uppercase text-[var(--muted)] first:mt-0";
      if (block.level === 1) {
        return <h3 key={key} className={className}>{renderInline(block.children)}</h3>;
      }
      if (block.level === 2) {
        return <h4 key={key} className={className}>{renderInline(block.children)}</h4>;
      }
      return <h5 key={key} className={className}>{renderInline(block.children)}</h5>;
    }
    case "paragraph":
      return (
        <p key={key} className="mt-2 leading-relaxed first:mt-0">
          {renderInline(block.children)}
        </p>
      );
    case "list": {
      const items = block.items.map((item, i) => (
        <li key={i} className="ml-4 list-outside">
          {renderInline(item)}
        </li>
      ));
      return block.ordered ? (
        <ol key={key} className="mt-2 list-decimal space-y-0.5 first:mt-0">
          {items}
        </ol>
      ) : (
        <ul key={key} className="mt-2 list-disc space-y-0.5 first:mt-0">
          {items}
        </ul>
      );
    }
    case "code":
      return (
        <pre
          key={key}
          className="mt-2 overflow-x-auto rounded-md bg-[var(--background)] p-2.5 font-mono text-[11px] leading-relaxed first:mt-0"
        >
          <code>{block.value}</code>
        </pre>
      );
    case "quote":
      return (
        <blockquote
          key={key}
          className="mt-2 border-l-2 border-[var(--border)] pl-3 text-[var(--muted)] italic first:mt-0"
        >
          {renderInline(block.children)}
        </blockquote>
      );
    case "rule":
      return <hr key={key} className="my-3 border-[var(--border)]" />;
  }
};

export function Markdown({ source }: { source: string }) {
  const blocks = parseMarkdown(source);
  if (blocks.length === 0) {
    return (
      <p className="text-sm text-[var(--muted)] italic">Nothing written yet.</p>
    );
  }
  return <div className="text-[13px]">{blocks.map(renderBlock)}</div>;
}
