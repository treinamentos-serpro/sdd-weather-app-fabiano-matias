interface EmptyStateProps {
  title: string;
  tip: string;
}

export default function EmptyState({ title, tip }: EmptyStateProps) {
  return (
    <section
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="rounded-lg border border-white/10 bg-white/5 p-6 text-center text-white backdrop-blur-md"
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-white/65">{tip}</p>
    </section>
  );
}
