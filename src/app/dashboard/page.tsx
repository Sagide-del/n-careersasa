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
