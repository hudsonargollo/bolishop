"use client";

import { useState } from "react";

// Password field with a show/hide (eye) toggle.
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
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-gold-deep"
      >
        {show ? (
          // eye-off
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.9 5.1A9.5 9.5 0 0 1 12 5c6 0 10 7 10 7a17 17 0 0 1-2.2 3M6.6 6.6A17 17 0 0 0 2 12s4 7 10 7a9.5 9.5 0 0 0 3.9-.8" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            <path d="M3 3l18 18" />
          </svg>
        ) : (
          // eye
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}
