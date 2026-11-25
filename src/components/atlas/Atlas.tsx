"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { BandNode, type BandFlowNode } from "@/components/atlas/BandNode";
import { FilterBar } from "@/components/atlas/FilterBar";
import { SkillNode, type SkillFlowNode } from "@/components/atlas/SkillNode";
import { SkillPanel } from "@/components/atlas/SkillPanel";
import { domainById, domains } from "@/data/domains";
import { pathById, paths } from "@/data/paths";
import { resourcesBySkill } from "@/data/resources";
import { skillById, skills } from "@/data/skills";
import { buildEdges, computeFocus } from "@/lib/atlas";
import { computeStatuses } from "@/lib/graph";
import { NODE_HEIGHT, NODE_WIDTH, layoutSkills } from "@/lib/layout";
import { useProgress } from "@/store/progress";
import { useHydrateProgress } from "@/store/useHydrateProgress";

const nodeTypes = { skill: SkillNode, band: BandNode };

/** Layout is content-only, so it is computed once for the life of the page. */
const layout = layoutSkills(skills, domains);
const baseEdges = buildEdges(skills);

function AtlasCanvas() {
  const { setCenter } = useReactFlow();
  const [query, setQuery] = useState("");
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
  // null = nothing chosen here yet, so a ?skill= link decides. Any open or close
  // in this session takes over from the URL.
  const [selection, setSelection] = useState<{ id: string | null } | null>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const searchParams = useSearchParams();
  const linked = searchParams.get("skill");
  const linkedSkillId = linked !== null && skillById[linked] ? linked : null;
  const selectedSkillId = selection ? selection.id : linkedSkillId;

  useHydrateProgress();
  const progress = useProgress((s) => s.skills);
  const customResources = useProgress((s) => s.customResources);
  const selectedPathId = useProgress((s) => s.settings.selectedPathId);
  const setSelectedPath = useProgress((s) => s.setSelectedPath);
  const setStatus = useProgress((s) => s.setStatus);
  const setNotes = useProgress((s) => s.setNotes);
  const setProofUrl = useProgress((s) => s.setProofUrl);
  const toggleResource = useProgress((s) => s.toggleResource);
  const logHours = useProgress((s) => s.logHours);
  const addCustomResource = useProgress((s) => s.addCustomResource);
  const removeCustomResource = useProgress((s) => s.removeCustomResource);

  const statuses = useMemo(
    () => computeStatuses(skills, progress),
    [progress],
  );

  const path = selectedPathId ? (pathById[selectedPathId] ?? null) : null;
  const focus = useMemo(
    () =>
      computeFocus(
        skills,
        { domainIds: selectedDomainIds, pathId: selectedPathId, query },
        path,
      ),
    [selectedDomainIds, selectedPathId, query, path],
  );

  const openSkill = useCallback((id: string) => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    setSelection({ id });
  }, []);

  const closePanel = useCallback(() => {
    setSelection({ id: null });
    lastFocused.current?.focus();
  }, []);

  // Centre the map on a skill arrived at from a /?skill= link. setCenter talks
  // to React Flow, not to React state, so this stays a plain side effect.
  useEffect(() => {
    if (linkedSkillId === null) return;
    const position = layout.positions[linkedSkillId];
    if (position) {
      setCenter(position.x + NODE_WIDTH / 2, position.y + NODE_HEIGHT / 2, {
        zoom: 1,
        duration: 450,
      });
    }
  }, [linkedSkillId, setCenter]);

  const jumpToSkill = useCallback(
    (id: string) => {
      const position = layout.positions[id];
      if (position) {
        setCenter(position.x + NODE_WIDTH / 2, position.y + NODE_HEIGHT / 2, {
          zoom: 1,
          duration: 450,
        });
      }
      openSkill(id);
    },
    [setCenter, openSkill],
  );

  const nodes = useMemo<Node[]>(() => {
    const bandNodes: BandFlowNode[] = layout.bands.map((band) => {
      const members = skills.filter((s) => s.domain === band.domainId);
      return {
        id: `band-${band.domainId}`,
        type: "band",
        position: { x: 0, y: band.top },
        // Declared up front rather than measured: React Flow then lays the map
        // out on the first frame (no shift) and the minimap can draw the node.
        width: layout.width,
        height: band.height,
        draggable: false,
        selectable: false,
        focusable: false,
        zIndex: -1,
        data: {
          name: band.name,
          color: band.color,
          icon: domainById[band.domainId]?.icon ?? "Code2",
          width: layout.width,
          height: band.height,
          skillCount: band.skillCount,
          doneCount: members.filter((s) => statuses[s.id] === "done").length,
          dimmed:
            selectedDomainIds.length > 0 &&
            !selectedDomainIds.includes(band.domainId),
        },
      };
    });

    const skillNodes: SkillFlowNode[] = skills.map((skill) => {
      const curated = resourcesBySkill[skill.id] ?? [];
      const mine = customResources.filter((r) => r.skillId === skill.id);
      const ids = new Set([
        ...curated.map((r) => `${r.skillId}::${r.url}`),
        ...mine.map((r) => r.id),
      ]);
      const watched = (progress[skill.id]?.resourcesWatched ?? []).filter((id) =>
        ids.has(id),
      );
      return {
        id: skill.id,
        type: "skill",
        position: layout.positions[skill.id],
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        draggable: false,
        data: {
          skill,
          status: statuses[skill.id] ?? "locked",
          color: domainById[skill.domain]?.color ?? "#8d9bb0",
          dimmed: focus.filtering && !focus.activeIds.has(skill.id),
          matched: focus.matchIds.has(skill.id),
          onPath: focus.pathIds?.has(skill.id) ?? false,
          resourcesTotal: ids.size,
          resourcesWatched: watched.length,
          onActivate: openSkill,
        },
      };
    });

    return [...bandNodes, ...skillNodes];
  }, [statuses, focus, progress, customResources, selectedDomainIds, openSkill]);

  const edges = useMemo<Edge[]>(
    () =>
      baseEdges.map((edge) => {
        const sourceDone = statuses[edge.source] === "done";
        const lit =
          !focus.filtering ||
          (focus.activeIds.has(edge.source) && focus.activeIds.has(edge.target));
        const color =
          domainById[skillById[edge.source]?.domain ?? ""]?.color ?? "#3a4555";
        return {
          ...edge,
          // A prerequisite you have finished shows the path flowing onward.
          animated: sourceDone && lit,
          style: {
            stroke: sourceDone ? color : "#2b3543",
            strokeWidth: sourceDone ? 1.6 : 1,
            opacity: lit ? (sourceDone ? 0.85 : 0.45) : 0.06,
          },
        };
      }),
    [statuses, focus],
  );

  const toggleDomain = useCallback((id: string) => {
    setSelectedDomainIds((current) =>
      current.includes(id)
        ? current.filter((d) => d !== id)
        : [...current, id],
    );
  }, []);

  const selectedSkill = selectedSkillId ? skillById[selectedSkillId] : undefined;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <FilterBar
        skills={skills}
        domains={domains}
        paths={paths}
        query={query}
        onQueryChange={setQuery}
        selectedDomainIds={selectedDomainIds}
        onToggleDomain={toggleDomain}
        selectedPathId={selectedPathId}
        onSelectPath={setSelectedPath}
        onJumpToSkill={jumpToSkill}
        activeCount={focus.activeIds.size}
        totalCount={skills.length}
      />

      <div className="relative min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          nodesFocusable={false}
          edgesFocusable={false}
          elementsSelectable
          minZoom={0.08}
          maxZoom={1.8}
          // The map is far taller than one screen, so fitView would open it at an
          // unreadable zoom. Start readable at the top-left; "fit view" is one
          // click away in the controls.
          defaultViewport={{ x: 24, y: 16, zoom: 0.8 }}
          proOptions={{ hideAttribution: false }}
          onNodeClick={(_, node) => {
            if (node.type === "skill") openSkill(node.id);
          }}
          onPaneClick={() => setSelection({ id: null })}
          className="bg-[var(--background)]"
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={1}
            color="#1b2432"
          />
          <Controls
            position="bottom-left"
            showInteractive={false}
            className="!border-[var(--border)] !bg-[var(--surface)] [&_button]:!border-[var(--border)] [&_button]:!bg-[var(--surface)] [&_button]:!fill-[var(--foreground)]"
          />
          <MiniMap
            pannable
            zoomable
            position="bottom-right"
            ariaLabel="Skill map overview"
            bgColor="#0d1218"
            maskColor="#060a0fcc"
            maskStrokeColor="#38bdf8"
            maskStrokeWidth={3}
            style={{ width: 176, height: 132 }}
            // On a phone the minimap would cover most of the canvas.
            className="!m-3 !hidden !rounded-lg !border !border-[var(--border)] sm:!block"
            nodeColor={(node) =>
              node.type === "band"
                ? "transparent"
                : ((node.data as { color?: string }).color ?? "#8d9bb0")
            }
          />
        </ReactFlow>

        {selectedSkill && (
          <div className="absolute inset-y-0 right-0 z-20 w-full max-w-[26rem] shadow-2xl shadow-black/50">
            <SkillPanel
              key={selectedSkill.id}
              skill={selectedSkill}
              status={statuses[selectedSkill.id] ?? "locked"}
              progress={progress[selectedSkill.id]}
              statuses={statuses}
              allSkills={skills}
              customResources={customResources}
              onClose={closePanel}
              onSelectSkill={jumpToSkill}
              onToggleResource={(id) => toggleResource(selectedSkill.id, id)}
              onSetNotes={(value) => setNotes(selectedSkill.id, value)}
              onSetProofUrl={(value) => setProofUrl(selectedSkill.id, value)}
              onLogHours={(hours) => logHours(selectedSkill.id, hours)}
              onSetStatus={(status) => setStatus(selectedSkill.id, status)}
              onAddResource={(title, url) =>
                addCustomResource(selectedSkill.id, title, url)
              }
              onRemoveResource={removeCustomResource}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function Atlas() {
  return (
    <ReactFlowProvider>
      <AtlasCanvas />
    </ReactFlowProvider>
  );
}
