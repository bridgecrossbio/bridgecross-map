"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthPageInner />
    </Suspense>
  );
}

function AuthPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      router.replace("/");
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

      <div
        className="w-full bg-white rounded-2xl overflow-hidden"
        style={{
          maxWidth: "360px",
          boxShadow: "0 4px 24px rgba(28,28,28,0.10)",
          border: "1px solid #E0D5C5",
        }}
      >
        <div className="px-6 py-4 border-b" style={{ borderColor: "#E0D5C5" }}>
          <h1 className="text-sm font-semibold text-center" style={{ color: "#1C1C1C" }}>Log In</h1>
        </div>

        <div className="p-6">
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
        </div>
      </div>

      <p className="mt-6 text-xs" style={{ color: "#6B5E52" }}>
        <Link href="/" className="underline hover:opacity-80">← Back to map</Link>
      </p>
    </div>
  );
}
