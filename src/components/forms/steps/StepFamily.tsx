"use client";

import { useAssessment } from "@/store/AssessmentContext";

export default function StepFamily() {
  const { data, update } = useAssessment();

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-700">Birth Order</label>
        <select
          className="mt-1 w-full rounded-xl border p-3 text-base"
          value={data.family.birthOrder}
          onChange={(e) => update({ family: { ...data.family, birthOrder: e.target.value } })}
        >
          <option value="firstborn">Firstborn</option>
          <option value="middle">Middle</option>
          <option value="lastborn">Lastborn</option>
          <option value="only">Only child</option>
        </select>
      </div>

      <div>
        <label className="text-sm text-slate-700">Guardian Support Level (1â€“5)</label>
        <input
          type="range"
          min={1}
          max={5}
          value={data.family.guardianSupport}
          onChange={(e) => update({ family: { ...data.family, guardianSupport: Number(e.target.value) } })}
          className="mt-2 w-full"
        />
        <p className="text-sm text-slate-600">Selected: {data.family.guardianSupport}</p>
      </div>

      <div>
        <label className="text-sm text-slate-700">Notes (optional)</label>
        <textarea
          className="mt-1 w-full rounded-xl border p-3 text-base"
          rows={4}
          value={data.family.notes}
          onChange={(e) => update({ family: { ...data.family, notes: e.target.value } })}
          placeholder="Any context e.g., financial constraints, parental expectations..."
        />
      </div>
    </div>
  );
}
