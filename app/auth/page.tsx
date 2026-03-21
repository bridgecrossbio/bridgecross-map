"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage({ type: "error", text: error.message });
    else router.replace("/");
    setSubmitting(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage({ type: "error", text: error.message });
    } else if (data.user) {
      // Create profile row with 3-day trial
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
      });
      if (data.session) {
        router.replace("/");
      } else {
        setMessage({ type: "success", text: "Account created! Check your email to confirm, then log in." });
      }
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: "#F5EFE6" }}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#8B3A2F" }}>
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        </div>
        <div>
          <p className="font-bold leading-tight" style={{ color: "#8B3A2F" }}>BridgeCross Bio</p>
          <p className="text-xs text-gray-500 leading-tight">Chinese Biotech Map</p>
        </div>
      </Link>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Tab switcher */}
        <div className="flex border-b border-gray-100">
          {(["login", "signup"] as const).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setMessage(null); }}
              className="flex-1 py-3.5 text-sm font-semibold transition-colors"
              style={{
                color: tab === t ? "#8B3A2F" : "#9CA3AF",
                borderBottom: tab === t ? "2px solid #8B3A2F" : "2px solid transparent",
              }}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Free trial badge (signup only) */}
          {tab === "signup" && (
            <div className="mb-5 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium" style={{ backgroundColor: "#C4622D18", color: "#C4622D" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              3-day free trial — no credit card required
            </div>
          )}

          <form onSubmit={tab === "login" ? handleLogin : handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                style={{ "--tw-ring-color": "#8B3A2F50" } as React.CSSProperties}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                placeholder="Min. 6 characters"
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
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ backgroundColor: "#8B3A2F" }}
            >
              {submitting ? "Please wait…" : tab === "login" ? "Log In" : "Create Account & Start Trial"}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        <Link href="/" className="underline hover:text-gray-600">← Back to map</Link>
      </p>
    </div>
  );
}
