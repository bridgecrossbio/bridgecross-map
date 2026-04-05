"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useSignupModal } from "@/lib/signup-modal-context";

const NAV = [
  { label: "Map", href: "/" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { openModal } = useSignupModal();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
      {/* Main header */}
      <div
        className="flex items-center px-5"
        style={{
          backgroundColor: "#F5EDE0",
          height: "72px",
          gap: "24px",
        }}
      >
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 325.21 285.65" style={{ height: "40px", width: "auto" }} fill="#1C1C1C" aria-label="BridgeCross Bio">
              <path d="M212.66,204.25h-125.86c-37.03,0-67.16-30.13-67.16-67.16v-1.09c0-37.03,30.13-67.16,67.16-67.16h125.86v26.5h-125.86c-22.42,0-40.66,18.23-40.66,40.66v1.09c0,22.42,18.23,40.66,40.66,40.66h125.86v26.5h0Z"/>
              <path d="M285.54,82.64v-1.09c0-37.03-30.13-67.16-67.16-67.16h-125.86v26.5h125.86c22.42,0,40.66,18.23,40.66,40.65v1.09c0,22.42-18.23,40.65-40.66,40.65h-125.86v26.5h125.86c22.42,0,40.66,18.23,40.66,40.65v1.09c0,22.42-18.23,40.65-40.66,40.65h-125.86v26.5h125.86c37.03,0,67.16-30.13,67.16-67.16v-1.09c0-22.09-10.77-41.66-27.27-53.91,16.5-12.25,27.27-31.82,27.27-53.91v.04Z"/>
            </svg>
            <div>
              <p className="font-bold text-sm leading-tight" style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}>
                BridgeCross Bio
              </p>
              <p className="text-[10px] leading-tight" style={{ color: "#6B5E52" }}>
                Mapping Chinese Biotech
              </p>
            </div>
          </Link>
        </div>

        {/* Centre: Nav — hidden on mobile */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3 flex items-center transition-colors"
                style={{
                  height: "72px",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                  color: active ? "#B83A2A" : "#1C1C1C",
                  borderBottom: active ? "3px solid #B83A2A" : "3px solid transparent",
                  fontFamily: "var(--font-body)",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth buttons — hidden on mobile */}
        <div className="hidden md:flex items-center justify-end flex-shrink-0 w-52" style={{ gap: "8px" }}>
          {user ? (
            <>
              <span className="text-xs truncate max-w-32" style={{ color: "#6B5E52" }}>{user.email}</span>
              <button
                onClick={signOut}
                className="text-xs font-medium transition-colors hover:underline"
                style={{ color: "#B83A2A" }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/auth?tab=login")}
                className="text-xs transition-colors"
                style={{
                  fontWeight: 500,
                  padding: "7px 14px",
                  borderRadius: "9999px",
                  border: "1px solid #1C1C1C",
                  background: "transparent",
                  color: "#1C1C1C",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#1C1C1C"; e.currentTarget.style.color = "#FFFFFF"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#1C1C1C"; }}
              >
                Log in
              </button>
              <button
                onClick={openModal}
                className="text-xs text-white transition-colors"
                style={{
                  fontWeight: 700,
                  padding: "8px 16px",
                  borderRadius: "9999px",
                  backgroundColor: "#B83A2A",
                  boxShadow: "0 2px 8px rgba(184,58,42,0.35)",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#D4503E"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#B83A2A"; }}
              >
                Subscribe free
              </button>
            </>
          )}
        </div>

        {/* Mobile: hamburger button */}
        <button
          className="md:hidden ml-auto flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-colors"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          style={{ color: "#1C1C1C" }}
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div
          className="md:hidden border-b"
          style={{ backgroundColor: "#F5EDE0", borderColor: "#E0D5C5" }}
        >
          <nav className="flex flex-col px-5 py-2">
            {NAV.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3 text-sm font-semibold uppercase tracking-wide border-b transition-colors"
                  style={{
                    borderColor: "#E0D5C5",
                    color: active ? "#B83A2A" : "#1C1C1C",
                    letterSpacing: "0.5px",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="px-5 py-4 flex flex-col gap-2">
            {user ? (
              <>
                <p className="text-xs truncate" style={{ color: "#6B5E52" }}>{user.email}</p>
                <button
                  onClick={() => { signOut(); setMenuOpen(false); }}
                  className="text-sm font-medium text-left hover:underline"
                  style={{ color: "#B83A2A" }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { router.push("/auth?tab=login"); setMenuOpen(false); }}
                  className="w-full py-2.5 rounded-full text-sm font-medium transition-colors"
                  style={{
                    border: "1px solid #1C1C1C",
                    background: "transparent",
                    color: "#1C1C1C",
                  }}
                >
                  Log in
                </button>
                <button
                  onClick={() => { openModal(); setMenuOpen(false); }}
                  className="w-full py-2.5 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: "#B83A2A", boxShadow: "0 2px 8px rgba(184,58,42,0.35)" }}
                >
                  Subscribe free
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
