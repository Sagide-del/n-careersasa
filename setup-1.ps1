$ErrorActionPreference = "Stop"

function WriteFile([string]$path, [string]$content) {
  $dir = Split-Path $path -Parent
  if ($dir -and !(Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
  $content | Out-File -Encoding utf8 $path
}

Write-Host "Creating folders..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force src\lib, src\store, src\components, src\components\forms\steps, src\app\login, src\app\register, src\app\pay, src\app\dashboard, src\app\assessment, src\app\results, public\brand | Out-Null

Write-Host "Writing core files..." -ForegroundColor Cyan

WriteFile "src\lib\api.ts" @"
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000",
  withCredentials: true,
});

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}
"@

WriteFile "src\lib\auth.ts" @"
export const TOKEN_KEY = "careersasa_token";

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
"@

WriteFile "src\lib\autosave.ts" @"
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
"@

WriteFile "src\lib\guards.ts" @"
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

type GuardState = { loading: boolean; paid: boolean };

export function usePaidGuard(options?: { redirectTo?: string }) {
  const router = useRouter();
  const redirectTo = options?.redirectTo ?? "/pay";
  const [state, setState] = useState<GuardState>({ loading: true, paid: false });

  useEffect(() => {
    let alive = true;
    async function run() {
      try {
        const res = await api.get("/payments/me");
        const paid = Boolean(res.data?.paid);
        if (!alive) return;
        setState({ loading: false, paid });
        if (!paid) router.replace(redirectTo);
      } catch {
        if (!alive) return;
        setState({ loading: false, paid: false });
        router.replace(redirectTo);
      }
    }
    run();
    return () => { alive = false; };
  }, [router, redirectTo]);

  return state;
}
"@

WriteFile "src\store\AssessmentContext.tsx" @"
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
"@

Write-Host "Writing UI components..." -ForegroundColor Cyan

WriteFile "src\components\Card.tsx" @"
export default function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white shadow-sm border border-slate-200 p-4 sm:p-6">
      {title ? (
        <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-3 sm:mb-4">{title}</h2>
      ) : null}
      {children}
    </section>
  );
}
"@

WriteFile "src\components\Stepper.tsx" @"
export default function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 min-w-max pb-1">
        {steps.map((s, idx) => {
          const active = idx === current;
          const done = idx < current;
          return (
            <div
              key={s}
              className={\`px-3 py-2 rounded-full text-xs border whitespace-nowrap \${active ? "border-slate-900 bg-slate-900 text-white" : done ? "border-slate-300 text-slate-700 bg-white" : "border-slate-200 text-slate-400 bg-white"}\`}
            >
              {idx + 1}. {s}
            </div>
          );
        })}
      </div>
    </div>
  );
}
"@

WriteFile "src\components\Navbar.tsx" @"
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearToken } from "@/lib/auth";
import { setAuthToken } from "@/lib/api";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <Link href={href} className={\`block rounded-xl px-3 py-2 text-sm \${active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"}\`}>
      {label}
    </Link>
  );
}

export default function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function logout() {
    clearToken();
    setAuthToken(null);
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image src="/brand/careersasa-logo.png" alt="CareerSasa" width={36} height={36} className="rounded-lg" priority />
          <div className="leading-tight">
            <div className="font-bold">CareerSasa</div>
            <div className="text-xs text-slate-500 -mt-0.5">Discover Your Best Career Path</div>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/pay" label="Pay" />
          <NavLink href="/assessment" label="Assessment" />
          <button onClick={logout} className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Logout</button>
        </nav>

        <button onClick={() => setOpen((v) => !v)} className="md:hidden rounded-xl border border-slate-300 px-3 py-2 text-sm" aria-label="Menu">
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-3 space-y-1">
            <NavLink href="/dashboard" label="Dashboard" />
            <NavLink href="/pay" label="Pay" />
            <NavLink href="/assessment" label="Assessment" />
            <button onClick={logout} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 text-left">Logout</button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
"@

WriteFile "src\app\layout.tsx" @"
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CareerSasa",
  description: "Discover Your Best Career Path",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
"@

WriteFile "src\app\page.tsx" @"
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-xl w-full space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">CareerSasa</h1>
        <p className="text-slate-600">Discover Your Best Career Path</p>
        <div className="flex gap-3">
          <Link className="rounded-xl bg-slate-900 text-white px-4 py-2" href="/login">Login</Link>
          <Link className="rounded-xl border border-slate-300 px-4 py-2" href="/register">Create account</Link>
        </div>
      </div>
    </main>
  );
}
"@

WriteFile "src\app\dashboard\page.tsx" @"
import Navbar from "@/components/Navbar";
import Card from "@/components/Card";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8 space-y-6">
        <Card title="Welcome to CareerSasa">
          <p className="text-slate-600">You must pay KES 100 before starting the assessment.</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/pay" className="w-full text-center rounded-xl bg-slate-900 text-white px-4 py-3 text-base">Pay KES 100</Link>
            <Link href="/assessment" className="w-full text-center rounded-xl border border-slate-300 px-4 py-3 text-base">Start Assessment</Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
"@

Write-Host "setup-1 complete." -ForegroundColor Green