"use client";

import { ReactNode } from "react";

export default function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen pt-14" style={{ backgroundColor: "#F5EFE6" }}>
      <main className="max-w-3xl mx-auto px-6 py-12">
        {children}
      </main>

      <footer className="border-t border-[#8B3A2F]/10 bg-white/60 mt-16">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <span>© {new Date().getFullYear()} BridgeCross Bio. Independent research.</span>
          <a
            href="https://bridgecrossbio.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-medium transition-colors hover:opacity-80"
            style={{ color: "#C4622D" }}
          >
            <span className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: "#C4622D" }}>S</span>
            Read our research
          </a>
        </div>
      </footer>
    </div>
  );
}
