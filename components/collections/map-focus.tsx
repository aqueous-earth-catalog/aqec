"use client";

interface MapFocusProps {
  title: string;
}

/** Invisible scroll anchor — title must match a work in this collection. */
export function MapFocus({ title }: MapFocusProps) {
  return (
    <span
      data-map-focus-title={title}
      className="block h-0 w-0"
      aria-hidden="true"
    />
  );
}
