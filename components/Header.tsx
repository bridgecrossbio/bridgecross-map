"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

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

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-14 backdrop-blur-md flex items-center px-5 gap-4 pointer-events-auto"
      style={{ backgroundColor: "rgba(139, 58, 47, 0.92)" }}
    >
      {/* Left: Logo + tagline */}
      <div className="flex items-center gap-2.5 w-56 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">BridgeCross Bio</p>
            <p className="text-white/55 text-[10px] leading-tight">Mapping the Chinese Biotech Landscape</p>
          </div>
        </Link>
      </div>

      {/* Centre: Nav */}
      <nav className="flex-1 flex items-center justify-center gap-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                color: active ? "white" : "rgba(255,255,255,0.65)",
                backgroundColor: active ? "rgba(255,255,255,0.15)" : "transparent",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Right: Auth */}
      <div className="flex items-center justify-end gap-3 w-56 flex-shrink-0">
        {user ? (
          <>
            <span className="text-white/55 text-xs truncate max-w-36 hidden sm:block">{user.email}</span>
            <button
              onClick={signOut}
              className="text-xs font-medium px-3 py-1.5 rounded-lg transition-colors bg-white/10 hover:bg-white/20 text-white"
            >
              Log out
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/auth")}
            className="text-xs font-semibold px-3.5 py-1.5 rounded-lg transition-colors bg-white hover:bg-white/90"
            style={{ color: "#8B3A2F" }}
          >
            Login / Sign Up
          </button>
        )}
      </div>
    </header>
  );
}
