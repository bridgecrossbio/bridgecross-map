"use client";

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

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-auto">
      {/* Top support banner */}
      <div className="h-8 flex items-center justify-center px-4" style={{ backgroundColor: "#B83A2A" }}>
        <a
          href="https://bridgecrossbio.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white text-xs font-medium hover:underline tracking-wide"
        >
          Free on Substack: interviews, reports and the latest China biotech news →
        </a>
      </div>

      {/* Main header */}
      <div
        className="border-b flex items-center px-5 gap-6"
        style={{
          backgroundColor: "#F5EDE0",
          borderColor: "#E0D5C5",
          height: "60px",
        }}
      >
        {/* Left: Logo */}
        <div className="flex-shrink-0 w-52">
          <Link href="/" className="flex items-center gap-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="-5 -5 325.21 285.65" style={{ height: "32px", width: "auto" }} fill="#1C1C1C" aria-label="BridgeCross Bio">
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

        {/* Centre: Nav */}
        <nav className="flex-1 flex items-center justify-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative px-3 flex items-center transition-colors"
                style={{
                  height: "60px",
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

        {/* Right: Auth */}
        <div className="flex items-center justify-end flex-shrink-0 w-52" style={{ gap: "8px" }}>
          {user ? (
            <>
              <span className="text-xs truncate max-w-32 hidden sm:block" style={{ color: "#6B5E52" }}>{user.email}</span>
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
                  padding: "7px 18px",
                  borderRadius: "9999px",
                  border: "1px solid #1C1C1C",
                  background: "transparent",
                  color: "#1C1C1C",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget;
                  b.style.background = "#1C1C1C";
                  b.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget;
                  b.style.background = "transparent";
                  b.style.color = "#1C1C1C";
                }}
              >
                Log in
              </button>
              <button
                onClick={openModal}
                className="text-xs text-white transition-colors"
                style={{
                  fontWeight: 700,
                  padding: "8px 20px",
                  borderRadius: "9999px",
                  backgroundColor: "#B83A2A",
                  boxShadow: "0 2px 8px rgba(184,58,42,0.35)",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget;
                  b.style.backgroundColor = "#D4503E";
                  b.style.boxShadow = "0 4px 12px rgba(184,58,42,0.45)";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget;
                  b.style.backgroundColor = "#B83A2A";
                  b.style.boxShadow = "0 2px 8px rgba(184,58,42,0.35)";
                }}
              >
                Start free trial
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
