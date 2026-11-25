import type { Skill } from "@/lib/types";

/**
 * The skill graph. Prerequisites reference skill ids and must stay acyclic;
 * src/lib/__tests__/graph.test.ts fails the build if a cycle is introduced.
 */
export const skills: Skill[] = [
  // ---------------------------------------------------------------- Programming
  {
    id: "programming-fundamentals",
    name: "Programming Fundamentals",
    domain: "programming",
    summary:
      "Variables, control flow, functions and data types in any one language, well enough to write a small program from scratch.",
    prerequisites: [],
    estHours: 20,
    level: 1,
  },
  {
    id: "python-fundamentals",
    name: "Python Fundamentals",
    domain: "programming",
    summary:
      "Idiomatic Python: comprehensions, slicing, the standard library and virtual environments.",
    prerequisites: ["programming-fundamentals"],
    estHours: 40,
    level: 1,
  },
  {
    id: "javascript-basics",
    name: "JavaScript Basics",
    domain: "programming",
    summary:
      "Modern JavaScript: closures, promises, async/await, modules and the event loop.",
    prerequisites: ["programming-fundamentals"],
    estHours: 30,
    level: 1,
  },
  {
    id: "typescript",
    name: "TypeScript",
    domain: "programming",
    summary:
      "Static types for JavaScript: generics, unions, narrowing and how to model data so bad states do not compile.",
    prerequisites: ["javascript-basics"],
    estHours: 20,
    level: 2,
  },
  {
    id: "command-line",
    name: "Command Line & Shell",
    domain: "programming",
    summary:
      "Navigate a Unix shell, pipe commands together and automate repetitive work with small scripts.",
    prerequisites: [],
    estHours: 10,
    level: 1,
  },
  {
    id: "git-github",
    name: "Git & GitHub",
    domain: "programming",
    summary:
      "Branch, rebase, resolve conflicts and use pull requests the way a real team does.",
    prerequisites: ["command-line"],
    estHours: 10,
    level: 1,
  },
  {
    id: "debugging",
    name: "Debugging & Tooling",
    domain: "programming",
    summary:
      "Read a stack trace, step through code in a debugger and shrink a bug to a minimal reproduction.",
    prerequisites: ["programming-fundamentals", "command-line"],
    estHours: 12,
    level: 2,
  },
  {
    id: "oop-design",
    name: "Object-Oriented Design",
    domain: "programming",
    summary:
      "Model a problem with classes and interfaces, and know when composition beats inheritance.",
    prerequisites: ["programming-fundamentals"],
    estHours: 20,
    level: 2,
  },
  {
    id: "testing-fundamentals",
    name: "Testing & Test Design",
    domain: "programming",
    summary:
      "Write unit and integration tests that actually catch regressions, including edge and failure cases.",
    prerequisites: ["programming-fundamentals"],
    estHours: 15,
    level: 2,
  },
  {
    id: "cpp-fundamentals",
    name: "C++ Fundamentals",
    domain: "programming",
    summary:
      "C++ syntax, headers, references, the STL containers and how a translation unit becomes a binary.",
    prerequisites: ["programming-fundamentals"],
    estHours: 40,
    level: 2,
  },
  {
    id: "modern-cpp",
    name: "Modern C++ & Performance",
    domain: "programming",
    summary:
      "RAII, move semantics, templates and measuring where the time actually goes in C++17 and later.",
    prerequisites: ["cpp-fundamentals", "memory-management"],
    estHours: 45,
    level: 3,
  },
  {
    id: "code-review-craft",
    name: "Clean Code & Code Review",
    domain: "programming",
    summary:
      "Write code other people can change, and give review feedback that is specific and kind.",
    prerequisites: ["oop-design", "git-github"],
    estHours: 12,
    level: 2,
  },

  // ----------------------------------------------------------------------- DSA
  {
    id: "big-o",
    name: "Big-O & Complexity Analysis",
    domain: "dsa",
    summary:
      "Reason about time and space cost of code without running it, including amortised and average cases.",
    prerequisites: ["programming-fundamentals"],
    estHours: 10,
    level: 1,
  },
  {
    id: "arrays-strings",
    name: "Arrays & Strings",
    domain: "dsa",
    summary:
      "In-place manipulation, prefix sums and the string problems that show up in every screen.",
    prerequisites: ["big-o"],
    estHours: 15,
    level: 1,
  },
  {
    id: "hashing",
    name: "Hash Maps & Sets",
    domain: "dsa",
    summary:
      "How hashing works under the hood and how to trade memory for lookup speed.",
    prerequisites: ["arrays-strings"],
    estHours: 10,
    level: 1,
  },
  {
    id: "two-pointers-sliding-window",
    name: "Two Pointers & Sliding Window",
    domain: "dsa",
    summary:
      "Turn nested-loop scans into linear passes over arrays and strings.",
    prerequisites: ["arrays-strings"],
    estHours: 12,
    level: 2,
  },
  {
    id: "linked-lists",
    name: "Linked Lists",
    domain: "dsa",
    summary:
      "Pointer surgery: reversal, cycle detection and merging, without losing track of nodes.",
    prerequisites: ["arrays-strings"],
    estHours: 10,
    level: 1,
  },
  {
    id: "stacks-queues",
    name: "Stacks & Queues",
    domain: "dsa",
    summary:
      "Monotonic stacks, deques and the problems that become easy once you pick the right one.",
    prerequisites: ["linked-lists"],
    estHours: 10,
    level: 1,
  },
  {
    id: "sorting",
    name: "Sorting Algorithms",
    domain: "dsa",
    summary:
      "Merge, quick, heap and counting sort, their costs and when sorting first simplifies a problem.",
    prerequisites: ["big-o", "arrays-strings"],
    estHours: 15,
    level: 2,
  },
  {
    id: "binary-search",
    name: "Binary Search",
    domain: "dsa",
    summary:
      "Search sorted data and, more usefully, binary search over an answer space.",
    prerequisites: ["sorting"],
    estHours: 10,
    level: 2,
  },
  {
    id: "recursion-backtracking",
    name: "Recursion & Backtracking",
    domain: "dsa",
    summary:
      "Define a problem in terms of itself, then prune the search tree so it finishes in time.",
    prerequisites: ["arrays-strings"],
    estHours: 18,
    level: 2,
  },
  {
    id: "trees",
    name: "Trees & Binary Search Trees",
    domain: "dsa",
    summary:
      "Traversals, balanced trees, tries and the recursive shape most tree problems share.",
    prerequisites: ["recursion-backtracking", "stacks-queues"],
    estHours: 20,
    level: 2,
  },
  {
    id: "heaps",
    name: "Heaps & Priority Queues",
    domain: "dsa",
    summary:
      "Keep the top-k of a stream and feed the greedy algorithms that need a cheapest-next choice.",
    prerequisites: ["trees"],
    estHours: 10,
    level: 2,
  },
  {
    id: "graphs",
    name: "Graph Algorithms",
    domain: "dsa",
    summary:
      "Represent graphs, then walk them with BFS, DFS, topological sort and union-find.",
    prerequisites: ["trees", "hashing"],
    estHours: 25,
    level: 3,
  },
  {
    id: "shortest-paths",
    name: "Shortest Paths & MSTs",
    domain: "dsa",
    summary:
      "Dijkstra, Bellman-Ford, Floyd-Warshall and the minimum spanning tree algorithms.",
    prerequisites: ["graphs", "heaps"],
    estHours: 15,
    level: 3,
  },
  {
    id: "dynamic-programming",
    name: "Dynamic Programming",
    domain: "dsa",
    summary:
      "Spot overlapping subproblems, write the recurrence, then memoise or build the table bottom-up.",
    prerequisites: ["recursion-backtracking", "big-o"],
    estHours: 30,
    level: 3,
  },
  {
    id: "greedy",
    name: "Greedy Algorithms",
    domain: "dsa",
    summary:
      "Pick the locally best option and be able to argue why that is globally optimal here.",
    prerequisites: ["sorting"],
    estHours: 10,
    level: 2,
  },
  {
    id: "interview-problem-solving",
    name: "Interview Problem Solving",
    domain: "dsa",
    summary:
      "Pattern recognition plus timed practice: talk through a solution, code it clean and test it out loud.",
    prerequisites: [
      "dynamic-programming",
      "graphs",
      "binary-search",
      "two-pointers-sliding-window",
    ],
    estHours: 60,
    level: 3,
  },

  // ------------------------------------------------------------------- CS Core
  {
    id: "computer-architecture",
    name: "Computer Architecture",
    domain: "cs-core",
    summary:
      "From transistors to instructions: registers, the memory hierarchy, caches and pipelines.",
    prerequisites: ["programming-fundamentals"],
    estHours: 20,
    level: 1,
  },
  {
    id: "memory-management",
    name: "Memory, Pointers & Allocation",
    domain: "cs-core",
    summary:
      "Stack versus heap, pointer arithmetic, alignment, leaks and what cache locality costs you.",
    prerequisites: ["computer-architecture"],
    estHours: 18,
    level: 2,
  },
  {
    id: "operating-systems",
    name: "Operating Systems",
    domain: "cs-core",
    summary:
      "Processes, threads, scheduling, virtual memory, syscalls and file systems.",
    prerequisites: ["memory-management"],
    estHours: 40,
    level: 3,
  },
  {
    id: "concurrency",
    name: "Concurrency & Parallelism",
    domain: "cs-core",
    summary:
      "Locks, atomics, memory ordering and lock-free queues, plus the race conditions they prevent.",
    prerequisites: ["operating-systems"],
    estHours: 30,
    level: 3,
  },
  {
    id: "networking-http",
    name: "Networking & HTTP",
    domain: "cs-core",
    summary:
      "The path a packet takes: IP, TCP, UDP, DNS, TLS and the HTTP semantics on top.",
    prerequisites: ["programming-fundamentals"],
    estHours: 25,
    level: 2,
  },
  {
    id: "databases-sql",
    name: "Databases & SQL",
    domain: "cs-core",
    summary:
      "Joins, aggregation, window functions and reading a query plan without guessing.",
    prerequisites: ["programming-fundamentals"],
    estHours: 20,
    level: 1,
  },
  {
    id: "db-internals",
    name: "Database Internals",
    domain: "cs-core",
    summary:
      "B-trees, buffer pools, transactions, isolation levels and write-ahead logging.",
    prerequisites: ["databases-sql", "operating-systems"],
    estHours: 30,
    level: 3,
  },
  {
    id: "compilers-languages",
    name: "Compilers & Language Runtimes",
    domain: "cs-core",
    summary:
      "Lexing, parsing, IR and optimisation, plus how garbage collectors and JITs behave at runtime.",
    prerequisites: ["memory-management", "recursion-backtracking"],
    estHours: 30,
    level: 3,
  },
  {
    id: "linux-systems",
    name: "Linux & Systems Tooling",
    domain: "cs-core",
    summary:
      "Processes, permissions, systemd and the perf, strace and htop tools you reach for when something is slow.",
    prerequisites: ["command-line", "operating-systems"],
    estHours: 20,
    level: 2,
  },
  {
    id: "security-basics",
    name: "Security Fundamentals",
    domain: "cs-core",
    summary:
      "Threat modelling, hashing versus encryption, and the injection and XSS classes of bug.",
    prerequisites: ["networking-http"],
    estHours: 15,
    level: 2,
  },

  // ---------------------------------------------------------------------- Math
  {
    id: "linear-algebra",
    name: "Linear Algebra",
    domain: "math",
    summary:
      "Vectors, matrices, eigendecomposition and SVD, with a geometric picture of what each one does.",
    prerequisites: [],
    estHours: 30,
    level: 1,
  },
  {
    id: "calculus-optimization",
    name: "Calculus & Optimization",
    domain: "math",
    summary:
      "Derivatives, gradients, Taylor expansion and gradient-based and convex optimisation.",
    prerequisites: [],
    estHours: 30,
    level: 1,
  },
  {
    id: "probability",
    name: "Probability",
    domain: "math",
    summary:
      "Distributions, conditioning, Bayes, expectation, variance and the limit theorems.",
    prerequisites: ["calculus-optimization"],
    estHours: 35,
    level: 2,
  },
  {
    id: "statistics-inference",
    name: "Statistics & Inference",
    domain: "math",
    summary:
      "Estimators, confidence intervals, hypothesis tests, regression and what a p-value does not mean.",
    prerequisites: ["probability"],
    estHours: 30,
    level: 2,
  },

  // ------------------------------------------------------------------ Frontend
  {
    id: "html-css",
    name: "HTML & CSS",
    domain: "frontend",
    summary:
      "Semantic markup plus the box model, flexbox and grid for laying a page out.",
    prerequisites: [],
    estHours: 20,
    level: 1,
  },
  {
    id: "responsive-design",
    name: "Responsive Design & Accessibility",
    domain: "frontend",
    summary:
      "Build layouts that work on any screen and are usable with a keyboard and a screen reader.",
    prerequisites: ["html-css"],
    estHours: 12,
    level: 1,
  },
  {
    id: "dom-browser",
    name: "DOM & Browser APIs",
    domain: "frontend",
    summary:
      "Events, fetch, storage and the render pipeline that decides when the browser repaints.",
    prerequisites: ["html-css", "javascript-basics"],
    estHours: 15,
    level: 2,
  },
  {
    id: "react",
    name: "React",
    domain: "frontend",
    summary:
      "Components, props, hooks and the render model that explains why a component re-renders.",
    prerequisites: ["dom-browser"],
    estHours: 30,
    level: 2,
  },
  {
    id: "react-state",
    name: "React State & Data Fetching",
    domain: "frontend",
    summary:
      "Local, global and server state, plus caching, loading and error handling for real data.",
    prerequisites: ["react"],
    estHours: 20,
    level: 2,
  },
  {
    id: "nextjs",
    name: "Next.js & Rendering Models",
    domain: "frontend",
    summary:
      "App Router, server and client components, and when to render on the server, at build time or in the browser.",
    prerequisites: ["react-state", "typescript"],
    estHours: 25,
    level: 3,
  },
  {
    id: "tailwind-design-systems",
    name: "Tailwind & Design Systems",
    domain: "frontend",
    summary:
      "Build a consistent UI from design tokens, spacing scales and reusable components.",
    prerequisites: ["responsive-design"],
    estHours: 12,
    level: 2,
  },
  {
    id: "frontend-testing",
    name: "Frontend Testing",
    domain: "frontend",
    summary:
      "Test components and user flows by behaviour rather than by implementation detail.",
    prerequisites: ["react", "testing-fundamentals"],
    estHours: 12,
    level: 2,
  },

  // ------------------------------------------------------------------- Backend
  {
    id: "http-apis",
    name: "REST APIs & HTTP Servers",
    domain: "backend",
    summary:
      "Design and build HTTP endpoints with sane status codes, validation and pagination.",
    prerequisites: ["networking-http", "programming-fundamentals"],
    estHours: 25,
    level: 2,
  },
  {
    id: "auth-sessions",
    name: "Auth, Sessions & JWT",
    domain: "backend",
    summary:
      "Password hashing, sessions, tokens and OAuth flows, and the mistakes that leak accounts.",
    prerequisites: ["http-apis", "security-basics"],
    estHours: 15,
    level: 2,
  },
  {
    id: "data-modeling",
    name: "Data Modeling & Schema Design",
    domain: "backend",
    summary:
      "Normalisation, keys, indexes and migrations that do not lock the table for an hour.",
    prerequisites: ["databases-sql"],
    estHours: 15,
    level: 2,
  },
  {
    id: "orm-persistence",
    name: "ORMs & Persistence Layers",
    domain: "backend",
    summary:
      "Map objects to rows, control transactions and avoid the N+1 query trap.",
    prerequisites: ["data-modeling", "http-apis"],
    estHours: 12,
    level: 2,
  },
  {
    id: "caching-queues",
    name: "Caching, Queues & Background Jobs",
    domain: "backend",
    summary:
      "Redis, invalidation strategies, message queues and work that must survive a restart.",
    prerequisites: ["http-apis", "data-modeling"],
    estHours: 20,
    level: 3,
  },
  {
    id: "graphql-grpc",
    name: "GraphQL & gRPC",
    domain: "backend",
    summary:
      "Schema-first and binary RPC alternatives to REST, and the cases where each wins.",
    prerequisites: ["http-apis"],
    estHours: 15,
    level: 2,
  },
  {
    id: "system-design",
    name: "Microservices & System Design",
    domain: "backend",
    summary:
      "Partition a system into services, then reason about load, replication, consistency and failure.",
    prerequisites: ["caching-queues", "db-internals"],
    estHours: 35,
    level: 3,
  },
  {
    id: "system-design-interviews",
    name: "System Design Interviews",
    domain: "backend",
    summary:
      "Drive a 45-minute design round: clarify requirements, estimate load, sketch, then defend trade-offs.",
    prerequisites: ["system-design"],
    estHours: 25,
    level: 3,
  },
  {
    id: "observability",
    name: "Logging, Metrics & Observability",
    domain: "backend",
    summary:
      "Structured logs, metrics, traces and alerts that tell you what broke before a user does.",
    prerequisites: ["http-apis"],
    estHours: 12,
    level: 2,
  },

  // --------------------------------------------------------------- Cloud/DevOps
  {
    id: "docker",
    name: "Docker & Containers",
    domain: "cloud",
    summary:
      "Images, layers, volumes and networks, and writing a Dockerfile that is small and reproducible.",
    prerequisites: ["linux-systems"],
    estHours: 15,
    level: 2,
  },
  {
    id: "ci-cd",
    name: "CI/CD Pipelines",
    domain: "cloud",
    summary:
      "Automate lint, test and deploy on every push so broken code never reaches main.",
    prerequisites: ["git-github", "testing-fundamentals"],
    estHours: 12,
    level: 2,
  },
  {
    id: "cloud-fundamentals",
    name: "Cloud Fundamentals (AWS)",
    domain: "cloud",
    summary:
      "Compute, storage, networking and IAM, and what each one actually costs.",
    prerequisites: ["networking-http", "linux-systems"],
    estHours: 25,
    level: 2,
  },
  {
    id: "kubernetes",
    name: "Kubernetes",
    domain: "cloud",
    summary:
      "Pods, deployments, services and the reconciliation loop that keeps them running.",
    prerequisites: ["docker", "cloud-fundamentals"],
    estHours: 25,
    level: 3,
  },
  {
    id: "iac",
    name: "Infrastructure as Code",
    domain: "cloud",
    summary:
      "Describe infrastructure in versioned files with Terraform so environments are reproducible.",
    prerequisites: ["cloud-fundamentals"],
    estHours: 15,
    level: 3,
  },
  {
    id: "deployment-scaling",
    name: "Deployment & Scaling",
    domain: "cloud",
    summary:
      "Load balancing, autoscaling, blue-green and canary releases, and rolling back fast.",
    prerequisites: ["cloud-fundamentals", "system-design"],
    estHours: 20,
    level: 3,
  },
  {
    id: "cost-reliability",
    name: "Reliability & Cost Engineering",
    domain: "cloud",
    summary:
      "SLOs, error budgets, capacity planning and spending less without getting paged more.",
    prerequisites: ["deployment-scaling", "observability"],
    estHours: 12,
    level: 3,
  },

  // ------------------------------------------------------------------------ AI
  {
    id: "numpy-pandas",
    name: "NumPy & Pandas",
    domain: "ai",
    summary:
      "Vectorised arrays and dataframes: joins, group-bys, reshaping and avoiding Python loops.",
    prerequisites: ["python-fundamentals"],
    estHours: 20,
    level: 1,
  },
  {
    id: "ml-fundamentals",
    name: "ML Fundamentals",
    domain: "ai",
    summary:
      "Linear and logistic regression, trees, SVMs, clustering and the bias-variance trade-off.",
    prerequisites: ["linear-algebra", "probability", "numpy-pandas"],
    estHours: 45,
    level: 2,
  },
  {
    id: "ml-engineering",
    name: "Feature Engineering & Model Evaluation",
    domain: "ai",
    summary:
      "Build features without leaking the target, and validate with the right metric and split.",
    prerequisites: ["ml-fundamentals", "statistics-inference"],
    estHours: 25,
    level: 2,
  },
  {
    id: "deep-learning-pytorch",
    name: "Deep Learning & PyTorch",
    domain: "ai",
    summary:
      "Backpropagation, optimisers and regularisation, implemented in PyTorch from the tensor up.",
    prerequisites: ["ml-fundamentals", "calculus-optimization"],
    estHours: 45,
    level: 3,
  },
  {
    id: "nlp-transformers",
    name: "NLP & Transformers",
    domain: "ai",
    summary:
      "Tokenisation, embeddings, attention and the transformer architecture end to end.",
    prerequisites: ["deep-learning-pytorch"],
    estHours: 35,
    level: 3,
  },
  {
    id: "llms-prompting",
    name: "LLMs & Prompt Engineering",
    domain: "ai",
    summary:
      "How pretraining, fine-tuning and inference work, and how to prompt and evaluate a model.",
    prerequisites: ["nlp-transformers"],
    estHours: 20,
    level: 2,
  },
  {
    id: "rag-agents",
    name: "RAG & Agent Systems",
    domain: "ai",
    summary:
      "Retrieval, embeddings, vector search and tool-using agents wired to real APIs.",
    prerequisites: ["llms-prompting", "http-apis"],
    estHours: 25,
    level: 3,
  },
  {
    id: "mlops",
    name: "MLOps & Model Serving",
    domain: "ai",
    summary:
      "Experiment tracking, reproducible training, model deployment and drift monitoring.",
    prerequisites: ["deep-learning-pytorch", "docker"],
    estHours: 25,
    level: 3,
  },

  // --------------------------------------------------------------------- Quant
  {
    id: "mental-math",
    name: "Mental Math & Estimation",
    domain: "quant",
    summary:
      "Fast arithmetic, percentages, fractions and Fermi estimates under interview time pressure.",
    prerequisites: [],
    estHours: 25,
    level: 1,
  },
  {
    id: "markets-101",
    name: "Markets 101",
    domain: "quant",
    summary:
      "What equities, futures and options are, who the participants are and how an exchange works.",
    prerequisites: [],
    estHours: 25,
    level: 1,
  },
  {
    id: "combinatorics-puzzles",
    name: "Combinatorics & Probability Puzzles",
    domain: "quant",
    summary:
      "Counting, symmetry and conditioning arguments for the puzzle rounds at trading firms.",
    prerequisites: ["probability"],
    estHours: 25,
    level: 2,
  },
  {
    id: "expected-value-games",
    name: "Expected Value, Games & Brainteasers",
    domain: "quant",
    summary:
      "Price a bet, compute expected value and reason about optimal play in simple games.",
    prerequisites: ["probability", "mental-math"],
    estHours: 25,
    level: 2,
  },
  {
    id: "microstructure",
    name: "Market Microstructure & Order Books",
    domain: "quant",
    summary:
      "Limit order books, matching engines, spreads, queue priority and what moves price on a short horizon.",
    prerequisites: ["markets-101"],
    estHours: 25,
    level: 2,
  },
  {
    id: "market-making",
    name: "Market Making & Trading Games",
    domain: "quant",
    summary:
      "Quote a two-sided market, manage inventory and adverse selection, and update on new information.",
    prerequisites: ["expected-value-games", "microstructure"],
    estHours: 30,
    level: 3,
  },
  {
    id: "stochastic-processes",
    name: "Stochastic Processes & Itô Calculus",
    domain: "quant",
    summary:
      "Random walks, martingales, Brownian motion, Itô's lemma and stochastic differential equations.",
    prerequisites: ["linear-algebra", "probability", "calculus-optimization"],
    estHours: 45,
    level: 3,
  },
  {
    id: "options-greeks",
    name: "Options, Greeks & Volatility",
    domain: "quant",
    summary:
      "Black-Scholes, put-call parity, the greeks and how implied volatility surfaces behave.",
    prerequisites: ["stochastic-processes", "markets-101"],
    estHours: 35,
    level: 3,
  },
  {
    id: "monte-carlo",
    name: "Monte Carlo & Numerical Methods",
    domain: "quant",
    summary:
      "Simulate paths, price by simulation, and control variance and numerical error.",
    prerequisites: ["probability", "numpy-pandas"],
    estHours: 20,
    level: 2,
  },
  {
    id: "time-series",
    name: "Time Series & Econometrics",
    domain: "quant",
    summary:
      "Stationarity, autocorrelation, ARIMA and GARCH, and regression on data that is ordered in time.",
    prerequisites: ["statistics-inference"],
    estHours: 30,
    level: 3,
  },
  {
    id: "portfolio-theory",
    name: "Portfolio Theory, Factor Models & Risk",
    domain: "quant",
    summary:
      "Mean-variance optimisation, CAPM, factor models, VaR and position sizing.",
    prerequisites: ["linear-algebra", "statistics-inference"],
    estHours: 30,
    level: 3,
  },
  {
    id: "alpha-research",
    name: "Alpha Research & Backtesting",
    domain: "quant",
    summary:
      "Build and test a signal honestly: data hygiene, no lookahead, transaction costs and overfitting controls.",
    prerequisites: ["time-series", "statistics-inference", "numpy-pandas"],
    estHours: 40,
    level: 3,
  },
  {
    id: "ml-for-finance",
    name: "ML for Finance",
    domain: "quant",
    summary:
      "Apply machine learning to low signal-to-noise financial data without fooling yourself.",
    prerequisites: ["ml-engineering", "alpha-research"],
    estHours: 30,
    level: 3,
  },
  {
    id: "low-latency-cpp",
    name: "Low Latency C++ & Systems",
    domain: "quant",
    summary:
      "Cache-friendly data structures, lock-free queues, kernel bypass and measuring latency in nanoseconds.",
    prerequisites: ["modern-cpp", "concurrency", "linux-systems"],
    estHours: 50,
    level: 3,
  },
  {
    id: "quant-interview-prep",
    name: "Quant Interview Prep",
    domain: "quant",
    summary:
      "Run the trader, researcher and developer loops: puzzles, market-making games, research deep dives and systems rounds.",
    prerequisites: [
      "market-making",
      "combinatorics-puzzles",
      "interview-problem-solving",
    ],
    estHours: 50,
    level: 3,
  },

  // -------------------------------------------------------------------- Career
  {
    id: "resume-portfolio",
    name: "Resume & Portfolio",
    domain: "career",
    summary:
      "One page of quantified, verifiable bullets, backed by projects someone can actually open.",
    prerequisites: ["git-github"],
    estHours: 10,
    level: 1,
  },
  {
    id: "behavioral-interviews",
    name: "Behavioral Interviews & Storytelling",
    domain: "career",
    summary:
      "A set of concrete stories about real work, told with the result first.",
    prerequisites: [],
    estHours: 10,
    level: 1,
  },
  {
    id: "technical-communication",
    name: "Technical Writing & Communication",
    domain: "career",
    summary:
      "Explain a design or a bug in writing so a reader who was not there understands it.",
    prerequisites: [],
    estHours: 10,
    level: 1,
  },
  {
    id: "project-shipping",
    name: "Shipping Personal Projects",
    domain: "career",
    summary:
      "Take a project from idea to deployed, documented and used by someone other than you.",
    prerequisites: ["git-github", "ci-cd"],
    estHours: 30,
    level: 2,
  },
  {
    id: "open-source",
    name: "Open Source Contribution",
    domain: "career",
    summary:
      "Find a real issue in someone else's codebase and land a reviewed pull request.",
    prerequisites: ["git-github", "code-review-craft"],
    estHours: 25,
    level: 2,
  },
  {
    id: "networking-outreach",
    name: "Networking & Recruiter Outreach",
    domain: "career",
    summary:
      "Cold emails, referrals and career fairs that lead to conversations rather than silence.",
    prerequisites: ["resume-portfolio"],
    estHours: 12,
    level: 1,
  },
  {
    id: "internship-applications",
    name: "Internship Application Pipeline",
    domain: "career",
    summary:
      "Track roles, deadlines and stages so nothing is missed once applications open.",
    prerequisites: ["resume-portfolio", "networking-outreach"],
    estHours: 15,
    level: 2,
  },
  {
    id: "offer-negotiation",
    name: "Offer Evaluation & Negotiation",
    domain: "career",
    summary:
      "Compare offers on more than base pay, and negotiate without burning the relationship.",
    prerequisites: ["internship-applications"],
    estHours: 8,
    level: 2,
  },
];

export const skillById: Record<string, Skill> = Object.fromEntries(
  skills.map((s) => [s.id, s]),
);
