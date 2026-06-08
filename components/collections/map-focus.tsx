"use client";

interface MapFocusProps {
  title: string;
}

/** Invisible scroll anchor — title must match a work in this collection. */
export function MapFocus({ title }: MapFocusProps) {
  return (
    <span
      data-map-focus-title={title}
      className="block h-px w-full"
      aria-hidden="true"
    />
  );
}
