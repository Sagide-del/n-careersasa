"use client";

import { useAssessment } from "@/store/AssessmentContext";

function clamp(n: number) {
  return Math.max(0, Math.min(100, n));
}

function typeFrom(scores: { E:number; I:number; S:number; N:number; T:number; F:number; J:number; P:number }) {
  const EI = scores.E >= scores.I ? "E" : "I";
  const SN = scores.S >= scores.N ? "S" : "N";
  const TF = scores.T >= scores.F ? "T" : "F";
  const JP = scores.J >= scores.P ? "J" : "P";
  return ${EI};
}

function DimSlider({
  title, leftLabel, rightLabel, leftValue, onChange,
}: {
  title: string;
  leftLabel: string;
  rightLabel: string;
  leftValue: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2">
      <p className="font-medium text-slate-900">{title}</p>
      <div className="flex justify-between text-xs text-slate-600">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <input type="range" min={0} max={100} value={leftValue} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
      <div className="flex justify-between text-xs text-slate-700">
        <span>Left: {leftValue}%</span>
        <span>Right: {100 - leftValue}%</span>
      </div>
    </div>
  );
}

export default function StepBriggs() {
  const { data, update } = useAssessment();
  const s = data.briggs;

  function setPair(pair: "EI" | "SN" | "TF" | "JP", leftPercent: number) {
    const L = clamp(leftPercent);
    const R = 100 - L;

    let next = { ...s };
    if (pair === "EI") { next.E = L; next.I = R; }
    if (pair === "SN") { next.S = L; next.N = R; }
    if (pair === "TF") { next.T = L; next.F = R; }
    if (pair === "JP") { next.J = L; next.P = R; }

    next.type = typeFrom(next);
    update({ briggs: next });
  }

  return (
    <div className="space-y-5">
      <p className="text-slate-600 text-sm">
        Personality snapshot (Jungian dimensions). This helps match you to career environments.
      </p>

      <DimSlider title="Extraversion (E) vs Introversion (I)" leftLabel="More Extraverted" rightLabel="More Introverted" leftValue={s.E} onChange={(v) => setPair("EI", v)} />
      <DimSlider title="Sensing (S) vs Intuition (N)" leftLabel="More Sensing" rightLabel="More Intuitive" leftValue={s.S} onChange={(v) => setPair("SN", v)} />
      <DimSlider title="Thinking (T) vs Feeling (F)" leftLabel="More Thinking" rightLabel="More Feeling" leftValue={s.T} onChange={(v) => setPair("TF", v)} />
      <DimSlider title="Judging (J) vs Perceiving (P)" leftLabel="More Structured" rightLabel="More Flexible" leftValue={s.J} onChange={(v) => setPair("JP", v)} />

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-600">Your type (snapshot)</p>
        <p className="text-2xl font-bold text-slate-900">{data.briggs.type}</p>
        <p className="text-sm text-slate-600 mt-1">
          Scores: E {s.E}/I {s.I} â€¢ S {s.S}/N {s.N} â€¢ T {s.T}/F {s.F} â€¢ J {s.J}/P {s.P}
        </p>
      </div>
    </div>
  );
}
