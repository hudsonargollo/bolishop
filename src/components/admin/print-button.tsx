"use client";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg bg-maroon px-5 py-2.5 text-sm font-medium text-light transition hover:bg-maroon-2"
    >
      {label}
    </button>
  );
}
