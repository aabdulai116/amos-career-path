"use client";

import { memo } from "react";
import type { Node, NodeProps } from "@xyflow/react";
import { DomainIcon } from "@/components/DomainIcon";
import { LABEL_GUTTER } from "@/lib/layout";

export interface BandNodeData extends Record<string, unknown> {
  name: string;
  color: string;
  icon: string;
  width: number;
  height: number;
  skillCount: number;
  doneCount: number;
  dimmed: boolean;
}

export type BandFlowNode = Node<BandNodeData, "band">;

/** The striped background row behind one domain, with its name in the gutter. */
function BandNodeComponent({ data }: NodeProps<BandFlowNode>) {
  const { name, color, icon, width, height, skillCount, doneCount, dimmed } =
    data;

  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(90deg, ${color}14, transparent 70%)`,
        borderColor: `${color}26`,
        opacity: dimmed ? 0.4 : 1,
      }}
      className="pointer-events-none rounded-2xl border border-dashed transition-opacity duration-200"
    >
      <div
        className="flex items-center gap-2 px-5 pt-3"
        style={{ width: LABEL_GUTTER }}
      >
        <DomainIcon name={icon} className="size-4" />
        <span className="text-sm font-semibold tracking-tight">{name}</span>
        <span className="ml-auto font-mono text-[11px] text-[var(--muted)]">
          {doneCount}/{skillCount}
        </span>
      </div>
    </div>
  );
}

export const BandNode = memo(BandNodeComponent);
