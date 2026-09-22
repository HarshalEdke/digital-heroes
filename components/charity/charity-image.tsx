"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Charity image with a graceful fallback: seeded charity URLs point at
 * example.com placeholders, so a broken image resolves to a neutral
 * block instead of a broken-image icon.
 */
export function CharityImage({
  src,
  alt,
  className,
  iconClassName,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  iconClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(src) && !failed;

  if (!showImage) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-ink-100 text-ink-400",
          className
        )}
        role="img"
        aria-label={alt}
      >
        <Heart className={cn("size-8", iconClassName)} aria-hidden />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- charity URLs are arbitrary admin-entered hosts; onError fallback needed
    <img
      src={src as string}
      alt={alt}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
}
