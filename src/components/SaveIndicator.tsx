"use client";

import { useEffect, useRef, useState } from "react";
import { useAssessment } from "@/store/AssessmentContext";

export default function SaveIndicator() {
  const { data } = useAssessment();

  const [label, setLabel] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimer = useRef<number | null>(null);
  const hideTimer = useRef<number | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }

    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);

    setLabel("saving");

    saveTimer.current = window.setTimeout(() => {
      setLabel("saved");
      hideTimer.current = window.setTimeout(() => setLabel("idle"), 1200);
    }, 450);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [data]);

  if (label === "idle") return null;

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center px-4">
      <div
        className={\ounded-full border bg-white/95 backdrop-blur px-4 py-2 text-sm shadow-sm
        \\}
        role="status"
        aria-live="polite"
      >
        {label === "saving" ? "Savingâ€¦" : "Saved âœ“"}
      </div>
    </div>
  );
}
