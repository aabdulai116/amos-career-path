import { ImageResponse } from "next/og";

/**
 * The card that appears when the link is pasted into a message.
 *
 * Generated rather than a checked-in PNG so it stays in step with the app's
 * colours and never goes stale. A shared link with no preview reads as
 * suspicious, which is the last thing you want when asking a first-year to
 * sign in with their university account.
 */
export const alt =
  "A skill map, course tracker and internship board for computer science students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0d12",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: 6,
              color: "#8d9bb0",
              textTransform: "uppercase",
            }}
          >
            Skill map · Course · Practice · Internships
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              color: "#e8edf5",
              marginTop: 28,
              lineHeight: 1.1,
            }}
          >
            Get technically ready
          </div>
          <div style={{ display: "flex", fontSize: 76, color: "#38bdf8", lineHeight: 1.1 }}>
            for internship recruiting
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#8d9bb0",
              marginTop: 32,
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Ninety-seven skills, the 100 Days course, the NeetCode 150 with
            Python in the browser, and internships filtered for students on CPT.
          </div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
          {["TypeScript", "Python", "C++", "WebAssembly", "Postgres"].map((tag) => (
            <div
              key={tag}
              style={{
                display: "flex",
                border: "2px solid #232c39",
                borderRadius: 999,
                padding: "10px 26px",
                fontSize: 24,
                color: "#8d9bb0",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
