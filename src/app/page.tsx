import { domains } from "@/data/domains";
import { paths } from "@/data/paths";
import { resources, uniqueResourceLinks } from "@/data/resources";
import { skills } from "@/data/skills";
import { isGraphValid, pathSkillIds, validateGraph } from "@/lib/graph";

/**
 * Phase 1 holding page: proves the seed data loads and the graph is sound.
 * The Atlas (phase 2) and Dashboard (phase 3) replace this.
 */
export default function Home() {
  const problems = validateGraph(skills);
  const totalHours = skills.reduce((sum, s) => sum + s.estHours, 0);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="font-mono text-xs tracking-widest text-[var(--muted)] uppercase">
        Phase 1 of 5 · seed data
      </p>
      <h1 className="mt-3 text-4xl font-semibold tracking-tight">
        Amos Career Path
      </h1>
      <p className="mt-3 max-w-2xl text-[var(--muted)]">
        A skill map for software engineering, AI and quant, aimed at summer 2028
        internships. Recruiting opens 1 August 2027.
      </p>

      <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Skills", String(skills.length)],
          ["Domains", String(domains.length)],
          ["Career paths", String(paths.length)],
          ["Resource links", String(uniqueResourceLinks.length)],
          ["Resource entries", String(resources.length)],
          ["Estimated hours", String(totalHours)],
          [
            "Graph",
            isGraphValid(problems)
              ? "valid"
              : `${problems.cycles.length} cycles`,
          ],
          [
            "Starting points",
            String(skills.filter((s) => s.prerequisites.length === 0).length),
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <dt className="text-xs text-[var(--muted)]">{label}</dt>
            <dd className="mt-1 font-mono text-2xl">{value}</dd>
          </div>
        ))}
      </dl>

      <h2 className="mt-12 text-lg font-semibold">Domains</h2>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {domains.map((domain) => {
          const count = skills.filter((s) => s.domain === domain.id).length;
          return (
            <li
              key={domain.id}
              className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: domain.color }}
              />
              <span className="flex-1">{domain.name}</span>
              <span className="font-mono text-sm text-[var(--muted)]">
                {count}
              </span>
            </li>
          );
        })}
      </ul>

      <h2 className="mt-12 text-lg font-semibold">Career paths</h2>
      <ul className="mt-4 space-y-2">
        {paths.map((path) => (
          <li
            key={path.id}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{path.name}</span>
              <span className="font-mono text-sm text-[var(--muted)]">
                {path.skillIds.length} core ·{" "}
                {pathSkillIds(path, skills).length} with prerequisites
              </span>
            </div>
            <p className="mt-1 text-sm text-[var(--muted)]">{path.tagline}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
