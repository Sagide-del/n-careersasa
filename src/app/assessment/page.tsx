"use client";

import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Stepper from "@/components/Stepper";
import SaveIndicator from "@/components/SaveIndicator";
import { AssessmentProvider, useAssessment } from "@/store/AssessmentContext";
import { useMemo, useState } from "react";
import StepKCSE from "@/components/forms/steps/StepKCSE";
import StepInterests from "@/components/forms/steps/StepInterests";
import StepSocial from "@/components/forms/steps/StepSocial";
import StepFamily from "@/components/forms/steps/StepFamily";
import StepBriggs from "@/components/forms/steps/StepBriggs";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { usePaidGuard } from "@/lib/guards";
import { clearDraft } from "@/lib/autosave";

function WizardInner() {
  const router = useRouter();
  const { data } = useAssessment();
  const guard = usePaidGuard({ redirectTo: "/pay" });

  const steps = useMemo(() => ["KCSE", "Interests", "Social", "Family", "Briggs"], []);
  const [current, setCurrent] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const stepViews = [
    <StepKCSE key="kcse" />,
    <StepInterests key="interests" />,
    <StepSocial key="social" />,
    <StepFamily key="family" />,
    <StepBriggs key="briggs" />,
  ];

  async function submitAssessment() {
    setSubmitting(true);
    try {
      const res = await api.post("/assessment/submit", { student_profile: data });
      const resultId = res.data?.resultId || "";
      clearDraft();
      router.push(/results?rid=);
    } finally {
      setSubmitting(false);
    }
  }

  if (guard.loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <Card title="Checking accessâ€¦">
            <p className="text-slate-600">Please wait.</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 space-y-4">
        <div className="flex flex-col gap-2">
          <Stepper steps={steps} current={current} />
          <p className="text-xs text-slate-500">Autosave is on.</p>
        </div>

        <Card title={Step : }>
          {stepViews[current]}

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="rounded-xl border border-slate-300 px-4 py-3 text-base disabled:opacity-50" disabled={current === 0} onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
              Back
            </button>

            {current < steps.length - 1 ? (
              <button className="rounded-xl bg-slate-900 text-white px-4 py-3 text-base" onClick={() => setCurrent((c) => Math.min(steps.length - 1, c + 1))}>
                Next
              </button>
            ) : (
              <button className="rounded-xl bg-slate-900 text-white px-4 py-3 text-base disabled:opacity-50" disabled={submitting} onClick={submitAssessment}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </Card>
      </main>

      <SaveIndicator />
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <AssessmentProvider>
      <WizardInner />
    </AssessmentProvider>
  );
}
