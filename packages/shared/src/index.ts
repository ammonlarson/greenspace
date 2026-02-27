export const GREENHOUSES = ["Kronen", "Søen"] as const;
export type Greenhouse = (typeof GREENHOUSES)[number];
