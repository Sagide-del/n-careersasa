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
      const res = await api.get(/results/);
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
            <p className="text-slate-600">Loading resultsâ€¦</p>
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
                          <span className="font-medium">{s.programme}</span> â€” {s.kuccps_notes}
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
