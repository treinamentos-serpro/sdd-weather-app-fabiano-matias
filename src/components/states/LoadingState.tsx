interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Carregando...' }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="rounded-lg border border-white/10 bg-white/5 p-6 text-center text-white/75 backdrop-blur-md"
    >
      <p>{message}</p>
    </div>
  );
}
