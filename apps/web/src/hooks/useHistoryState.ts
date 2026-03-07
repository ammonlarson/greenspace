"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A hook that synchronises a piece of React state with the browser's
 * session‑history stack (`history.pushState` / `popstate`).
 *
 * Each state change that should be navigable pushes a new history entry.
 * When the user presses Back/Forward the `popstate` event restores the
 * previous value.
 *
 * @param key    A unique string that identifies this piece of state inside
 *               `history.state` (multiple hooks can coexist).
 * @param initial The initial value (used when no history entry exists).
 */
export function useHistoryState<T>(
  key: string,
  initial: T,
): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === "undefined") return initial;
    const stored = window.history.state?.[key];
    return stored !== undefined ? (stored as T) : initial;
  });

  // Keep a ref so the popstate listener always sees the latest key without
  // re‑registering.
  const keyRef = useRef(key);
  keyRef.current = key;

  // Guard against pushing during the initial mount or during a popstate
  // handler (which would create duplicate entries).
  const skipNextPush = useRef(true);

  useEffect(() => {
    // After mount, allow subsequent setState calls to push.
    skipNextPush.current = false;
  }, []);

  // Listen for popstate (Back / Forward).
  useEffect(() => {
    function onPopState(event: PopStateEvent) {
      const stored = event.state?.[keyRef.current];
      if (stored !== undefined) {
        skipNextPush.current = true;
        setValue(stored as T);
      } else {
        // No entry for this key — revert to initial.
        skipNextPush.current = true;
        setValue(initial);
      }
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // `initial` is intentionally captured once; changes to it after mount are
    // not expected.
  }, []);

  // Whenever value changes (and the change did NOT come from popstate),
  // push a new history entry.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Seed the current history entry with our initial state so that the
      // very first Back press can restore it.
      const merged = { ...window.history.state, [key]: value };
      window.history.replaceState(merged, "");
      return;
    }
    if (skipNextPush.current) {
      skipNextPush.current = false;
      return;
    }
    const merged = { ...window.history.state, [key]: value };
    window.history.pushState(merged, "");
  }, [value, key]);

  const set = useCallback((next: T) => {
    setValue(next);
  }, []);

  return [value, set];
}
