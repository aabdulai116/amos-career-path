import { paths } from "@/data/paths";
import { skillById, skills } from "@/data/skills";
import { pathSkillIds, topologicalOrder } from "@/lib/graph";
import type { CareerPath, Skill } from "@/lib/types";

/**
 * A short intake for someone who does not yet know what they want.
 *
 * The app was built around a person who already knew: it opens on a graph of
 * ninety-seven skills and nine paths, which is the right tool once you have
 * chosen and an intimidating wall before you have. These six questions exist
 * to turn "I have no idea" into one suggested path and five concrete things
 * to do this week.
 *
 * It is a weighted questionnaire, not a personality test, and it says so: the
 * result is a starting point that can be changed at any time, and the second
 * and third place answers are shown alongside so the choice stays visibly
 * open rather than pronounced.
 */

export type PathId = (typeof paths)[number]["id"];

export interface Answer {
  id: string;
  label: string;
  /** Points added per path. Absent paths score nothing. */
  weights: Partial<Record<string, number>>;
}

export interface Question {
  id: string;
  prompt: string;
  /** A line of context, because some of these words are new to a first-year. */
  help?: string;
  answers: Answer[];
}

export const QUESTIONS: Question[] = [
  {
    id: "pull",
    prompt: "Which of these would you rather spend a Saturday on?",
    answers: [
      {
        id: "interface",
        label: "Making something look and feel right to use",
        weights: { frontend: 3, "full-stack": 2, "software-engineer": 1 },
      },
      {
        id: "system",
        label: "Making something handle a thousand users without falling over",
        weights: { backend: 3, "cloud-engineer": 2, "software-engineer": 1 },
      },
      {
        id: "data",
        label: "Finding a pattern hidden in a pile of data",
        weights: { "quant-researcher": 3, "ai-engineer": 3 },
      },
      {
        id: "speed",
        label: "Making something that already works run ten times faster",
        weights: { "quant-developer": 3, backend: 1, "cloud-engineer": 1 },
      },
    ],
  },
  {
    id: "maths",
    prompt: "How do you feel about maths?",
    help: "Be honest rather than ambitious. You can change this later.",
    answers: [
      {
        id: "love",
        label: "It is the part I enjoy most",
        weights: { "quant-researcher": 3, "quant-trader": 3, "ai-engineer": 2 },
      },
      {
        id: "fine",
        label: "Comfortable, but it is not why I am here",
        weights: { "ai-engineer": 2, backend: 1, "software-engineer": 1 },
      },
      {
        id: "avoid",
        label: "I would rather build than prove",
        weights: { frontend: 3, "full-stack": 2, "cloud-engineer": 2, "software-engineer": 1 },
      },
    ],
  },
  {
    id: "pressure",
    prompt: "A decision has to be made in ten seconds with incomplete information.",
    answers: [
      {
        id: "thrive",
        label: "That sounds fun",
        weights: { "quant-trader": 4 },
      },
      {
        id: "ok",
        label: "I can do it, but I would rather have an hour",
        weights: { "software-engineer": 1, backend: 1, "quant-developer": 1 },
      },
      {
        id: "dislike",
        label: "I would rather be careful and get it right",
        weights: { "quant-researcher": 2, "ai-engineer": 1, backend: 1 },
      },
    ],
  },
  {
    id: "output",
    prompt: "At the end of a project, what would you want to show someone?",
    answers: [
      {
        id: "product",
        label: "A thing they can open and use",
        weights: { "full-stack": 3, frontend: 2, "software-engineer": 1 },
      },
      {
        id: "finding",
        label: "A result: here is what the data actually says",
        weights: { "quant-researcher": 3, "ai-engineer": 2 },
      },
      {
        id: "number",
        label: "A number that got better: faster, cheaper, more accurate",
        weights: { "quant-developer": 2, "cloud-engineer": 2, "ai-engineer": 1 },
      },
      {
        id: "service",
        label: "Something other programs rely on",
        weights: { backend: 3, "cloud-engineer": 1 },
      },
    ],
  },
  {
    id: "money",
    prompt: "Does working in finance appeal to you?",
    help: "Quant roles pay the most and are the hardest to get. Both are true.",
    answers: [
      {
        id: "yes",
        label: "Yes, markets genuinely interest me",
        weights: { "quant-trader": 3, "quant-researcher": 3, "quant-developer": 3 },
      },
      {
        id: "maybe",
        label: "For the money, but I am not drawn to it",
        weights: { "quant-developer": 1, "software-engineer": 2, backend: 1 },
      },
      {
        id: "no",
        label: "Not really",
        weights: { "software-engineer": 2, frontend: 1, backend: 1, "ai-engineer": 1, "full-stack": 1 },
      },
    ],
  },
  {
    id: "experience",
    prompt: "How much have you built so far?",
    help: "This only changes where you start, not what you are capable of.",
    answers: [
      {
        id: "none",
        label: "Nothing yet — I am just starting",
        weights: { "software-engineer": 2 },
      },
      {
        id: "some",
        label: "A few university projects",
        weights: {},
      },
      {
        id: "lots",
        label: "Things of my own, outside class",
        weights: {},
      },
    ],
  },
];

export type Answers = Record<string, string>;

export interface Recommendation {
  path: CareerPath;
  score: number;
  /** 0-100, this path's share of the total score. */
  share: number;
}

/**
 * Score every path and rank them. Returns all of them, so the caller can show
 * the runners-up - a single pronouncement would be both less honest and less
 * useful than "this one, and these two are close".
 */
export const recommendPaths = (answers: Answers): Recommendation[] => {
  const scores = new Map<string, number>(paths.map((p) => [p.id, 0]));

  QUESTIONS.forEach((question) => {
    const chosen = question.answers.find((a) => a.id === answers[question.id]);
    if (chosen === undefined) return;
    Object.entries(chosen.weights).forEach(([pathId, points]) => {
      if (!scores.has(pathId)) return;
      scores.set(pathId, (scores.get(pathId) ?? 0) + (points ?? 0));
    });
  });

  const total = [...scores.values()].reduce((n, v) => n + v, 0);

  return paths
    .map((path) => {
      const score = scores.get(path.id) ?? 0;
      return {
        path,
        score,
        share: total === 0 ? 0 : Math.round((score / total) * 1000) / 10,
      };
    })
    .sort((a, b) => b.score - a.score || a.path.name.localeCompare(b.path.name));
};

export const isComplete = (answers: Answers): boolean =>
  QUESTIONS.every((q) => typeof answers[q.id] === "string");

/**
 * The first few skills on a path that nothing else blocks: what to actually
 * open on Monday. Taken in dependency order so they can genuinely be started
 * now rather than being the headline skill with five prerequisites behind it.
 */
export const startingSkills = (
  path: CareerPath,
  limit = 5,
  allSkills: Skill[] = skills,
): Skill[] => {
  const inPath = new Set(pathSkillIds(path, allSkills));
  const ordered = topologicalOrder(allSkills.filter((s) => inPath.has(s.id)));
  return ordered
    .map((id) => skillById[id])
    .filter((skill): skill is Skill => skill !== undefined)
    .filter((skill) => skill.level === 1)
    .slice(0, limit);
};

/** Experience answer decides how much hand-holding the result page offers. */
export const experienceLevel = (answers: Answers): "new" | "some" | "building" => {
  const value = answers.experience;
  if (value === "lots") return "building";
  if (value === "some") return "some";
  return "new";
};
