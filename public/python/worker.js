/*
 * Python runner, off the main thread.
 *
 * Pyodide is CPython compiled to WebAssembly: a ~12 MB download, then a real
 * interpreter in the tab. It runs here rather than on the main thread for two
 * reasons. The import would otherwise freeze the page for seconds, and an
 * accidental `while True:` in a solution would lock the tab with no way out -
 * in a worker the page stays responsive and can simply terminate it.
 *
 * It is an ES module worker rather than a classic one: importScripts() cannot
 * reach a cross-origin CDN, while a module worker's dynamic import() can.
 *
 * Protocol, worker -> page:
 *   { type: "status", stage }        loading progress
 *   { type: "ready" }                interpreter up, accepting runs
 *   { type: "started", id }          this run has reached the interpreter
 *   { type: "stdout", id, text }     a line of output, streamed
 *   { type: "result", id, ok, ... }  the run finished
 *   { type: "fatal", error }         the interpreter could not start
 * page -> worker:
 *   { type: "run", id, code }
 */

// Pinned deliberately. Pyodide ships the interpreter, the stdlib and the wasm
// as one versioned bundle, so a floating version would change Python itself.
const PYODIDE_VERSION = "314.0.8";
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodide = null;
let currentId = null;

const post = (message) => self.postMessage(message);

const boot = async () => {
  try {
    post({ type: "status", stage: "Fetching the Python interpreter" });
    const { loadPyodide } = await import(`${INDEX_URL}pyodide.mjs`);

    post({ type: "status", stage: "Starting CPython" });
    pyodide = await loadPyodide({ indexURL: INDEX_URL });

    // Stream output as it happens, so a long loop shows progress rather than
    // dumping everything at the end.
    pyodide.setStdout({
      batched: (text) => post({ type: "stdout", id: currentId, text }),
    });
    pyodide.setStderr({
      batched: (text) => post({ type: "stdout", id: currentId, text }),
    });

    post({ type: "ready", version: pyodide.version });
  } catch (error) {
    post({ type: "fatal", error: String(error) });
  }
};

const booted = boot();

self.onmessage = async (event) => {
  const message = event.data;
  if (message === null || typeof message !== "object") return;
  if (message.type !== "run") return;

  await booted;
  if (pyodide === null) {
    post({ type: "fatal", error: "The interpreter is not running." });
    return;
  }

  currentId = message.id;
  // The page starts its run clock here, not when it posted the message: the
  // first run of a session waits for a 12 MB download, and that wait is not
  // the solution being slow.
  post({ type: "started", id: message.id });
  const started = performance.now();

  try {
    // runPythonAsync so top-level await works, and so an import of a bundled
    // package resolves rather than throwing.
    const value = await pyodide.runPythonAsync(message.code);
    post({
      type: "result",
      id: message.id,
      ok: true,
      // Only show a repr when the last statement was an expression with a
      // value; None is the usual case and is just noise.
      value: value === undefined || value === null ? null : String(value),
      ms: Math.round(performance.now() - started),
    });
  } catch (error) {
    post({
      type: "result",
      id: message.id,
      ok: false,
      error: String(error && error.message ? error.message : error),
      ms: Math.round(performance.now() - started),
    });
  } finally {
    currentId = null;
  }
};
