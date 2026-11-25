import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Privacy" };

/**
 * Written in plain words and kept short on purpose. The audience is a
 * first-year deciding whether to sign in with their university account, and
 * nobody has ever been reassured by eight hundred words of boilerplate.
 */
export default function PrivacyPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl space-y-6 px-5 py-6">
        <header>
          <p className="font-mono text-[11px] tracking-widest text-[var(--muted)] uppercase">
            Privacy
          </p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight">
            What this stores, and what it does not
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            This is a student project, not a company. It is worth knowing
            exactly what happens to your data before you sign in.
          </p>
        </header>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">You do not have to sign in</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
            Every page works signed out. Your progress is then stored only in
            this browser, never sent anywhere, and nobody — including me — can
            see it. If that is all you want, you are done: just use the site.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">If you do sign in</h2>
          <p className="mt-1.5 text-xs text-[var(--muted)]">Stored:</p>
          <ul className="mt-1.5 space-y-1 text-xs text-[var(--muted)]">
            <li>
              • Your name, email address and profile picture, as Google or
              Microsoft gives them
            </li>
            <li>
              • Your progress: skills, course days, problems and the code you
              wrote for them, your notes, company verdicts and applications
            </li>
          </ul>
          <p className="mt-3 text-xs text-[var(--muted)]">Not stored:</p>
          <ul className="mt-1.5 space-y-1 text-xs text-[var(--muted)]">
            <li>
              • Any password. There is none — sign-in goes through Google or
              Microsoft, and this site never sees your credentials
            </li>
            <li>• Your contacts, files, calendar or anything else from that account</li>
            <li>• Analytics, trackers or advertising identifiers of any kind</li>
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Who can see it</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
            Nobody else using the site. Every record is tied to one account and
            every query is scoped to it; there is no shared view, no leaderboard
            and no way for one person to read another&rsquo;s notes.
          </p>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
            I run the database, so I could technically query it — the same as
            anyone who hosts anything. I will not read your notes, and there is
            no feature anywhere that shows me them.
          </p>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Getting your data out, or deleting it</h2>
          <ul className="mt-1.5 space-y-1 text-xs text-[var(--muted)]">
            <li>
              • <Link href="/settings" className="text-[var(--accent)] hover:underline">Settings</Link>{" "}
              exports everything as a JSON file you keep
            </li>
            <li>
              • <Link href="/account" className="text-[var(--accent)] hover:underline">Account</Link>{" "}
              deletes the account and every row attached to it, immediately and
              permanently
            </li>
            <li>
              • Deleting the account does not touch the copy in your browser,
              so you can carry on signed out
            </li>
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="text-sm font-semibold">Third parties</h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
            Sign-in goes to Google or Microsoft. Hosting is Vercel and the
            database is Neon. The Python interpreter on the practice and course
            pages is downloaded from the jsDelivr CDN when you first press Run.
            Internship listings come from the public SimplifyJobs repository.
            None of them are sent your progress.
          </p>
        </section>

        <p className="text-xs text-[var(--muted)]">
          Questions, or want your data removed by hand? Open an issue on the
          repository and I will do it.
        </p>
      </div>
    </div>
  );
}
