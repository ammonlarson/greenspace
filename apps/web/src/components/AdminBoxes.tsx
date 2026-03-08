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
  const [error, setError] = useState(false);

  const fetchBoxes = useCallback(async () => {
    try {
      const res = await fetch("/admin/boxes", { credentials: "include" });
      if (res.ok) {
        setBoxes(await res.json());
      } else {
        setError(true);
      }
    } catch {
      setError(true);
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

  if (error) {
    return <p style={{ color: "#c62828" }}>{t("common.error")}</p>;
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
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.85rem",
                  marginBottom: "0.5rem",
                }}
              >
                <thead>
                  <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                    <th style={{ padding: "0.5rem" }}>{t("admin.boxes.id")}</th>
                    <th style={{ padding: "0.5rem" }}>{t("admin.boxes.name")}</th>
                    <th style={{ padding: "0.5rem" }}>{t("admin.boxes.state")}</th>
                  </tr>
                </thead>
                <tbody>
                  {ghBoxes.map((box) => {
                    const colors = BOX_STATE_COLORS[box.state];
                    return (
                      <tr key={box.id} style={{ borderBottom: "1px solid #eee" }}>
                        <td style={{ padding: "0.5rem", fontWeight: 700 }}>#{box.id}</td>
                        <td style={{ padding: "0.5rem" }}>{box.name}</td>
                        <td style={{ padding: "0.5rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.15rem 0.5rem",
                              borderRadius: 12,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              background: colors.background,
                              color: colors.text,
                              border: `1px solid ${colors.border}`,
                            }}
                          >
                            {t(`map.state.${box.state}`)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </section>
  );
}
