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
