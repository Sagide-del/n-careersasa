import type { AssessmentData } from "@/store/AssessmentContext";

export const ASSESSMENT_DRAFT_KEY = "careersasa_assessment_draft_v1";

export function saveDraft(data: AssessmentData) {
  try { localStorage.setItem(ASSESSMENT_DRAFT_KEY, JSON.stringify(data)); } catch {}
}

export function loadDraft(): AssessmentData | null {
  try {
    const raw = localStorage.getItem(ASSESSMENT_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AssessmentData;
  } catch { return null; }
}

export function clearDraft() {
  try { localStorage.removeItem(ASSESSMENT_DRAFT_KEY); } catch {}
}
