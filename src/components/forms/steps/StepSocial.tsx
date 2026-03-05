"use client";

import { useAssessment } from "@/store/AssessmentContext";

const PURPOSES = ["Learning","Entertainment","News","Networking","Business","Messaging"];
const PLATFORM_PRESETS = ["TikTok","Instagram","YouTube","X (Twitter)","Facebook","WhatsApp","Telegram","LinkedIn"];

export default function StepSocial() {
  const { data, update } = useAssessment();

  function setPlatform(idx: number, field: "name" | "hoursPerDay", value: string | number) {
    const next = [...data.social.platforms];
    next[idx] = { ...next[idx], [field]: value };
    update({ social: { ...data.social, platforms: next } });
  }

  function togglePurpose(idx: number, p: string) {
    const next = [...data.social.platforms];
    const current = next[idx].purpose || [];
    const exists = current.includes(p);
    next[idx].purpose = exists ? current.filter(x => x !== p) : [...current, p];
    update({ social: { ...data.social, platforms: next } });
  }

  function addPlatform() {
    update({
      social: {
        ...data.social,
        platforms: [...data.social.platforms, { name: "Instagram", hoursPerDay: 0, purpose: [] }],
      },
    });
  }

  function removePlatform(idx: number) {
    const next = data.social.platforms.filter((_, i) => i !== idx);
    update({ social: { ...data.social, platforms: next.length ? next : [{ name: "TikTok", hoursPerDay: 0, purpose: [] }] } });
  }

  return (
    <div className="space-y-4">
      <p className="text-slate-600 text-sm">
        Tell us how you use social media. This helps understand your learning patterns and interests.
      </p>

      <div className="space-y-3">
        {data.social.platforms.map((p, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
              <div>
                <label className="text-sm text-slate-700">Platform</label>
                <select className="mt-1 w-full rounded-xl border p-3 text-base" value={p.name} onChange={(e) => setPlatform(idx, "name", e.target.value)}>
                  {PLATFORM_PRESETS.map(x => <option key={x} value={x}>{x}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-700">Hours per day</label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  className="mt-1 w-full rounded-xl border p-3 text-base"
                  value={p.hoursPerDay}
                  onChange={(e) => setPlatform(idx, "hoursPerDay", Number(e.target.value))}
                />
              </div>

              <button type="button" onClick={() => removePlatform(idx)} className="rounded-xl border border-slate-300 px-4 py-3 text-base hover:bg-slate-50">
                Remove
              </button>
            </div>

            <div>
              <p className="text-sm text-slate-700 mb-2">Main purpose</p>
              <div className="flex flex-wrap gap-2">
                {PURPOSES.map((tag) => {
                  const active = (p.purpose || []).includes(tag);
                  return (
                    <button
                      type="button"
                      key={tag}
                      onClick={() => togglePurpose(idx, tag)}
                      className={\ounded-full border px-3 py-2 text-sm \\}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" onClick={addPlatform} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base hover:bg-slate-50">
        + Add another platform
      </button>
    </div>
  );
}
