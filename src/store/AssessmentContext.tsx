"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadDraft, saveDraft } from "@/lib/autosave";

export type KCSESubject = { name: string; grade: string };

export type BriggsScores = {
  E: number; I: number; S: number; N: number; T: number; F: number; J: number; P: number;
  type: string;
};

export type AssessmentData = {
  kcse: { meanGrade: string; subjects: KCSESubject[] };
  interests: { hobbies: string[]; topInterests: string[] };
  social: { platforms: { name: string; hoursPerDay: number; purpose: string[] }[] };
  family: { birthOrder: string; guardianSupport: number; notes: string };
  briggs: BriggsScores;
};

const defaultData: AssessmentData = {
  kcse: { meanGrade: "", subjects: [{ name: "", grade: "" }] },
  interests: { hobbies: [], topInterests: [] },
  social: { platforms: [{ name: "TikTok", hoursPerDay: 0, purpose: [] }] },
  family: { birthOrder: "firstborn", guardianSupport: 3, notes: "" },
  briggs: { E: 50, I: 50, S: 50, N: 50, T: 50, F: 50, J: 50, P: 50, type: "XXXX" },
};

type Ctx = {
  data: AssessmentData;
  setData: (next: AssessmentData) => void;
  update: (partial: Partial<AssessmentData>) => void;
};

const AssessmentContext = createContext<Ctx | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AssessmentData>(() => {
    if (typeof window === "undefined") return defaultData;
    return loadDraft() ?? defaultData;
  });

  useEffect(() => { saveDraft(data); }, [data]);

  const value = useMemo<Ctx>(() => ({
    data,
    setData,
    update: (partial) => setData((prev) => ({ ...prev, ...partial })),
  }), [data]);

  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used within AssessmentProvider");
  return ctx;
}
