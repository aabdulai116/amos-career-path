import dagre from "dagre";
import type { Domain, Skill } from "@/lib/types";

/**
 * Atlas layout.
 *
 * Horizontal position comes from dagre with rankdir "LR", so a skill always sits
 * to the right of everything it depends on. Vertical position is then reassigned
 * so each domain occupies its own band, in the order domains are declared - dagre
 * on its own interleaves domains and the map stops being readable.
 *
 * Inside a band, nodes are packed into as few rows as possible without two nodes
 * overlapping horizontally, keeping dagre's left-to-right order.
 */

export const NODE_WIDTH = 232;
export const NODE_HEIGHT = 86;
export const ROW_GAP = 24;
export const BAND_GAP = 60;
export const BAND_PADDING_TOP = 34;
/** Left gutter that holds the domain name. */
export const LABEL_GUTTER = 208;
const COLUMN_GAP = 26;

export interface LayoutPosition {
  x: number;
  y: number;
}

export interface LayoutBand {
  domainId: string;
  name: string;
  color: string;
  top: number;
  height: number;
  rows: number;
  skillCount: number;
}

export interface AtlasLayout {
  positions: Record<string, LayoutPosition>;
  bands: LayoutBand[];
  width: number;
  height: number;
}

/** Greedy row packing: first row whose last node ends before this one starts. */
const packIntoRows = (
  ordered: { id: string; left: number }[],
): Map<string, number> => {
  const rowEnds: number[] = [];
  const rowOf = new Map<string, number>();
  for (const node of ordered) {
    let row = rowEnds.findIndex((end) => node.left >= end + COLUMN_GAP);
    if (row === -1) {
      row = rowEnds.length;
      rowEnds.push(0);
    }
    rowEnds[row] = node.left + NODE_WIDTH;
    rowOf.set(node.id, row);
  }
  return rowOf;
};

export const layoutSkills = (
  skills: Skill[],
  domains: Domain[],
): AtlasLayout => {
  const known = new Set(skills.map((s) => s.id));

  const graph = new dagre.graphlib.Graph();
  graph.setGraph({
    rankdir: "LR",
    nodesep: ROW_GAP,
    ranksep: 110,
    marginx: 0,
    marginy: 0,
  });
  graph.setDefaultEdgeLabel(() => ({}));

  for (const skill of skills) {
    graph.setNode(skill.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  for (const skill of skills) {
    for (const prerequisite of skill.prerequisites) {
      if (known.has(prerequisite)) graph.setEdge(prerequisite, skill.id);
    }
  }
  dagre.layout(graph);

  // dagre reports centres; React Flow wants top-left corners.
  const left = new Map<string, number>();
  for (const skill of skills) {
    const node = graph.node(skill.id) as { x: number } | undefined;
    left.set(skill.id, (node?.x ?? 0) - NODE_WIDTH / 2);
  }
  const minLeft = Math.min(...left.values());
  const shift = LABEL_GUTTER - minLeft;

  const positions: Record<string, LayoutPosition> = {};
  const bands: LayoutBand[] = [];
  let cursor = 0;

  for (const domain of domains) {
    const members = skills
      .filter((s) => s.domain === domain.id)
      .map((s) => ({ id: s.id, left: (left.get(s.id) ?? 0) + shift }))
      .sort((a, b) => a.left - b.left || a.id.localeCompare(b.id));

    if (members.length === 0) continue;

    const rowOf = packIntoRows(members);
    const rows = Math.max(...rowOf.values()) + 1;
    const top = cursor;

    for (const member of members) {
      positions[member.id] = {
        x: member.left,
        y: top + BAND_PADDING_TOP + (rowOf.get(member.id) ?? 0) * (NODE_HEIGHT + ROW_GAP),
      };
    }

    const height =
      BAND_PADDING_TOP + rows * NODE_HEIGHT + (rows - 1) * ROW_GAP + ROW_GAP;
    bands.push({
      domainId: domain.id,
      name: domain.name,
      color: domain.color,
      top,
      height,
      rows,
      skillCount: members.length,
    });
    cursor = top + height + BAND_GAP;
  }

  const width =
    Math.max(0, ...Object.values(positions).map((p) => p.x + NODE_WIDTH)) + 80;

  return {
    positions,
    bands,
    width,
    height: Math.max(0, cursor - BAND_GAP),
  };
};
