"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

/**
 * Global error boundary. Keeps internal error details out of the UI —
 * the actual error is only logged (server-side) or digest-visible.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled error:", error.message);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <AlertCircle className="size-8 text-red-500" aria-hidden />
      <h1 className="mt-3 text-lg font-semibold text-ink-900">
        Something went wrong
      </h1>
      <p className="mt-1 max-w-md text-sm text-ink-500">
        An unexpected error occurred. Please try again — if it keeps happening,
        come back a little later.
      </p>
      {error.digest ? (
        <p className="mt-2 text-xs text-ink-400">Reference: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex h-10 items-center gap-2 rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
      >
        <RefreshCw className="size-4" aria-hidden />
        Try again
      </button>
    </div>
  );
}
