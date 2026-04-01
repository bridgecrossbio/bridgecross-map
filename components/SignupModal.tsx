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
  const [email, setEmail] = useState("");
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
    if (!email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase
        .from("email_subscribers")
        .upsert({ email: email.trim().toLowerCase() }, { onConflict: "email" });

      if (dbError) throw dbError;

      localStorage.setItem("bcb_email_access", email.trim().toLowerCase());
      setDone(true);
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

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
              {/* Headline */}
              <h2 className="text-2xl font-bold leading-snug mb-2" style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}>
                Free access to the BridgeCross Map
              </h2>
              <p className="mb-6 text-sm" style={{ color: "#6B5E52", lineHeight: "1.6" }}>
                Subscribe to the BridgeCross Bio Substack — free China biotech intelligence — and unlock full access to all company profiles instantly.
              </p>

              {/* Feature list */}
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
                    className="w-full px-4 py-3 text-sm rounded-xl focus:outline-none transition-colors"
                    style={{ border: "1px solid #E0D5C5", color: "#1C1C1C", backgroundColor: "#FAFAFA" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                  />
                </div>

                {error && (
                  <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-full text-sm font-bold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: "#B83A2A", boxShadow: "0 2px 12px rgba(184,58,42,0.35)" }}
                >
                  {loading ? "Unlocking…" : "Subscribe & Unlock Free Access →"}
                </button>
              </form>

              <p className="mt-4 text-xs text-center" style={{ color: "#6B5E52" }}>
                No spam. Unsubscribe any time.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}