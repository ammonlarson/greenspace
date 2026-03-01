import type { BoxState } from "@greenspace/shared";

export const BOX_STATE_COLORS: Record<BoxState, { background: string; text: string; border: string }> = {
  available: { background: "#e8f5e9", text: "#2d7a3a", border: "#a5d6a7" },
  occupied: { background: "#fff3e0", text: "#e65100", border: "#ffcc80" },
  reserved: { background: "#e3f2fd", text: "#1565c0", border: "#90caf9" },
};
