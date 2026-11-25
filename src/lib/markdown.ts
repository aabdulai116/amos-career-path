/**
 * A deliberately small markdown subset for skill notes.
 *
 * It parses to a tree of plain objects, which the <Markdown> component turns
 * into React elements. Nothing ever becomes an HTML string, so there is no
 * dangerouslySetInnerHTML and no injection surface - worth more here than
 * full CommonMark coverage for notes I write to myself.
 *
 * Supported: # ## ### headings, - and 1. lists, > quotes, ``` fences, ---,
 * **bold**, *italic*, `code`, [links](https://…).
 */

export type Inline =
  | { type: "text"; value: string }
  | { type: "strong"; children: Inline[] }
  | { type: "em"; children: Inline[] }
  | { type: "code"; value: string }
  | { type: "link"; href: string; children: Inline[] };

export type Block =
  | { type: "heading"; level: 1 | 2 | 3; children: Inline[] }
  | { type: "paragraph"; children: Inline[] }
  | { type: "list"; ordered: boolean; items: Inline[][] }
  | { type: "code"; value: string; lang: string | null }
  | { type: "quote"; children: Inline[] }
  | { type: "rule" };

/** Only schemes that cannot execute script; anything else stays literal text. */
export const safeHref = (raw: string): string | null => {
  const value = raw.trim();
  if (/^https?:\/\//i.test(value)) return value;
  if (/^mailto:[^\s]+@[^\s]+$/i.test(value)) return value;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return null;
};

export const parseInline = (source: string): Inline[] => {
  const out: Inline[] = [];
  let buffer = "";
  let i = 0;

  const flush = (): void => {
    if (buffer !== "") {
      out.push({ type: "text", value: buffer });
      buffer = "";
    }
  };

  while (i < source.length) {
    const rest = source.slice(i);

    const code = /^`([^`]+)`/.exec(rest);
    if (code) {
      flush();
      out.push({ type: "code", value: code[1] });
      i += code[0].length;
      continue;
    }

    const strong = /^\*\*([\s\S]+?)\*\*(?!\*)/.exec(rest);
    if (strong) {
      flush();
      out.push({ type: "strong", children: parseInline(strong[1]) });
      i += strong[0].length;
      continue;
    }

    const em = /^\*([^*\n]+)\*/.exec(rest);
    if (em) {
      flush();
      out.push({ type: "em", children: parseInline(em[1]) });
      i += em[0].length;
      continue;
    }

    const link = /^\[([^\]]*)\]\(([^)\s]+)\)/.exec(rest);
    if (link) {
      const href = safeHref(link[2]);
      if (href === null) {
        // Keep it in the buffer so it merges with the text around it.
        buffer += link[0];
      } else {
        flush();
        const label = link[1] === "" ? href : link[1];
        out.push({ type: "link", href, children: parseInline(label) });
      }
      i += link[0].length;
      continue;
    }

    buffer += source[i];
    i += 1;
  }

  flush();
  return out;
};

const UNORDERED = /^\s{0,3}[-*+]\s+(.*)$/;
const ORDERED = /^\s{0,3}\d+[.)]\s+(.*)$/;

export const parseMarkdown = (source: string): Block[] => {
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = (): void => {
    if (paragraph.length === 0) return;
    blocks.push({
      type: "paragraph",
      children: parseInline(paragraph.join(" ").trim()),
    });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (line.trim() === "") {
      flushParagraph();
      continue;
    }

    const fence = /^\s{0,3}```\s*([\w+-]*)\s*$/.exec(line);
    if (fence) {
      flushParagraph();
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^\s{0,3}```/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      blocks.push({
        type: "code",
        value: body.join("\n"),
        lang: fence[1] === "" ? null : fence[1],
      });
      continue;
    }

    if (/^\s{0,3}(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      flushParagraph();
      blocks.push({ type: "rule" });
      continue;
    }

    const heading = /^\s{0,3}(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: heading[1].length as 1 | 2 | 3,
        children: parseInline(heading[2].trim()),
      });
      continue;
    }

    const quote = /^\s{0,3}>\s?(.*)$/.exec(line);
    if (quote) {
      flushParagraph();
      const body = [quote[1]];
      while (i + 1 < lines.length) {
        const next = /^\s{0,3}>\s?(.*)$/.exec(lines[i + 1]);
        if (!next) break;
        body.push(next[1]);
        i += 1;
      }
      blocks.push({ type: "quote", children: parseInline(body.join(" ").trim()) });
      continue;
    }

    const ordered = ORDERED.test(line);
    if (ordered || UNORDERED.test(line)) {
      flushParagraph();
      const pattern = ordered ? ORDERED : UNORDERED;
      const items: Inline[][] = [];
      while (i < lines.length) {
        const match = pattern.exec(lines[i]);
        if (!match) break;
        items.push(parseInline(match[1].trim()));
        i += 1;
      }
      i -= 1;
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    paragraph.push(line.trim());
  }

  flushParagraph();
  return blocks;
};

/** Plain text of a note, for previews and counts. */
export const markdownToText = (source: string): string => {
  const walk = (nodes: Inline[]): string =>
    nodes
      .map((node) => {
        if (node.type === "text" || node.type === "code") return node.value;
        return walk(node.children);
      })
      .join("");
  return parseMarkdown(source)
    .map((block) => {
      if (block.type === "rule") return "";
      if (block.type === "code") return block.value;
      if (block.type === "list") {
        return block.items.map((item) => walk(item)).join(" ");
      }
      return walk(block.children);
    })
    .filter((line) => line !== "")
    .join(" ");
};
