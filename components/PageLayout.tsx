"use client";

import { ReactNode } from "react";

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pt-[92px]" style={{ backgroundColor: "#F5EDE0" }}>
      <main className="max-w-[740px] mx-auto px-6 py-12">
        {children}
      </main>

      <footer className="mt-16" style={{ borderTop: "1px solid #E0D5C5", backgroundColor: "#EDE3D3" }}>
        <div className="max-w-[740px] mx-auto px-6 py-4 flex items-center gap-3 flex-nowrap overflow-hidden" style={{ color: "#6B5E52", fontSize: "12px" }}>
          <span className="flex-shrink-0">© {new Date().getFullYear()} BridgeCross Bio</span>
          <span style={{ color: "#E0D5C5" }}>·</span>
          <a href="/contact" className="flex-shrink-0 transition-colors hover:text-[#B83A2A]" style={{ color: "#6B5E52" }}>Contact</a>
          <span style={{ color: "#E0D5C5" }}>·</span>
          <a href="https://www.linkedin.com/company/bridgecross-bio/" target="_blank" rel="noopener noreferrer" className="flex-shrink-0 transition-colors hover:text-[#B83A2A]" style={{ color: "#6B5E52" }}>LinkedIn</a>
        </div>
      </footer>
    </div>
  );
}
