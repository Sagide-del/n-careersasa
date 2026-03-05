"use client";

import { useAssessment } from "@/store/AssessmentContext";
import { useState } from "react";

const SUGGESTED = [
  "Coding","Design","Music","Sports","Debate","Reading","Writing",
  "Business","Farming","Helping People","Leadership","Art","Gaming",
  "Fixing Things","Science Experiments","Cooking","Photography"
];

export default function StepInterests() {
  const { data, update } = useAssessment();
  const [custom, setCustom] = useState("");

  function toggle(item: string) {
    const exists = data.interests.hobbies.includes(item);
    const next = exists ? data.interests.hobbies.filter((x) => x !== item) : [...data.interests.hobbies, item];
    update({ interests: { ...data.interests, hobbies: next } });
  }

  function addCustom() {
    const val = custom.trim();
    if (!val) return;
    if (data.interests.hobbies.includes(val)) return;
    update({ interests: { ...data.interests, hobbies: [...data.interests.hobbies, val] } });
    setCustom("");
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm">
        Select hobbies and interests that describe you. The system uses these to match career pathways.
      </p>

      <div className="flex flex-wrap gap-2">
        {SUGGESTED.map((item) => {
          const active = data.interests.hobbies.includes(item);
          return (
            <button
              type="button"
              key={item}
              onClick={() => toggle(item)}
              className={\ounded-full border px-3 py-2 text-sm \\}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <input
          className="sm:col-span-2 rounded-xl border p-3 text-base"
          placeholder="Add your own (e.g., Animation, Volunteering)"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
        />
        <button type="button" onClick={addCustom} className="rounded-xl bg-slate-900 text-white px-4 py-3 text-base">
          Add
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <p className="text-sm font-medium text-slate-800">Selected</p>
        {data.interests.hobbies.length === 0 ? (
          <p className="text-sm text-slate-600 mt-1">No hobbies selected yet.</p>
        ) : (
          <ul className="list-disc pl-5 text-sm text-slate-700 mt-1">
            {data.interests.hobbies.map((h) => <li key={h}>{h}</li>)}
          </ul>
        )}
      </div>
    </div>
  );
}
