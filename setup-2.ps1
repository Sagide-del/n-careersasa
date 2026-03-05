$ErrorActionPreference = "Stop"

function WriteFile([string]$path, [string]$content) {
  $dir = Split-Path $path -Parent
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $content | Out-File -Encoding utf8 $path
}

Write-Host "Writing remaining components + pages..." -ForegroundColor Cyan

# ---------- SaveIndicator ----------
WriteFile "src\components\SaveIndicator.tsx" @"
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
        className={\`rounded-full border bg-white/95 backdrop-blur px-4 py-2 text-sm shadow-sm
        \${label === "saving" ? "border-slate-200 text-slate-700" : "border-slate-300 text-slate-900"}\`}
        role="status"
        aria-live="polite"
      >
        {label === "saving" ? "Saving…" : "Saved ✓"}
      </div>
    </div>
  );
}
"@

# ---------- Steps ----------
WriteFile "src\components\forms\steps\StepKCSE.tsx" @"
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
"@

WriteFile "src\components\forms\steps\StepInterests.tsx" @"
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
              className={\`rounded-full border px-3 py-2 text-sm \${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}\`}
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
"@

WriteFile "src\components\forms\steps\StepSocial.tsx" @"
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
                      className={\`rounded-full border px-3 py-2 text-sm \${active ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}\`}
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
"@

WriteFile "src\components\forms\steps\StepFamily.tsx" @"
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
        <label className="text-sm text-slate-700">Guardian Support Level (1–5)</label>
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
"@

WriteFile "src\components\forms\steps\StepBriggs.tsx" @"
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
  return `${EI}${SN}${TF}${JP}`;
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
          Scores: E {s.E}/I {s.I} • S {s.S}/N {s.N} • T {s.T}/F {s.F} • J {s.J}/P {s.P}
        </p>
      </div>
    </div>
  );
}
"@

# ---------- Login / Register / Pay ----------
WriteFile "src\app\login\page.tsx" @"
"use client";

import Card from "@/components/Card";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { api, setAuthToken } from "@/lib/api";
import { saveToken } from "@/lib/auth";
import { useRouter } from "next/navigation";

type Form = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<Form>();

  async function onSubmit(values: Form) {
    const res = await api.post("/auth/login", values);
    const token = res.data?.token;
    if (token) {
      saveToken(token);
      setAuthToken(token);
    }
    router.push("/pay");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">CareerSasa</h1>
          <p className="text-slate-600 mt-1">Discover Your Best Career Path</p>
        </div>

        <Card title="Login">
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm text-slate-700">Email</label>
              <input className="mt-1 w-full rounded-xl border p-3 text-base" {...register("email", { required: true })} />
              {errors.email ? <p className="text-xs text-red-600 mt-1">Email is required</p> : null}
            </div>

            <div>
              <label className="text-sm text-slate-700">Password</label>
              <input type="password" className="mt-1 w-full rounded-xl border p-3 text-base" {...register("password", { required: true })} />
              {errors.password ? <p className="text-xs text-red-600 mt-1">Password is required</p> : null}
            </div>

            <button disabled={isSubmitting} className="w-full rounded-xl bg-slate-900 text-white py-3 text-base">
              {isSubmitting ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm text-slate-600 text-center">
              No account? <Link className="text-slate-900 underline" href="/register">Create one</Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
"@

WriteFile "src\app\register\page.tsx" @"
"use client";

import Card from "@/components/Card";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

type Form = { name: string; email: string; password: string };

export default function RegisterPage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<Form>();

  async function onSubmit(values: Form) {
    await api.post("/auth/register", values);
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">CareerSasa</h1>
          <p className="text-slate-600 mt-1">Discover Your Best Career Path</p>
        </div>

        <Card title="Create account">
          <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm text-slate-700">Full name</label>
              <input className="mt-1 w-full rounded-xl border p-3 text-base" {...register("name", { required: true })} />
            </div>
            <div>
              <label className="text-sm text-slate-700">Email</label>
              <input className="mt-1 w-full rounded-xl border p-3 text-base" {...register("email", { required: true })} />
            </div>
            <div>
              <label className="text-sm text-slate-700">Password</label>
              <input type="password" className="mt-1 w-full rounded-xl border p-3 text-base" {...register("password", { required: true, minLength: 6 })} />
            </div>

            <button disabled={isSubmitting} className="w-full rounded-xl bg-slate-900 text-white py-3 text-base">
              {isSubmitting ? "Creating..." : "Create account"}
            </button>

            <p className="text-sm text-slate-600 text-center">
              Have an account? <Link className="text-slate-900 underline" href="/login">Login</Link>
            </p>
          </form>
        </Card>
      </div>
    </main>
  );
}
"@

WriteFile "src\app\pay\page.tsx" @"
"use client";

import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";

const AMOUNT = 100;
const TILL_NUMBER = "123456";
const DEV_ALLOW_DEMO_CONTINUE = true;

export default function PayPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  async function startStkPush() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post("/payments/mpesa/stkpush", { phone, amount: AMOUNT });
      setCheckoutId(res.data?.checkoutRequestId || null);
      setStatus("STK Push sent. Please complete payment on your phone.");
    } catch (e: any) {
      setStatus(e?.response?.data?.message || "STK Push failed. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyPayment() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.get("/payments/me");
      const paid = Boolean(res.data?.paid);
      if (paid) {
        setStatus("Payment confirmed ✅ Unlocking assessment…");
        router.push("/assessment");
      } else {
        setStatus("Payment not confirmed yet. If you just paid, wait 10–20 seconds and try again.");
      }
    } catch (e: any) {
      setStatus(e?.response?.data?.message || "Could not verify payment. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function demoContinue() {
    router.push("/assessment");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8 space-y-6">
        <Card title="Pay KES 100 to Start">
          <p className="text-slate-600">
            Payment is required before you begin the assessment and generate your PDF report.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Option A: Pay via M-Pesa Till</h3>
              <p className="text-sm text-slate-600 mt-1">
                Go to M-Pesa → Lipa na M-Pesa → Buy Goods and Services
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-700">Till Number:</span>
                <span className="rounded-xl bg-slate-900 text-white px-3 py-2 font-mono">{TILL_NUMBER}</span>
                <span className="text-sm text-slate-700">Amount:</span>
                <span className="rounded-xl bg-slate-100 px-3 py-2 font-mono text-slate-900">{AMOUNT}</span>
              </div>

              <p className="text-xs text-slate-500 mt-2">
                After paying via Till, tap “Verify Payment” below to unlock the assessment.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Option B: STK Push (Recommended)</h3>
              <p className="text-sm text-slate-600 mt-1">
                Enter your phone number to receive a payment prompt.
              </p>

              <div className="mt-3">
                <label className="text-sm text-slate-700">M-Pesa Phone Number</label>
                <input
                  className="mt-1 w-full rounded-xl border p-3 text-base"
                  placeholder="07XXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <button onClick={startStkPush} disabled={loading || !phone} className="mt-3 w-full rounded-xl bg-slate-900 text-white px-4 py-3 text-base disabled:opacity-50">
                {loading ? "Requesting..." : "Send STK Push"}
              </button>

              {checkoutId ? (
                <p className="text-xs text-slate-500 mt-2">
                  Checkout ID: <span className="font-mono">{checkoutId}</span>
                </p>
              ) : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={verifyPayment} disabled={loading} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-base hover:bg-slate-50 disabled:opacity-50">
                {loading ? "Checking..." : "Verify Payment"}
              </button>

              {DEV_ALLOW_DEMO_CONTINUE ? (
                <button onClick={demoContinue} className="w-full rounded-xl bg-slate-200 px-4 py-3 text-base text-slate-700">
                  Continue (demo)
                </button>
              ) : null}
            </div>

            {status ? <p className="text-sm text-slate-700">{status}</p> : null}
          </div>
        </Card>
      </main>
    </div>
  );
}
"@

# ---------- Assessment + Results ----------
WriteFile "src\app\assessment\page.tsx" @"
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
      router.push(`/results?rid=${encodeURIComponent(resultId)}`);
    } finally {
      setSubmitting(false);
    }
  }

  if (guard.loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 py-8">
          <Card title="Checking access…">
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

        <Card title={`Step ${current + 1}: ${steps[current]}`}>
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
"@

WriteFile "src\app\results\page.tsx" @"
"use client";

import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { usePaidGuard } from "@/lib/guards";

type Result = {
  student_summary?: { strengths: string[]; growth_areas: string[] };
  top_3_career_pathways?: Array<{
    rank: number;
    pathway_name: string;
    why_fit: string[];
    suggested_programmes: Array<{ programme: string; kuccps_notes: string }>;
    next_steps: string[];
  }>;
  pdf_url?: string;
};

export default function ResultsPage() {
  const guard = usePaidGuard({ redirectTo: "/pay" });
  const sp = useSearchParams();
  const rid = sp.get("rid") || "";
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rid) return;
    async function load() {
      setLoading(true);
      const res = await api.get(`/results/${encodeURIComponent(rid)}`);
      setResult(res.data);
      setLoading(false);
    }
    load();
  }, [rid]);

  if (guard.loading) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 space-y-6">
        <Card title="Your Top 3 Career Pathways">
          {loading ? (
            <p className="text-slate-600">Loading results…</p>
          ) : !result ? (
            <p className="text-slate-600">No results found.</p>
          ) : (
            <div className="space-y-4">
              {result.student_summary ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">Summary</p>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">Strengths</p>
                      <ul className="list-disc pl-5 text-sm text-slate-700">
                        {result.student_summary.strengths.map((x, i) => <li key={i}>{x}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">Growth areas</p>
                      <ul className="list-disc pl-5 text-sm text-slate-700">
                        {result.student_summary.growth_areas.map((x, i) => <li key={i}>{x}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : null}

              {result.top_3_career_pathways?.map((p) => (
                <div key={p.rank} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <p className="text-xs text-slate-500">Rank {p.rank}</p>
                    <span className="text-xs text-slate-500">CareerSasa</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{p.pathway_name}</h3>

                  <div>
                    <p className="text-sm font-medium text-slate-800">Why it fits</p>
                    <ul className="list-disc pl-5 text-sm text-slate-700">
                      {p.why_fit.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">Suggested programmes</p>
                    <ul className="list-disc pl-5 text-sm text-slate-700">
                      {p.suggested_programmes.map((s, i) => (
                        <li key={i}>
                          <span className="font-medium">{s.programme}</span> — {s.kuccps_notes}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-800">Next steps</p>
                    <ul className="list-disc pl-5 text-sm text-slate-700">
                      {p.next_steps.map((n, i) => <li key={i}>{n}</li>)}
                    </ul>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                {result.pdf_url ? (
                  <a className="w-full sm:w-auto inline-flex justify-center rounded-xl bg-slate-900 text-white px-4 py-3 text-base" href={result.pdf_url}>
                    Download PDF Report
                  </a>
                ) : (
                  <button className="w-full sm:w-auto rounded-xl bg-slate-200 px-4 py-3 text-base text-slate-600" disabled>
                    PDF not ready
                  </button>
                )}
              </div>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}
"@

WriteFile "README.md" @"
# CareerSasa Frontend

Mobile-first frontend for CareerSasa.

## Features
- Login / Register
- Paywall (Till + STK Push)
- Assessment Wizard:
  - KCSE (all subjects + quick-fill)
  - Interests
  - Social media usage
  - Family/Birth order
  - Personality snapshot
- Autosave + Saved indicator
- Results screen + PDF download link (from backend)

## Run
npm install
npm run dev

## Environment
Create .env.local:
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
"@

Write-Host "setup-2 complete." -ForegroundColor Green