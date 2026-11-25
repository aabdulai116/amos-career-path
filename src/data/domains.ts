import type { Domain } from "@/lib/types";

/** Ordered left to right; the Atlas lays out columns in this order. */
export const domains: Domain[] = [
  {
    id: "programming",
    name: "Programming",
    color: "#38bdf8",
    icon: "Code2",
  },
  {
    id: "dsa",
    name: "DSA",
    color: "#a78bfa",
    icon: "Binary",
  },
  {
    id: "cs-core",
    name: "CS Core",
    color: "#f472b6",
    icon: "Cpu",
  },
  {
    id: "math",
    name: "Math",
    color: "#facc15",
    icon: "Sigma",
  },
  {
    id: "frontend",
    name: "Frontend",
    color: "#34d399",
    icon: "LayoutDashboard",
  },
  {
    id: "backend",
    name: "Backend",
    color: "#fb923c",
    icon: "Server",
  },
  {
    id: "cloud",
    name: "Cloud/DevOps",
    color: "#22d3ee",
    icon: "Cloud",
  },
  {
    id: "ai",
    name: "AI",
    color: "#c084fc",
    icon: "BrainCircuit",
  },
  {
    id: "quant",
    name: "Quant",
    color: "#4ade80",
    icon: "TrendingUp",
  },
  {
    id: "career",
    name: "Career",
    color: "#f87171",
    icon: "Target",
  },
];

export const domainById: Record<string, Domain> = Object.fromEntries(
  domains.map((d) => [d.id, d]),
);
