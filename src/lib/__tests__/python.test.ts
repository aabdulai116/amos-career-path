import { describe, expect, it } from "vitest";
import { problems } from "@/data/problems";
import {
  BOOT_TIMEOUT_MS,
  RUN_TIMEOUT_MS,
  describeOutcome,
  formatPythonError,
  starterCode,
  type RunOutcome,
} from "@/lib/python";

const outcome = (over: Partial<RunOutcome> = {}): RunOutcome => ({
  ok: true,
  output: "",
  value: null,
  error: null,
  ms: 12,
  timedOut: false,
  bootFailed: false,
  ...over,
});

describe("starterCode", () => {
  const problem = problems[0];

  it("names the problem and links to it", () => {
    const code = starterCode(problem);
    expect(code).toContain(problem.title);
    expect(code).toContain(problem.difficulty);
    expect(code).toContain(problem.pattern);
    expect(code).toContain(`https://leetcode.com/problems/${problem.slug}/`);
  });

  it("points a gated problem at its free mirror instead", () => {
    const gated = problems.find((p) => p.freeUrl !== null);
    expect(gated).toBeDefined();
    const code = starterCode(gated!);
    expect(code).toContain(gated!.freeUrl!);
    expect(code).not.toContain("leetcode.com/problems");
  });

  it("is only comments, so nothing runs until I write something", () => {
    starterCode(problem)
      .split("\n")
      .filter((line) => line.trim() !== "")
      .forEach((line) => expect(line.trimStart().startsWith("#")).toBe(true));
  });

  it("does not guess a function signature", () => {
    // A wrong `def twoSum(self, nums, target)` is worse than no stub: it looks
    // authoritative and silently disagrees with LeetCode's real signature.
    expect(starterCode(problem)).not.toContain("def ");
    expect(starterCode(problem)).not.toContain("class Solution");
  });
});

describe("formatPythonError", () => {
  it("drops Pyodide's own frames and keeps mine", () => {
    const raw = [
      "Traceback (most recent call last):",
      '  File "/lib/python314.zip/_pyodide/_base.py", line 573, in eval_code_async',
      "    await CodeRunner(",
      '  File "<exec>", line 4, in <module>',
      "    print(total / 0)",
      "ZeroDivisionError: division by zero",
    ].join("\n");

    const cleaned = formatPythonError(raw);
    expect(cleaned).not.toContain("_pyodide");
    expect(cleaned).not.toContain("eval_code_async");
    expect(cleaned).toContain("ZeroDivisionError: division by zero");
    expect(cleaned).toContain("line 4, in <module>");
    // Not "line, line 4": the replacement swallows the comma too.
    expect(cleaned).not.toContain("line, line");
  });

  it("relabels the synthetic <exec> filename", () => {
    expect(formatPythonError('  File "<exec>", line 2')).toBe("line 2");
  });

  it("leaves a plain message untouched", () => {
    expect(formatPythonError("SyntaxError: invalid syntax")).toBe(
      "SyntaxError: invalid syntax",
    );
  });

  it("collapses the blank runs left behind and trims", () => {
    expect(formatPythonError("\n\nNameError: x\n\n\n")).toBe("NameError: x");
  });

  it("survives an empty traceback", () => {
    expect(formatPythonError("")).toBe("");
  });
});

describe("describeOutcome", () => {
  it("gives the interpreter far longer to arrive than the code gets to run", () => {
    // The first run of a visit waits on a 12 MB download. Charging that to the
    // run budget made every first run report an infinite loop.
    expect(BOOT_TIMEOUT_MS).toBeGreaterThan(RUN_TIMEOUT_MS * 5);
  });

  it("blames the download, not the code, when the interpreter never arrived", () => {
    const text = describeOutcome(
      outcome({ ok: false, bootFailed: true, error: "NetworkError" }),
    );
    expect(text).toBe("NetworkError");
    expect(text).not.toContain("infinite loop");
  });

  it("explains a boot failure with no error text in plain language", () => {
    const text = describeOutcome(outcome({ ok: false, bootFailed: true }));
    expect(text).toContain("could not be downloaded");
  });

  it("explains a timeout in terms of the likely cause", () => {
    const text = describeOutcome(outcome({ ok: false, timedOut: true }));
    expect(text).toContain(String(Math.round(RUN_TIMEOUT_MS / 1000)));
    expect(text).toContain("infinite loop");
  });

  it("keeps what printed before the exception, then the traceback", () => {
    const text = describeOutcome(
      outcome({
        ok: false,
        output: "total 3\n",
        error: 'Traceback:\n  File "<exec>", line 4\nZeroDivisionError: division by zero',
      }),
    );
    expect(text).toContain("total 3");
    expect(text).toContain("ZeroDivisionError");
    expect(text.indexOf("total 3")).toBeLessThan(text.indexOf("ZeroDivision"));
  });

  it("prefers the cleaned traceback on a failure", () => {
    const text = describeOutcome(
      outcome({
        ok: false,
        error: '  File "/lib/python314.zip/_pyodide/_base.py", line 1\nNameError: n',
      }),
    );
    expect(text).toBe("NameError: n");
  });

  it("says so when a clean run printed nothing", () => {
    expect(describeOutcome(outcome())).toContain("Nothing was printed");
  });

  it("falls back to the final expression when nothing was printed", () => {
    expect(describeOutcome(outcome({ value: "42" }))).toBe("42");
  });

  it("returns the printed output, trimmed at the end only", () => {
    expect(describeOutcome(outcome({ output: "  a\nb\n\n" }))).toBe("  a\nb");
  });

  it("shows output rather than the value when both exist", () => {
    expect(describeOutcome(outcome({ output: "printed", value: "7" }))).toBe(
      "printed",
    );
  });
});
