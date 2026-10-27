"use client";

import { useState } from "react";

/** Show / hide control for password fields: a small gold pill with a gem that
 *  "lights up" when the password is revealed (instead of the usual eye). */
export function RevealToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={shown}
      aria-label={shown ? "Hide password" : "Show password"}
      className={`group/reveal mr-2 inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border pl-2 pr-2.5 text-[0.6rem] font-bold uppercase tracking-[0.18em] transition-all duration-300 ${
        shown
          ? "border-gold bg-gradient-to-r from-gold-hi via-gold to-gold-deep text-maroon shadow-[0_6px_16px_-8px_rgba(169,126,48,0.9)]"
          : "border-gold/45 bg-transparent text-gold-deep hover:border-gold hover:bg-gold/10"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        aria-hidden="true"
        className={`h-4 w-4 transition-transform duration-500 ${shown ? "rotate-[360deg] scale-110" : "group-hover/reveal:scale-110"}`}
      >
        <path d="M7 5h10l4 5-9 10L3 10z" fill={shown ? "currentColor" : "none"} fillOpacity={shown ? 0.22 : 0} />
        <path d="M3 10h18M10 5 8.6 10 12 20l3.4-10L14 5" />
        {shown && <path d="M20.5 2.5v2.6M19.2 3.8h2.6M3.5 2.8v1.8M2.6 3.7h1.8" strokeWidth="1.4" />}
      </svg>
      <span className="w-7 text-left">{shown ? "Hide" : "Show"}</span>
    </button>
  );
}

// Password field with the show / hide toggle (used by the admin sign-in).
export function PasswordInput({
  name,
  autoComplete,
  required = false,
  minLength,
  className = "",
}: {
  name: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  className?: string;
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        required={required}
        minLength={minLength}
        autoComplete={autoComplete}
        className={`${className} pr-24`}
      />
      <span className="absolute right-0 top-1/2 -translate-y-1/2">
        <RevealToggle shown={show} onToggle={() => setShow((s) => !s)} />
      </span>
    </div>
  );
}
