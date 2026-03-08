export const colors = {
  sage: "#6B8F71",
  lightSage: "#E8F0E9",
  warmBrown: "#5D4E37",
  borderTan: "#D4C5A9",
  parchment: "#F5F0E8",
  parchmentDark: "#EDE6D6",
  white: "#FFFFFF",
  dustyRose: "#C17C74",
  terracotta: "#C4703F",
} as const;

export const fonts = {
  heading: "'Playfair Display', Georgia, serif",
  body: "'Lato', 'Segoe UI', sans-serif",
} as const;

export const shadows = {
  card: "0 2px 8px rgba(93, 78, 55, 0.10)",
} as const;

export const alertError: React.CSSProperties = {
  background: "#FEF0F0",
  border: `1px solid ${colors.dustyRose}`,
  borderRadius: 6,
  padding: "0.75rem",
  fontSize: "0.85rem",
  color: colors.dustyRose,
};

export const alertWarning: React.CSSProperties = {
  background: "#FFF8E1",
  border: `1px solid ${colors.terracotta}`,
  borderRadius: 6,
  padding: "0.75rem",
  fontSize: "0.85rem",
  color: colors.terracotta,
};
