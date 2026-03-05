"use client";

import { useAssessment } from "@/store/AssessmentContext";

const GRADES = ["A","A-","B+","B","B-","C+","C","C-","D+","D","D-","E"];

const SUBJECTS = [
  "English","Kiswahili","Mathematics",
  "Biology","Chemistry","Physics",
  "History","Geography","CRE","IRE","HRE",
  "Business Studies","Agriculture","Computer Studies",
  "Home Science","Art & Design","Music",
  "French","German","Arabic"
];

const CORE = ["English","Kiswahili","Mathematics"];
const SCIENCES = ["Biology","Chemistry","Physics"];

export default function StepKCSE() {
  const { data, update } = useAssessment();

  function setSubject(idx: number, field: "name" | "grade", value: string) {
    const next = [...data.kcse.subjects];
    next[idx] = { ...next[idx], [field]: value };
    update({ kcse: { ...data.kcse, subjects: next } });
  }

  function addBlank() {
    update({ kcse: { ...data.kcse, subjects: [...data.kcse.subjects, { name: "", grade: "" }] } });
  }

  function remove(idx: number) {
    const next = data.kcse.subjects.filter((_, i) => i !== idx);
    update({ kcse: { ...data.kcse, subjects: next.length ? next : [{ name: "", grade: "" }] } });
  }

  function addMany(names: string[]) {
    const existing = new Set(data.kcse.subjects.map(s => s.name).filter(Boolean));
    const toAdd = names.filter(n => !existing.has(n)).map(n => ({ name: n, grade: "" }));
    if (!toAdd.length) return;

    const next = [...data.kcse.subjects];
    const emptyIdx = next.findIndex(s => !s.name && !s.grade);
    if (emptyIdx >= 0) {
      const first = toAdd.shift();
      if (first) next[emptyIdx] = first;
    }

    update({ kcse: { ...data.kcse, subjects: [...next, ...toAdd] } });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Enter your KCSE mean grade and all subjects you sat for. Use quick-fill to save time.
      </p>

      <div>
        <label className="text-sm text-slate-700">KCSE Mean Grade</label>
        <select
          className="mt-1 w-full rounded-xl border p-3 text-base"
          value={data.kcse.meanGrade}
          onChange={(e) => update({ kcse: { ...data.kcse, meanGrade: e.target.value } })}
        >
          <option value="">Select mean grade</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <p className="text-sm font-semibold text-slate-900">Quick-fill</p>
        <p className="text-xs text-slate-600 mt-1">Tap to add common subjects instantly.</p>

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button type="button" onClick={() => addMany(CORE)} className="rounded-xl border border-slate-300 px-4 py-3 text-base hover:bg-slate-50">
            Add Core (Eng/Kis/Math)
          </button>
          <button type="button" onClick={() => addMany(SCIENCES)} className="rounded-xl border border-slate-300 px-4 py-3 text-base hover:bg-slate-50">
            Add Sciences
          </button>
          <button type="button" onClick={() => addMany(SUBJECTS)} className="rounded-xl bg-slate-900 text-white px-4 py-3 text-base">
            Add All Presets
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-800">Subjects & Grades</p>

        {data.kcse.subjects.map((s, idx) => (
          <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
              <div>
                <label className="text-xs text-slate-600">Subject</label>
                <select className="mt-1 w-full rounded-xl border p-3 text-base" value={s.name} onChange={(e) => setSubject(idx, "name", e.target.value)}>
                  <option value="">Select subject</option>
                  {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-600">Grade</label>
                <select className="mt-1 w-full rounded-xl border p-3 text-base" value={s.grade} onChange={(e) => setSubject(idx, "grade", e.target.value)}>
                  <option value="">Select grade</option>
                  {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <button type="button" onClick={() => remove(idx)} className="rounded-xl border border-slate-300 px-4 py-3 text-base hover:bg-slate-50">
                Remove
              </button>
            </div>
          </div>
        ))}

        <button type="button" onClick={addBlank} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base hover:bg-slate-50">
          + Add another subject
        </button>
      </div>
    </div>
  );
}
