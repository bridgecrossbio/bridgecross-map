"use client";

import { Category } from "@/types/company";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/companies";
import { useSignupModal } from "@/lib/signup-modal-context";

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
  const { openModal } = useSignupModal();
  return (
    <aside
      className="absolute top-4 left-4 z-40 w-64 bg-white overflow-hidden flex flex-col max-h-[calc(100%-2rem)]"
      style={{ boxShadow: "0 1px 8px rgba(28,28,28,0.10)", borderRadius: "12px", border: "1px solid #E0D5C5" }}
    >
      {/* Filters */}
      <div className="overflow-y-auto flex-1 p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "#6B5E52" }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search companies…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none transition-colors placeholder:text-[#6B5E52]"
            style={{
              backgroundColor: "#F5EDE0",
              border: "1px solid #E0D5C5",
              color: "#1C1C1C",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: "#6B5E52" }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category filters */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#6B5E52" }}>
            Categories
          </p>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const active = activeCategories.has(cat);
              const color = CATEGORY_COLORS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => onToggleCategory(cat)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-left"
                  style={{
                    backgroundColor: active ? color : "#FFFFFF",
                    borderLeft: `3px solid ${color}`,
                    color: active ? "#FFFFFF" : "#1C1C1C",
                    borderRadius: "0 6px 6px 0",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.08)"; e.currentTarget.style.transform = "scale(1.02)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = ""; e.currentTarget.style.transform = ""; }}
                >
                  <span>{cat === "China VC" ? "VC" : cat}</span>
                  <span style={{ fontSize: "16px", fontWeight: 300, color: active ? "#FFFFFF" : color, lineHeight: 1 }}>
                    {active ? "−" : "+"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Result count */}
        <p className="text-xs pt-1 border-t" style={{ color: "#6B5E52", borderColor: "#E0D5C5" }}>
          {resultCount} {resultCount === 1 ? "company" : "companies"} shown
        </p>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t" style={{ backgroundColor: "#EDE3D3", borderColor: "#E0D5C5" }}>
        <button
          onClick={openModal}
          className="text-xs text-left w-full group"
          style={{ color: "#6B5E52", cursor: "pointer", transition: "color 0.15s ease" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#B83A2A"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#6B5E52"; }}
        >
          Get full access for complete company information.{" "}
          <strong className="group-hover:underline" style={{ color: "inherit" }}>Free 14-day trial.</strong>
        </button>
      </div>
    </aside>
  );
}
