"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

const FEATURES: { text: string; emoji?: string }[] = [
  { text: "Full access to all company profiles" },
  { text: "Detailed company data including investors, key products and therapeutic areas" },
  { text: "Verified contact information for every company" },
  { text: "Early access to new sectors and companies as we expand" },
  { text: "Support our mission to continue independent reporting of key China biotech trends", emoji: "🙏" },
];

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const verified = searchParams.get("verified") === "true";

  const [tab, setTab] = useState<"login" | "signup">(initialTab);

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Forgot password state
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  // Trial (Stripe) flow state — used on Sign Up tab when not verified
  const [trialEmail, setTrialEmail] = useState("");
  const [trialLoading, setTrialLoading] = useState(false);
  const [trialError, setTrialError] = useState<string | null>(null);

  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      if (verified && data.user) {
        const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
        await supabase.from("profiles").update({ is_paid: true, trial_ends_at: trialEnd }).eq("id", data.user.id);
      }
      router.replace("/");
    }
    setSubmitting(false);
  }

  // Only called from the ?verified=true flow — creates the Supabase account after Stripe
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else if (data.user) {
      const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        is_paid: true,
        trial_ends_at: trialEnd,
      });
      if (data.session) {
        router.replace("/");
      } else {
        setMessage({ type: "success", text: "Account created! Check your email to confirm, then log in." });
      }
    }
    setSubmitting(false);
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setResetSubmitting(true);
    setResetMessage(null);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth`,
    });
    if (error) {
      setResetMessage({ type: "error", text: error.message });
    } else {
      setResetMessage({ type: "success", text: "Check your email for a password reset link." });
    }
    setResetSubmitting(false);
  }

  async function handleStartTrial(e: React.FormEvent) {
    e.preventDefault();
    if (!trialEmail.trim()) return;
    setTrialLoading(true);
    setTrialError(null);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trialEmail.trim() }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setTrialError(data.error ?? "Something went wrong. Please try again.");
        setTrialLoading(false);
      }
    } catch {
      setTrialError("Network error. Please try again.");
      setTrialLoading(false);
    }
  }

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none transition-colors bg-white";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: "#F5EDE0" }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#B83A2A" }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <div>
          <p className="font-bold leading-tight" style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}>BridgeCross Bio</p>
          <p className="text-xs leading-tight" style={{ color: "#6B5E52" }}>Chinese Biotech Map</p>
        </div>
      </Link>

      {/* Card */}
      <div
        className="w-full bg-white rounded-2xl overflow-hidden"
        style={{
          maxWidth: tab === "signup" && !verified ? "440px" : "360px",
          boxShadow: "0 4px 24px rgba(28,28,28,0.10)",
          border: "1px solid #E0D5C5",
          transition: "max-width 0.2s ease",
        }}
      >
        {/* Tab switcher */}
        <div className="flex" style={{ borderBottom: "1px solid #E0D5C5" }}>
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setMessage(null); setShowReset(false); setTrialError(null); }}
              className="flex-1 py-3.5 text-sm font-semibold transition-colors"
              style={{
                color: tab === t ? "#B83A2A" : "#6B5E52",
                borderBottom: tab === t ? "2px solid #B83A2A" : "2px solid transparent",
              }}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {tab === "login" ? (
            /* ── LOG IN TAB ─────────────────────────────────────── */
            <>
              {verified && (
                <div className="mb-5 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#B83A2A18", color: "#B83A2A" }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Payment confirmed! Log in or create your account below.
                </div>
              )}

              {showReset ? (
                <div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "#1C1C1C" }}>Reset your password</h3>
                  <p className="text-xs mb-4" style={{ color: "#6B5E52" }}>Enter your email and we'll send you a reset link.</p>
                  <form onSubmit={handlePasswordReset} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls}
                      style={{ border: "1px solid #E0D5C5", color: "#1C1C1C" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                    />
                    {resetMessage && (
                      <p className={`text-sm px-3 py-2 rounded-lg ${resetMessage.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                        {resetMessage.text}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={resetSubmitting}
                      className="w-full py-2.5 rounded-full text-sm font-semibold text-white disabled:opacity-60"
                      style={{ backgroundColor: "#B83A2A" }}
                    >
                      {resetSubmitting ? "Sending…" : "Send Reset Link"}
                    </button>
                  </form>
                  <button
                    onClick={() => { setShowReset(false); setResetMessage(null); }}
                    className="mt-3 text-xs underline w-full text-center"
                    style={{ color: "#6B5E52" }}
                  >
                    ← Back to log in
                  </button>
                </div>
              ) : (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B5E52" }}>Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputCls}
                      style={{ border: "1px solid #E0D5C5", color: "#1C1C1C" }}
                      placeholder="you@example.com"
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B5E52" }}>Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={inputCls}
                      style={{ border: "1px solid #E0D5C5", color: "#1C1C1C" }}
                      placeholder="Min. 6 characters"
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                    />
                    <div className="flex justify-end mt-1.5">
                      <button
                        type="button"
                        onClick={() => { setShowReset(true); setMessage(null); }}
                        className="text-xs transition-opacity hover:opacity-70"
                        style={{ color: "#B83A2A" }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                  {message && (
                    <p className={`text-sm px-3 py-2 rounded-lg ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                      {message.text}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                    style={{ backgroundColor: "#B83A2A" }}
                  >
                    {submitting ? "Please wait…" : "Log In"}
                  </button>
                </form>
              )}
            </>
          ) : verified ? (
            /* ── SIGN UP TAB — post-Stripe account creation ─────── */
            <>
              <div className="mb-5 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#B83A2A18", color: "#B83A2A" }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Payment confirmed! Create your account to get full access.
              </div>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B5E52" }}>Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputCls}
                    style={{ border: "1px solid #E0D5C5", color: "#1C1C1C" }}
                    placeholder="you@example.com"
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B5E52" }}>Choose a password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                    style={{ border: "1px solid #E0D5C5", color: "#1C1C1C" }}
                    placeholder="Min. 6 characters"
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                  />
                </div>
                {message && (
                  <p className={`text-sm px-3 py-2 rounded-lg ${message.type === "error" ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
                    {message.text}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: "#B83A2A" }}
                >
                  {submitting ? "Please wait…" : "Create Account & Access Map"}
                </button>
              </form>
            </>
          ) : (
            /* ── SIGN UP TAB — normal Stripe flow ───────────────── */
            <>
              <p className="text-sm leading-snug mb-5" style={{ color: "#1C1C1C", fontFamily: "Georgia, serif", fontWeight: 600, fontSize: "16px" }}>
                Start your 14-day free trial for full access to the BridgeCross Map
              </p>

              {/* Feature list */}
              <ul className="space-y-2.5 mb-6">
                {FEATURES.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm" style={{ color: "#1C1C1C" }}>
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

              <div className="h-px mb-5" style={{ backgroundColor: "#E0D5C5" }} />

              <form onSubmit={handleStartTrial} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B5E52" }}>Email address</label>
                  <input
                    type="email"
                    required
                    value={trialEmail}
                    onChange={(e) => setTrialEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputCls}
                    style={{ border: "1px solid #E0D5C5", color: "#1C1C1C" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
                  />
                </div>
                {trialError && (
                  <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{trialError}</p>
                )}
                <button
                  type="submit"
                  disabled={trialLoading}
                  className="w-full py-3 rounded-full text-sm font-bold text-white transition-opacity disabled:opacity-60"
                  style={{ backgroundColor: "#B83A2A", boxShadow: "0 2px 12px rgba(184,58,42,0.30)" }}
                >
                  {trialLoading ? "Redirecting to checkout…" : "Start 14-Day Free Trial →"}
                </button>
              </form>

              <p className="mt-4 text-xs text-center" style={{ color: "#6B5E52" }}>
                Already have an account?{" "}
                <button
                  onClick={() => { setTab("login"); setMessage(null); }}
                  className="font-semibold underline transition-opacity hover:opacity-70"
                  style={{ color: "#B83A2A" }}
                >
                  Log in here
                </button>
              </p>
            </>
          )}
        </div>
      </div>

      <p className="mt-6 text-xs" style={{ color: "#6B5E52" }}>
        <Link href="/" className="underline hover:opacity-80">← Back to map</Link>
      </p>
    </div>
  );
}
