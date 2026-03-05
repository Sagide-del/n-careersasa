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
              className={\px-3 py-2 rounded-full text-xs border whitespace-nowrap \\}
            >
              {idx + 1}. {s}
            </div>
          );
        })}
      </div>
    </div>
  );
}
