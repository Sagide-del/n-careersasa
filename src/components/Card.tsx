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
