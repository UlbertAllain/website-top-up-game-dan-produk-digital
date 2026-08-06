type StatCardTone = "blue" | "green" | "amber" | "neutral";

type StatCardProps = {
  label: string;
  value: number;
  description: string;
  tone?: StatCardTone;
};

const toneClasses: Record<
  StatCardTone,
  {
    dot: string;
    value: string;
  }
> = {
  blue: {
    dot: "bg-blue-500",
    value: "text-blue-700",
  },

  green: {
    dot: "bg-emerald-500",
    value: "text-emerald-700",
  },

  amber: {
    dot: "bg-amber-500",
    value: "text-amber-700",
  },

  neutral: {
    dot: "bg-neutral-400",
    value: "text-neutral-950",
  },
};

export function StatCard({
  label,
  value,
  description,
  tone = "neutral",
}: StatCardProps) {
  const classes = toneClasses[tone];

  return (
    <article className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm shadow-neutral-950/[0.02]">
      <div className="flex items-center gap-2">
        <span className={["size-2 rounded-full", classes.dot].join(" ")} />

        <p className="text-sm font-medium text-neutral-600">{label}</p>
      </div>

      <p
        className={[
          "mt-5 text-3xl font-semibold tracking-tight",
          classes.value,
        ].join(" ")}
      >
        {value.toLocaleString("id-ID")}
      </p>

      <p className="mt-2 text-sm leading-5 text-neutral-500">{description}</p>
    </article>
  );
}
