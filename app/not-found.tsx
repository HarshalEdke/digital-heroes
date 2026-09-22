import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <Compass className="size-8 text-ink-300" aria-hidden />
      <h1 className="mt-3 text-lg font-semibold text-ink-900">Page not found</h1>
      <p className="mt-1 max-w-md text-sm text-ink-500">
        The page you are looking for doesn&apos;t exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex h-10 items-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white hover:bg-brand-700"
      >
        Back to home
      </Link>
    </div>
  );
}
