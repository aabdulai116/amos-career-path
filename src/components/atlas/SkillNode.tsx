"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Check, Circle, Loader, Lock } from "lucide-react";
import { NODE_HEIGHT, NODE_WIDTH } from "@/lib/layout";
import type { Skill, SkillStatus } from "@/lib/types";

export interface SkillNodeData extends Record<string, unknown> {
  skill: Skill;
  status: SkillStatus;
  color: string;
  dimmed: boolean;
  matched: boolean;
  onPath: boolean;
  resourcesTotal: number;
  resourcesWatched: number;
  /** Opens the side panel; also bound to Enter and Space for keyboard users. */
  onActivate: (id: string) => void;
}

export type SkillFlowNode = Node<SkillNodeData, "skill">;

const statusLabel: Record<SkillStatus, string> = {
  locked: "Locked",
  available: "Available",
  in_progress: "In progress",
  done: "Done",
};

const StatusIcon = ({ status }: { status: SkillStatus }) => {
  const className = "size-3.5 shrink-0";
  if (status === "done") return <Check className={className} aria-hidden />;
  if (status === "in_progress")
    return <Loader className={className} aria-hidden />;
  if (status === "locked") return <Lock className={className} aria-hidden />;
  return <Circle className={className} aria-hidden />;
};

function SkillNodeComponent({ data, selected }: NodeProps<SkillFlowNode>) {
  const {
    skill,
    status,
    color,
    dimmed,
    matched,
    resourcesTotal,
    resourcesWatched,
    onActivate,
  } = data;

  const done = status === "done";
  const locked = status === "locked";
  const watchedPercent =
    resourcesTotal === 0
      ? 0
      : Math.round((resourcesWatched / resourcesTotal) * 100);

  return (
    <div
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate(skill.id);
        }
      }}
      style={{
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        borderColor: selected || matched ? color : undefined,
        boxShadow: matched ? `0 0 0 2px ${color}66` : undefined,
        opacity: dimmed ? 0.22 : 1,
      }}
      className={[
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-[var(--surface-raised)] px-3 py-2.5 transition-[opacity,border-color] duration-200",
        selected || matched ? "" : "border-[var(--border)]",
        locked ? "text-[var(--muted)]" : "text-[var(--foreground)]",
        "cursor-pointer focus-visible:outline-2",
      ].join(" ")}
      aria-label={`${skill.name}. ${statusLabel[status]}.`}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={false}
        className="!size-1.5 !border-0 !bg-[var(--border)]"
      />

      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{ background: color, opacity: locked ? 0.35 : 1 }}
      />

      <div className="flex items-start gap-2 pl-1.5">
        <span
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full"
          style={{
            background: done ? color : "transparent",
            border: done ? "none" : `1px solid ${color}`,
            color: done ? "#0a0d12" : color,
          }}
        >
          <StatusIcon status={status} />
        </span>
        <span
          className={`line-clamp-2 text-[13px] leading-snug font-medium ${
            done ? "line-through decoration-1" : ""
          }`}
        >
          {skill.name}
        </span>
      </div>

      <div className="flex items-center gap-2 pl-1.5">
        <span className="font-mono text-[10px] text-[var(--muted)]">
          L{skill.level} · {skill.estHours}h
        </span>
        <span className="flex-1" />
        {resourcesTotal > 0 && (
          <span className="font-mono text-[10px] text-[var(--muted)]">
            {resourcesWatched}/{resourcesTotal}
          </span>
        )}
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-1 bg-[var(--border)]"
        role="presentation"
      >
        <div
          className="h-full transition-[width] duration-300"
          style={{ width: `${watchedPercent}%`, background: color }}
        />
      </div>

      <Handle
        type="source"
        position={Position.Right}
        isConnectable={false}
        className="!size-1.5 !border-0 !bg-[var(--border)]"
      />
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);
