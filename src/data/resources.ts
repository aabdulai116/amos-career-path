import type { Resource } from "@/lib/types";

/**
 * Hand-curated links only. Nothing in here is generated or guessed: every URL was
 * supplied deliberately, and `npm run check:links` verifies they still resolve.
 * A skill with no entry here renders an "add a resource" button instead, and the
 * link you paste is stored in progress state (customResources), not in this file.
 */

const forSkills = (
  skillIds: string[],
  r: Omit<Resource, "skillId">,
): Resource[] => skillIds.map((skillId) => ({ skillId, ...r }));

/** The three DSA resources below each cover the whole DSA track. */
const DSA_ALL = [
  "big-o",
  "arrays-strings",
  "hashing",
  "two-pointers-sliding-window",
  "linked-lists",
  "stacks-queues",
  "sorting",
  "binary-search",
  "recursion-backtracking",
  "trees",
  "heaps",
  "graphs",
  "shortest-paths",
  "dynamic-programming",
  "greedy",
  "interview-problem-solving",
];

export const resources: Resource[] = [
  // --------------------------------------------------------------- Programming
  {
    skillId: "python-fundamentals",
    title: "Learn Python - Full Course for Beginners",
    creator: "freeCodeCamp",
    url: "https://www.youtube.com/watch?v=rfscVS0vtbw",
    type: "video",
    level: "beginner",
  },
  {
    skillId: "python-fundamentals",
    title: "CS50P: Intro to Programming with Python",
    creator: "Harvard CS50",
    url: "https://cs50.harvard.edu/python/",
    type: "course page",
    level: "beginner",
  },
  {
    skillId: "javascript-basics",
    title: "JavaScript Full Course - Beginner to Pro",
    creator: "SuperSimpleDev",
    url: "https://www.youtube.com/watch?v=EerdGm-ehJQ",
    type: "video",
    level: "beginner",
  },
  {
    skillId: "git-github",
    title: "Git and GitHub for Beginners - Crash Course",
    creator: "freeCodeCamp",
    url: "https://www.youtube.com/watch?v=RGOj5yH7evk",
    type: "video",
    level: "beginner",
  },
  ...forSkills(["command-line", "git-github", "debugging"], {
    title: "The Missing Semester of Your CS Education",
    creator: "MIT",
    url: "https://missing.csail.mit.edu/",
    type: "course page",
    level: "intermediate",
  }),

  // ----------------------------------------------------------------------- DSA
  ...forSkills(DSA_ALL, {
    title: "Algorithms",
    creator: "Abdul Bari",
    url: "https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O",
    type: "playlist",
    level: "beginner",
  }),
  ...forSkills(DSA_ALL, {
    title: "MIT 6.006 Introduction to Algorithms (Spring 2020)",
    creator: "MIT OCW",
    url: "https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/",
    type: "course page",
    level: "intermediate",
  }),
  ...forSkills(DSA_ALL, {
    title: "NeetCode Roadmap - patterns and video solutions",
    creator: "NeetCode",
    url: "https://neetcode.io/roadmap",
    type: "practice",
    level: "intermediate",
  }),

  // ------------------------------------------------------------------- CS Core
  {
    skillId: "computer-architecture",
    title: "Crash Course Computer Science",
    creator: "CrashCourse",
    url: "https://www.youtube.com/playlist?list=PL8dPuuaLjXtNlUrzyH5r6jN9ulIgZBpdo",
    type: "playlist",
    level: "beginner",
  },
  {
    skillId: "computer-architecture",
    title: "Build an 8-bit computer from scratch",
    creator: "Ben Eater",
    url: "https://www.youtube.com/playlist?list=PLowKtXNTBypGqImE405J2565dvjafglHU",
    type: "playlist",
    level: "intermediate",
  },
  {
    skillId: "networking-http",
    title: "How does the internet work? - Full Course",
    creator: "freeCodeCamp",
    url: "https://www.youtube.com/watch?v=zN8YNNHcaZc",
    type: "video",
    level: "beginner",
  },
  {
    skillId: "networking-http",
    title: "Computer Networking Course",
    creator: "freeCodeCamp",
    url: "https://www.youtube.com/watch?v=qiQR5rTSshw",
    type: "video",
    level: "intermediate",
  },
  {
    skillId: "networking-http",
    title: "Networking tutorial series",
    creator: "Ben Eater",
    url: "https://www.youtube.com/playlist?list=PLowKtXNTBypH19whXTVoG3oKSuOcw_XeW",
    type: "playlist",
    level: "intermediate",
  },
  ...forSkills(["operating-systems", "concurrency"], {
    title: "CS 162 Operating Systems and Systems Programming",
    creator: "UC Berkeley",
    url: "https://cs162.org/",
    type: "course page",
    level: "advanced",
  }),
  {
    skillId: "databases-sql",
    title: "SQL Tutorial - Full Database Course for Beginners",
    creator: "freeCodeCamp",
    url: "https://www.youtube.com/watch?v=HXV3zeQKqGY",
    type: "video",
    level: "beginner",
  },
  {
    skillId: "databases-sql",
    title: "CMU 15-445 Intro to Database Systems",
    creator: "CMU Database Group",
    url: "https://15445.courses.cs.cmu.edu/",
    type: "course page",
    level: "advanced",
  },

  // ------------------------------------------------------------------ Frontend
  {
    skillId: "html-css",
    title: "HTML & CSS Full Course - Beginner to Pro",
    creator: "SuperSimpleDev",
    url: "https://www.youtube.com/watch?v=G3e-cpL7ofc",
    type: "video",
    level: "beginner",
  },
  {
    skillId: "react",
    title: "React Tutorial Full Course - Beginner to Pro (React 19)",
    creator: "SuperSimpleDev",
    url: "https://www.youtube.com/watch?v=TtPXvEcE11E",
    type: "video",
    level: "beginner",
  },
  {
    skillId: "react",
    title: "React Course - Beginner's Tutorial",
    creator: "freeCodeCamp (Bob Ziroll)",
    url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
    type: "video",
    level: "beginner",
  },

  // ------------------------------------------------------- Backend / System design
  ...forSkills(["system-design", "system-design-interviews"], {
    title: "ByteByteGo channel",
    creator: "ByteByteGo",
    url: "https://www.youtube.com/@ByteByteGo",
    type: "playlist",
    level: "intermediate",
  }),
  {
    skillId: "system-design",
    title: "System Design Interview Guide",
    creator: "Tech Interview Handbook",
    url: "https://www.techinterviewhandbook.org/system-design/",
    type: "course page",
    level: "intermediate",
  },

  // --------------------------------------------------------------- Cloud/DevOps
  {
    skillId: "docker",
    title: "Docker Tutorial for Beginners - Full Course",
    creator: "TechWorld with Nana",
    url: "https://www.youtube.com/watch?v=3c-iBn73dDE",
    type: "video",
    level: "beginner",
  },
  {
    skillId: "kubernetes",
    title: "Kubernetes Tutorial for Beginners - Full Course",
    creator: "TechWorld with Nana",
    url: "https://www.youtube.com/watch?v=X48VuDVv0do",
    type: "video",
    level: "beginner",
  },
  {
    skillId: "cloud-fundamentals",
    title: "AWS Certified Cloud Practitioner Course",
    creator: "freeCodeCamp (Andrew Brown)",
    url: "https://www.youtube.com/watch?v=SOTamWNgDKc",
    type: "video",
    level: "beginner",
  },

  // ---------------------------------------------------------------------- Math
  {
    skillId: "linear-algebra",
    title: "Essence of Linear Algebra",
    creator: "3Blue1Brown",
    url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab",
    type: "playlist",
    level: "beginner",
  },
  {
    skillId: "calculus-optimization",
    title: "Essence of Calculus",
    creator: "3Blue1Brown",
    url: "https://www.youtube.com/playlist?list=PLZHQObOWTQDMsr9K-rj53DwVRMYO3t5Yr",
    type: "playlist",
    level: "beginner",
  },
  {
    skillId: "probability",
    title: "Statistics 110: Probability",
    creator: "Harvard (Joe Blitzstein)",
    url: "https://www.youtube.com/playlist?list=PL2SOU6wwxB0uwwH80KTQ6ht66KWxbzTIo",
    type: "playlist",
    level: "intermediate",
  },
  {
    skillId: "statistics-inference",
    title: "StatQuest channel - start with Statistics Fundamentals",
    creator: "StatQuest",
    url: "https://www.youtube.com/@statquest",
    type: "playlist",
    level: "beginner",
  },

  // ------------------------------------------------------------------------ AI
  {
    skillId: "ml-fundamentals",
    title: "CS229 Machine Learning (Autumn 2018)",
    creator: "Stanford (Andrew Ng)",
    url: "https://www.youtube.com/playlist?list=PLoROMvodv4rMiGQp3WXShtMGgzqpfVfbU",
    type: "playlist",
    level: "intermediate",
  },
  {
    skillId: "deep-learning-pytorch",
    title: "Neural Networks: Zero to Hero",
    creator: "Andrej Karpathy",
    url: "https://www.youtube.com/playlist?list=PLAqhIrjkxbuWI23v9cThsA9GvCAUhRvKZ",
    type: "playlist",
    level: "intermediate",
  },
  {
    skillId: "llms-prompting",
    title: "Deep Dive into LLMs like ChatGPT",
    creator: "Andrej Karpathy",
    url: "https://www.youtube.com/watch?v=7xTGNNLPyMI",
    type: "video",
    level: "beginner",
  },
  ...forSkills(["nlp-transformers", "mlops"], {
    title: "CS336 Language Modeling from Scratch",
    creator: "Stanford",
    url: "https://www.youtube.com/playlist?list=PLoROMvodv4rOY23Y0BoGoBGgQ1zmU_MT_",
    type: "playlist",
    level: "advanced",
  }),

  // --------------------------------------------------------------------- Quant
  {
    skillId: "markets-101",
    title: "Financial Markets (ECON 252)",
    creator: "Yale (Robert Shiller)",
    url: "https://www.youtube.com/playlist?list=PL8FB14A2200B87185",
    type: "playlist",
    level: "beginner",
  },
  ...forSkills(
    ["mental-math", "expected-value-games", "combinatorics-puzzles"],
    {
      title: "PuzzledQuant - quant interview puzzles",
      creator: "PuzzledQuant",
      url: "https://www.youtube.com/channel/UCPoZ5ArDuYjKU6360_lA3VA",
      type: "playlist",
      level: "beginner",
    },
  ),
  ...forSkills(["market-making", "quant-interview-prep"], {
    title: "A Jane Street Trading Mock Interview",
    creator: "Jane Street",
    url: "https://www.janestreet.com/trading-interviews",
    type: "course page",
    level: "beginner",
  }),
  {
    skillId: "quant-interview-prep",
    title: "Software Engineering Mock Interview",
    creator: "Jane Street",
    url: "https://www.janestreet.com/mock-interview",
    type: "course page",
    level: "beginner",
  },
  {
    skillId: "microstructure",
    title: "How to Build an Exchange",
    creator: "Jane Street (Brian Nigito)",
    url: "https://www.janestreet.com/tech-talks/building-an-exchange/",
    type: "video",
    level: "intermediate",
  },
  ...forSkills(
    ["stochastic-processes", "options-greeks", "portfolio-theory", "time-series"],
    {
      title: "18.S096 Topics in Mathematics with Applications in Finance",
      creator: "MIT OCW",
      url: "https://www.youtube.com/playlist?list=PLUl4u3cNGP63ctJIEC1UnZ0btsphnnoHR",
      type: "playlist",
      level: "advanced",
    },
  ),
  ...forSkills(["stochastic-processes", "portfolio-theory", "ml-for-finance"], {
    title: "18.642 Topics in Mathematics with Applications in Finance (Fall 2024)",
    creator: "MIT OCW",
    url: "https://ocw.mit.edu/courses/18-642-topics-in-mathematics-with-applications-in-finance-fall-2024/",
    type: "course page",
    level: "advanced",
  }),
  ...forSkills(["options-greeks", "stochastic-processes", "monte-carlo"], {
    title: "Quant Guild Library - notebooks and matching videos",
    creator: "Roman Paolucci",
    url: "https://github.com/romanmichaelpaolucci/Quant-Guild-Library",
    type: "practice",
    level: "intermediate",
  }),
  {
    skillId: "low-latency-cpp",
    title: "When Nanoseconds Matter: Ultrafast Trading Systems in C++ (CppCon 2024)",
    creator: "Optiver (David Gross)",
    url: "https://www.optiver.com/insights/technology-blog/designing-low-latency-cpp-systems/",
    type: "course page",
    level: "advanced",
  },
  {
    skillId: "low-latency-cpp",
    title: "When a Microsecond Is an Eternity (CppCon 2017)",
    creator: "Carl Cook",
    url: "https://isocpp.org/blog/2018/09/cppcon-2017-when-a-microsecond-is-an-eternity-high-performance-trading-syst",
    type: "video",
    level: "advanced",
  },
];

/**
 * Stable identity for a resource. Resource has no id field of its own, so one
 * skill's checkbox state is keyed by the pair (skill, url) - which stays valid if
 * a title or creator is later corrected.
 */
export const resourceId = (r: Pick<Resource, "skillId" | "url">): string =>
  `${r.skillId}::${r.url}`;

export const resourcesBySkill = resources.reduce<Record<string, Resource[]>>(
  (acc, r) => {
    (acc[r.skillId] ??= []).push(r);
    return acc;
  },
  {},
);

/** Distinct URLs, for the link checker. */
export const uniqueResourceLinks = Array.from(
  new Map(resources.map((r) => [r.url, r])).values(),
);
