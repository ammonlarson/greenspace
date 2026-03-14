"use client";

import type { PlanterBoxPublic } from "@greenspace/shared";
import { SoenMap } from "./SoenMap";
import { KronenMap } from "./KronenMap";

interface GreenhouseMapProps {
  boxes: PlanterBoxPublic[];
  onSelectBox?: (boxId: number) => void;
}

export function GreenhouseMap({ boxes, onSelectBox }: GreenhouseMapProps) {
  if (boxes.length === 0) return null;

  const greenhouse = boxes[0].greenhouse;

  if (greenhouse === "Søen") {
    return <SoenMap boxes={boxes} onSelectBox={onSelectBox} />;
  }

  return <KronenMap boxes={boxes} onSelectBox={onSelectBox} />;
}
