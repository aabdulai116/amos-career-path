import { describe, expect, it } from "vitest";
import {
  markdownToText,
  parseInline,
  parseMarkdown,
  safeHref,
  type Block,
} from "@/lib/markdown";

const text = (value: string) => ({ type: "text", value });

describe("safeHref", () => {
  it("allows http, https and mailto", () => {
    expect(safeHref("https://example.com")).toBe("https://example.com");
    expect(safeHref("http://example.com")).toBe("http://example.com");
    expect(safeHref("mailto:someone@example.com")).toBe(
      "mailto:someone@example.com",
    );
  });

  it("allows an in-app absolute path", () => {
    expect(safeHref("/dashboard")).toBe("/dashboard");
  });

  it("rejects javascript: and data: URLs", () => {
    expect(safeHref("javascript:alert(1)")).toBeNull();
    expect(safeHref("JavaScript:alert(1)")).toBeNull();
    expect(safeHref("data:text/html,<script>")).toBeNull();
    expect(safeHref("vbscript:x")).toBeNull();
  });

  it("rejects a protocol-relative URL", () => {
    expect(safeHref("//evil.example")).toBeNull();
  });

  it("trims surrounding whitespace", () => {
    expect(safeHref("  https://example.com ")).toBe("https://example.com");
  });
});

describe("parseInline", () => {
  it("returns plain text untouched", () => {
    expect(parseInline("just words")).toEqual([text("just words")]);
  });

  it("parses bold, italic and code", () => {
    expect(parseInline("**b**")).toEqual([
      { type: "strong", children: [text("b")] },
    ]);
    expect(parseInline("*i*")).toEqual([{ type: "em", children: [text("i")] }]);
    expect(parseInline("`x = 1`")).toEqual([{ type: "code", value: "x = 1" }]);
  });

  it("keeps surrounding text", () => {
    expect(parseInline("a **b** c")).toEqual([
      text("a "),
      { type: "strong", children: [text("b")] },
      text(" c"),
    ]);
  });

  it("nests italics inside bold", () => {
    expect(parseInline("**a *b***")).toEqual([
      {
        type: "strong",
        children: [text("a "), { type: "em", children: [text("b")] }],
      },
    ]);
  });

  it("parses a link", () => {
    expect(parseInline("[docs](https://example.com)")).toEqual([
      {
        type: "link",
        href: "https://example.com",
        children: [text("docs")],
      },
    ]);
  });

  it("leaves an unsafe link as literal text", () => {
    expect(parseInline("[x](javascript:alert(1))")).toEqual([
      text("[x](javascript:alert(1))"),
    ]);
  });

  it("uses the URL as the label when the label is empty", () => {
    expect(parseInline("[](https://example.com)")).toEqual([
      {
        type: "link",
        href: "https://example.com",
        children: [text("https://example.com")],
      },
    ]);
  });

  it("does not treat a lone asterisk as emphasis", () => {
    expect(parseInline("2 * 3 = 6")).toEqual([text("2 * 3 = 6")]);
  });

  it("does not hang on an unclosed delimiter", () => {
    expect(parseInline("**unclosed")).toEqual([text("**unclosed")]);
    expect(parseInline("`unclosed")).toEqual([text("`unclosed")]);
  });
});

describe("parseMarkdown", () => {
  it("returns nothing for empty input", () => {
    expect(parseMarkdown("")).toEqual([]);
    expect(parseMarkdown("\n\n  \n")).toEqual([]);
  });

  it("parses headings at three levels", () => {
    const blocks = parseMarkdown("# One\n## Two\n### Three");
    expect(blocks.map((b) => (b.type === "heading" ? b.level : null))).toEqual([
      1, 2, 3,
    ]);
  });

  it("does not treat #### as a heading", () => {
    const [block] = parseMarkdown("#### four");
    expect(block.type).toBe("paragraph");
  });

  it("joins wrapped lines into one paragraph and splits on a blank line", () => {
    const blocks = parseMarkdown("one\ntwo\n\nthree");
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toEqual({
      type: "paragraph",
      children: [text("one two")],
    });
  });

  it("parses an unordered list", () => {
    const [block] = parseMarkdown("- a\n- b\n- c");
    expect(block.type).toBe("list");
    if (block.type !== "list") return;
    expect(block.ordered).toBe(false);
    expect(block.items).toHaveLength(3);
  });

  it("parses an ordered list", () => {
    const [block] = parseMarkdown("1. first\n2. second");
    expect(block.type).toBe("list");
    if (block.type !== "list") return;
    expect(block.ordered).toBe(true);
    expect(block.items[1]).toEqual([text("second")]);
  });

  it("ends a list at the next paragraph", () => {
    const blocks = parseMarkdown("- a\n- b\nnot a list");
    expect(blocks.map((b) => b.type)).toEqual(["list", "paragraph"]);
  });

  it("parses a fenced code block and keeps it literal", () => {
    const [block] = parseMarkdown("```python\nx = **1**\n```");
    expect(block).toEqual({
      type: "code",
      value: "x = **1**",
      lang: "python",
    });
  });

  it("parses a fence with no language", () => {
    const [block] = parseMarkdown("```\nplain\n```");
    expect(block).toEqual({ type: "code", value: "plain", lang: null });
  });

  it("closes an unterminated fence at the end of input", () => {
    const [block] = parseMarkdown("```\nstill code");
    expect(block).toEqual({ type: "code", value: "still code", lang: null });
  });

  it("parses a multi-line blockquote as one block", () => {
    const blocks = parseMarkdown("> one\n> two");
    expect(blocks).toHaveLength(1);
    expect(blocks[0]).toEqual({
      type: "quote",
      children: [text("one two")],
    });
  });

  it("parses a horizontal rule", () => {
    expect(parseMarkdown("---")).toEqual<Block[]>([{ type: "rule" }]);
  });

  it("handles a realistic note", () => {
    const blocks = parseMarkdown(
      [
        "## Stat 110",
        "",
        "Got through **chapter 7**. Still shaky on:",
        "",
        "- the Beta-Binomial conjugacy",
        "- order statistics",
        "",
        "> Revisit lecture 23 before moving on.",
        "",
        "See [the playlist](https://example.com/playlist).",
      ].join("\n"),
    );
    expect(blocks.map((b) => b.type)).toEqual([
      "heading",
      "paragraph",
      "list",
      "quote",
      "paragraph",
    ]);
  });
});

describe("markdownToText", () => {
  it("strips the markup", () => {
    expect(markdownToText("## Title\n\nsome **bold** text")).toBe(
      "Title some bold text",
    );
  });

  it("keeps list item text", () => {
    expect(markdownToText("- a\n- b")).toBe("a b");
  });

  it("is empty for empty input", () => {
    expect(markdownToText("")).toBe("");
  });
});
