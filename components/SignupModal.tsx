"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const FEATURES: { text: string; emoji?: string }[] = [
  { text: "Full access to all company profiles" },
  { text: "Detailed company data including investors, key products and therapeutic areas" },
  { text: "Verified contact information for every company" },
  { text: "Early access to new sectors and companies as we expand" },
  { text: "Support our mission to continue independent reporting of key China biotech trends", emoji: "🙏" },
];

export default function SignupModal({ onClose }: { onClose: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) return;
    setLoading(true);
    setError(null);

    // NOTE: Disable email confirmation in Supabase dashboard:
    // Authentication → Settings → "Enable email confirmations" → OFF
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Upsert name into profiles table
    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        email: normalizedEmail,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });
      if (profileError) console.error("[SignupModal] profiles upsert failed:", profileError);
    }

    // Record in email_subscribers via server-side route (uses service role key,
    // bypasses RLS — client-side anon upsert would fail if table restricts inserts).
    const subscriberRes = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: normalizedEmail,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      }),
    });
    if (!subscriberRes.ok) {
      const body = await subscriberRes.json().catch(() => ({}));
      console.error("[SignupModal] email_subscribers upsert failed:", body);
    }

    setDone(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  }

  const inputCls = "w-full px-4 py-3 text-sm rounded-xl focus:outline-none transition-colors";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(28,28,28,0.65)", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full bg-white overflow-y-auto"
        style={{
          maxWidth: "480px",
          borderRadius: "16px",
          boxShadow: "0 24px 64px rgba(28,28,28,0.20)",
          maxHeight: "90vh",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-gray-100"
          style={{ color: "#6B5E52" }}
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-8">
          {done ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#B83A2A18" }}>
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#B83A2A" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}>You're in!</h2>
              <p className="text-sm" style={{ color: "#6B5E52" }}>Unlocking full map access now…</p>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold leading-snug mb-2" style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}>
                Free access to the BridgeCross Map
              </h2>
              <p className="mb-6 text-sm" style={{ color: "#6B5E52", lineHeight: "1.6" }}>
                Create a free account to unlock full access to all company profiles.
              </p>

              <ul className="space-y-2.5 mb-7">
                {FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-3 text-sm" style={{ color: "#1C1C1C" }}>
                    {f.emoji ? (
                      <span className="flex-shrink-0 mt-0.5 text-base leading-none">{f.emoji}</span>
                    ) : (
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 16 16" fill="none">
                        <circle cx="8" cy="8" r="7" fill="#B83A2A" fillOpacity="0.12" />
                        <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="#B83A2A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {f.text}
                  </li>
                ))}
              </ul>

              <div className="h-px mb-6" style={{ backgroundColor: "#E0D5C5" }} />

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B5E52" }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Jane"
                      className={inputCls}
                      style={{ border: "1px solid #E0D5C5", color: "#1C1C1C", backgroundColor: "#FAFAFA" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B5E52" }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Smith"
                      className={inputCls}
                      style={{ border: "1px solid #E0D5C5", color: "#1C1C1C", backgroundColor: "#FAFAFA" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B5E52" }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls}
                    style={{ border: "1px solid #E0D5C5", color: "#1C1C1C", backgroundColor: "#FAFAFA" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B5E52" }}>
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className={inputCls}
                    style={{ border: "1px solid #E0D5C5", color: "#1C1C1C", backgroundColor: "#FAFAFA" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <p className="text-xs text-center mt-1" style={{ color: "#6B5E52" }}>
                  By creating an account you agree to receive the{" "}
                  <a
                    href="https://bridgecrossbio.substack.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#B83A2A", textDecoration: "underline" }}
                  >
                    BridgeCross Bio Substack
                  </a>{" "}
                  newsletter — free China biotech intelligence. You can unsubscribe at any time.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full text-sm font-bold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: "#B83A2A", boxShadow: "0 2px 12px rgba(184,58,42,0.35)" }}
                >
                  {loading ? "Creating account…" : "Create Account & Subscribe Free →"}
                </button>
              </form>

              <p className="mt-4 text-xs text-center" style={{ color: "#6B5E52" }}>
                Already have an account?{" "}
                <a href="/auth?tab=login" className="font-semibold underline transition-opacity hover:opacity-70" style={{ color: "#B83A2A" }}>
                  Log in here
                </a>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
