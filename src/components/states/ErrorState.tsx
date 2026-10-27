interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-300/20 bg-white/5 p-6 text-center text-white backdrop-blur-md"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 min-h-11 rounded-lg bg-accent-400 px-4 font-semibold text-night-900 transition-colors hover:bg-accent-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-night-900"
      >
        Tentar novamente
      </button>
    </div>
  );
}
