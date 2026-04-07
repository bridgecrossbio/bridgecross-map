"use client";

import { useMemo } from "react";
import { Company, Category } from "@/types/company";
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/companies";
import { useSignupModal } from "@/lib/signup-modal-context";

const CAT_ABBREV: Record<Category, string> = {
  "Sequencing": "Seq",
  "Liquid Biopsy": "Liq Biopsy",
  "DNA Synthesis": "DNA Synth",
  "AI Drug Discovery": "AI Drug",
  "China VC": "VC",
};

interface SidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeCategories: Set<Category>;
  onToggleCategory: (cat: Category) => void;
  companies: Company[];
  allCompanies: Company[];
  selectedCompany: Company | null;
  onSelectCompany: (company: Company) => void;
  isLoggedIn: boolean;
}

export default function Sidebar({
  search,
  onSearchChange,
  activeCategories,
  onToggleCategory,
  companies,
  allCompanies,
  selectedCompany,
  onSelectCompany,
  isLoggedIn,
}: SidebarProps) {
  const { openModal } = useSignupModal();

  const cityCount = useMemo(() => new Set(companies.map((c) => c.city)).size, [companies]);

  // Build name → all categories from the full (unfiltered) dataset
  const nameToCategories = useMemo(() => {
    const map: Record<string, Category[]> = {};
    for (const c of allCompanies) {
      if (!map[c.name]) map[c.name] = [];
      if (!map[c.name].includes(c.category)) map[c.name].push(c.category);
    }
    return map;
  }, [allCompanies]);

  const stats = [
    { value: companies.length, label: "companies" },
    { value: activeCategories.size, label: "sectors" },
    { value: cityCount, label: "cities" },
    { value: 1, label: "country" },
  ];

  return (
    <aside
      className="flex-shrink-0 flex flex-col h-full"
      style={{
        width: "300px",
        borderLeft: "1px solid #E0D5C5",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* ── Top controls ──────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 p-3 space-y-3" style={{ borderBottom: "1px solid #E0D5C5" }}>
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
            placeholder="Search companies, technology, location..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none transition-colors placeholder:text-[#6B5E52]"
            style={{ backgroundColor: "#F5EDE0", border: "1px solid #E0D5C5", color: "#1C1C1C" }}
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

        {/* Stat pills */}
        <div className="grid grid-cols-4 gap-1.5">
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="rounded-lg py-1.5 px-1 text-center"
              style={{ backgroundColor: "#F5EDE0" }}
            >
              <div className="text-base font-bold leading-tight" style={{ color: "#1C1C1C" }}>{value}</div>
              <div className="text-[9px] leading-tight mt-0.5" style={{ color: "#6B5E52" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Category filters */}
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const active = activeCategories.has(cat);
            const color = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-sm font-medium text-left"
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

      {/* ── Company list ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {companies.map((company) => {
          const allCats = nameToCategories[company.name] ?? [company.category];
          const isSelected = selectedCompany?.id === company.id;
          return (
            <button
              key={company.id}
              onClick={() => onSelectCompany(company)}
              className="w-full text-left px-4 py-3 flex gap-3 items-start transition-colors"
              style={{
                borderBottom: "1px solid #E0D5C5",
                backgroundColor: isSelected ? "#F5EDE0" : "transparent",
              }}
              onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#FAF5EE"; }}
              onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              {/* Logo */}
              <CompanyLogo company={company} />

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight mb-0.5" style={{ color: "#1C1C1C" }}>
                  {company.name}
                </p>
                {company.name_chinese && (
                  <p className="text-xs leading-tight mb-1 truncate" style={{ color: "#6B5E52" }}>
                    {company.name_chinese}
                  </p>
                )}
                {/* Category badges — one per category this company appears in */}
                <div className="flex flex-wrap gap-1 mb-1">
                  {allCats.map((cat) => (
                    <span
                      key={cat}
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full text-white leading-tight"
                      style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                    >
                      {CAT_ABBREV[cat]}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] mb-1" style={{ color: "#9B8E84" }}>
                  {company.city}{company.founded ? ` · ${company.founded}` : ""}
                </p>
                {company.description && (
                  <p
                    className="text-xs leading-relaxed"
                    style={{
                      color: "#6B5E52",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {company.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Pinned CTA ────────────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <div className="flex-shrink-0 p-3" style={{ borderTop: "1px solid #E0D5C5" }}>
          <div
            className="rounded-xl p-3"
            style={{ backgroundColor: "#EDE3D3", border: "1px solid #E0D5C5" }}
          >
            <p className="text-sm font-bold mb-1" style={{ color: "#1C1C1C" }}>Unlock full access</p>
            <p className="text-xs mb-3" style={{ color: "#6B5E52" }}>
              Create a free account to see all company data
            </p>
            <button
              onClick={openModal}
              className="w-full py-2 rounded-full text-xs font-bold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#B83A2A", boxShadow: "0 2px 8px rgba(184,58,42,0.25)" }}
            >
              Subscribe free →
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

function CompanyLogo({ company }: { company: Company }) {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  if (!company.logo_url || !token) return <div className="w-7 h-7 flex-shrink-0" />;

  const domain = company.logo_url.replace(/^https?:\/\/logo\.clearbit\.com\//, "");
  return (
    <img
      src={`https://img.logo.dev/${domain}?token=${token}&size=56`}
      alt=""
      className="flex-shrink-0 rounded object-contain"
      style={{ width: "28px", height: "28px", marginTop: "1px" }}
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  );
}
