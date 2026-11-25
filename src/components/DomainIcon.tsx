import {
  Binary,
  BrainCircuit,
  Cloud,
  Code2,
  Cpu,
  LayoutDashboard,
  Server,
  Sigma,
  Target,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

/** Explicit map rather than a dynamic lookup, so the bundle only ships these. */
const icons: Record<string, LucideIcon> = {
  Binary,
  BrainCircuit,
  Cloud,
  Code2,
  Cpu,
  LayoutDashboard,
  Server,
  Sigma,
  Target,
  TrendingUp,
};

export function DomainIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = icons[name] ?? Code2;
  return <Icon className={className} aria-hidden />;
}
