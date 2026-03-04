"use client";

import { useCallback, useEffect, useState } from "react";
import type { BoxState } from "@greenspace/shared";
import { useLanguage } from "@/i18n/LanguageProvider";
import { BOX_STATE_COLORS } from "./boxStateColors";

interface Box {
  id: number;
  name: string;
  greenhouse: string;
  state: BoxState;
}

export function AdminBoxes() {
  const { t } = useLanguage();
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBoxes = useCallback(async () => {
    try {
      const res = await fetch("/public/boxes", { credentials: "include" });
      if (res.ok) {
        setBoxes(await res.json());
      }
    } catch {
      /* network error */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoxes();
  }, [fetchBoxes]);

  if (loading) {
    return <p>{t("common.loading")}</p>;
  }

  const greenhouses = [...new Set(boxes.map((b) => b.greenhouse))];

  return (
    <section>
      <h2 style={{ marginBottom: "1rem" }}>{t("admin.boxes.title")}</h2>

      {greenhouses.map((gh) => {
        const ghBoxes = boxes.filter((b) => b.greenhouse === gh);
        const available = ghBoxes.filter((b) => b.state === "available").length;
        const occupied = ghBoxes.filter((b) => b.state === "occupied").length;
        const reserved = ghBoxes.filter((b) => b.state === "reserved").length;

        return (
          <div key={gh} style={{ marginBottom: "2rem" }}>
            <h3 style={{ marginBottom: "0.5rem" }}>
              {gh}
              <span style={{ fontSize: "0.8rem", fontWeight: 400, color: "#555", marginLeft: "0.75rem" }}>
                {available} {t("greenhouse.available")} / {occupied} {t("greenhouse.occupied")} / {reserved} {t("greenhouse.reserved")}
              </span>
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                gap: "0.5rem",
              }}
            >
              {ghBoxes.map((box) => {
                const colors = BOX_STATE_COLORS[box.state];
                return (
                  <div
                    key={box.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.2rem",
                      padding: "0.6rem 0.4rem",
                      border: `2px solid ${colors.border}`,
                      borderRadius: 8,
                      background: colors.background,
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem", fontWeight: 700 }}>#{box.id}</span>
                    <span style={{ fontSize: "0.8rem", color: "#555" }}>{box.name}</span>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: colors.text,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {t(`map.state.${box.state}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
