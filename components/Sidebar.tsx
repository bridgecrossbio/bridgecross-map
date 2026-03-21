"use client";

import { Category } from "@/types/company";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/companies";

interface SidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeCategories: Set<Category>;
  onToggleCategory: (cat: Category) => void;
  resultCount: number;
}

export default function Sidebar({
  search,
  onSearchChange,
  activeCategories,
  onToggleCategory,
  resultCount,
}: SidebarProps) {
  return (
    <aside className="absolute top-4 left-4 z-40 w-64 bg-white/97 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[calc(100%-2rem)]">
      {/* Filters */}
      <div className="overflow-y-auto flex-1 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search companies…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none transition-colors placeholder:text-gray-400"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category filters */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#8B3A2F80" }}>
            Categories
          </p>
          <div className="space-y-0.5">
            {CATEGORIES.map((cat) => {
              const active = activeCategories.has(cat);
              const color = CATEGORY_COLORS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => onToggleCategory(cat)}
                  className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-all hover:bg-gray-50"
                >
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center border-2 transition-all"
                    style={{ borderColor: color, backgroundColor: active ? color : "transparent" }}
                  >
                    {active && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className={active ? "text-gray-800 font-medium" : "text-gray-400"}>
                    {cat === "China VC" ? "VC" : cat}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
          {resultCount} {resultCount === 1 ? "company" : "companies"} shown
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100" style={{ backgroundColor: "#F5EFE680" }}>
        <a
          href="https://bridgecrossbio.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-medium transition-opacity hover:opacity-80"
          style={{ color: "#C4622D" }}
        >
          <span className="w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0" style={{ backgroundColor: "#C4622D" }}>S</span>
          Read our research on Substack
          <svg className="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
