"use client";

import type { Greenhouse, PlanterBoxPublic } from "@greenspace/shared";
import { SoenMap } from "./SoenMap";
import { KronenMap } from "./KronenMap";

interface GreenhouseMapProps {
  greenhouse: Greenhouse;
  boxes: PlanterBoxPublic[];
  onSelectBox?: (boxId: number) => void;
}

export function GreenhouseMap({ greenhouse, boxes, onSelectBox }: GreenhouseMapProps) {
  if (greenhouse === "Søen") {
    return <SoenMap boxes={boxes} onSelectBox={onSelectBox} />;
  }

  return <KronenMap boxes={boxes} onSelectBox={onSelectBox} />;
}
