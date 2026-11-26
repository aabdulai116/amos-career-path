"use client";

/**
 * The last resort: an error thrown in the root layout itself, where the
 * normal error page cannot render because the layout that wraps it is the
 * thing that failed. It has to supply its own <html> and <body>, and it
 * cannot rely on the app's fonts or CSS variables having loaded - hence the
 * inline styles, which look out of place here and are deliberate.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: "#0a0d12",
          color: "#e8edf5",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.25rem", margin: "0 0 0.75rem" }}>
            The app failed to start
          </h1>
          <p style={{ color: "#8d9bb0", lineHeight: 1.6, fontSize: "0.875rem" }}>
            Your progress is stored in this browser and has not been touched.
            Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1rem",
              background: "#38bdf8",
              color: "#0a0d12",
              border: 0,
              borderRadius: "0.5rem",
              padding: "0.5rem 0.85rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
          {error.digest && (
            <p style={{ color: "#8d9bb0", fontSize: "0.7rem", marginTop: "1rem" }}>
              Error ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
