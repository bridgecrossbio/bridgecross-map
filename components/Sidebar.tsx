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

// Returns the longest common prefix of an array of strings, but only if it
// ends at a word boundary (space or end-of-string). Otherwise returns the
// first name in full, preventing mid-word truncation (e.g. "Gene" from
// "Geneplus" + "Genecreate").
function commonPrefix(names: string[]): string {
  if (names.length === 1) return names[0];
  let prefix = names[0];
  for (const name of names.slice(1)) {
    while (prefix.length > 0 && !name.startsWith(prefix)) {
      prefix = prefix.slice(0, -1).trim();
    }
    if (!prefix) break;
  }
  prefix = prefix.trim();
  // Reject the prefix if it cuts mid-word in the first name
  const nextChar = names[0].charAt(prefix.length);
  if (!prefix || (nextChar !== "" && nextChar !== " ")) return names[0];
  return prefix;
}

interface CompanyGroup {
  representative: Company;       // first entry — used for logo, city, founded, onClick
  displayName: string;           // common prefix of all names in group
  categories: Category[];        // all unique categories across the group
  isSelected: boolean;
}

interface SidebarProps {
  search: string;
  onSearchChange: (value: string) => void;
  activeCategories: Set<Category>;
  onToggleCategory: (cat: Category) => void;
  companies: Company[];          // filteredCompanies from page
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
  selectedCompany,
  onSelectCompany,
  isLoggedIn,
}: SidebarProps) {
  const { openModal } = useSignupModal();

  // ── Group companies — only the explicit BGI case merges multiple DB rows.
  // All other companies get their own card keyed by id.
  const groupedCompanies = useMemo((): CompanyGroup[] => {
    const buckets = new Map<string, Company[]>();

    function groupKey(c: Company): string {
      if (c.name_chinese === "华大基因" || c.name.startsWith("BGI")) return "group:BGI";
      return `id:${c.id}`;
    }

    for (const c of companies) {
      const key = groupKey(c);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key)!.push(c);
    }

    return Array.from(buckets.values()).map((group) => {
      // For BGI, put the Sequencing entry first so it opens as the primary panel
      if (group[0] && groupKey(group[0]) === "group:BGI") {
        group.sort((a) => (a.category === "Sequencing" ? -1 : 1));
      }
      const selectedIds = new Set(group.map((c) => c.id));
      return {
        representative: group[0],
        displayName: commonPrefix(group.map((c) => c.name)),
        categories: [...new Set(group.map((c) => c.category))],
        isSelected: selectedCompany != null && selectedIds.has(selectedCompany.id),
      };
    });
  }, [companies, selectedCompany]);

  const cityCount = useMemo(
    () => new Set(companies.map((c) => c.city)).size,
    [companies],
  );

  const stats = [
    { value: groupedCompanies.length, label: "companies" },
    { value: activeCategories.size, label: "sectors" },
    { value: cityCount, label: "cities" },
  ];

  return (
    <aside
      className="flex-shrink-0 flex flex-col h-full w-full md:w-[300px] md:border-l md:border-[#E0D5C5]"
      style={{ backgroundColor: "#FFFFFF" }}
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

        {/* Stat pills — 3 columns */}
        <div className="grid grid-cols-3 gap-1.5">
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

        {/* Category filters — desktop: stacked full-width, mobile: horizontal chips */}
        <div className="hidden md:block space-y-1">
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
        <div className="md:hidden grid grid-cols-2 gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = activeCategories.has(cat);
            const color = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-left"
                style={{
                  backgroundColor: active ? color : "#F5EDE0",
                  border: `1px solid ${active ? color : "#E0D5C5"}`,
                  color: active ? "#FFFFFF" : "#1C1C1C",
                  transition: "all 0.15s ease",
                }}
              >
                <span
                  className="flex-shrink-0 rounded-full"
                  style={{ width: 8, height: 8, backgroundColor: active ? "#FFFFFF" : color }}
                />
                <span className="flex-1 truncate">{cat === "China VC" ? "VC" : cat}</span>
                <span style={{ color: active ? "rgba(255,255,255,0.8)" : color, lineHeight: 1, fontSize: "13px", fontWeight: 300 }}>
                  {active ? "−" : "+"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Company list ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        {groupedCompanies.map(({ representative, displayName, categories, isSelected }) => (
          <button
            key={representative.id}
            onClick={() => onSelectCompany(representative)}
            className="w-full text-left flex gap-3 items-start transition-colors"
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #E0D5C5",
              backgroundColor: isSelected ? "#F5EDE0" : "transparent",
            }}
            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "#FAF5EE"; }}
            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = "transparent"; }}
          >
            {/* Logo slot — always 28×28 so all cards align identically */}
            <CompanyLogo company={representative} />

            {/* Text block */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold leading-tight mb-0.5" style={{ color: "#1C1C1C" }}>
                {displayName}
              </p>
              {representative.name_chinese && (
                <p className="text-xs leading-tight mb-1 truncate" style={{ color: "#6B5E52" }}>
                  {representative.name_chinese}
                </p>
              )}
              <div className="flex flex-wrap gap-1 mb-1">
                {categories.map((cat) => (
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
                {representative.city}{representative.founded ? ` · ${representative.founded}` : ""}
              </p>
              {representative.description && (
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
                  {representative.description}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* ── Pinned CTA ────────────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <>
          {/* Mobile: compact single-line text link */}
          <div className="md:hidden flex-shrink-0 px-4 py-2" style={{ borderTop: "1px solid #E0D5C5" }}>
            <button
              onClick={openModal}
              className="text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ color: "#B83A2A" }}
            >
              Unlock full access — Subscribe free →
            </button>
          </div>
          {/* Desktop: full CTA box */}
          <div className="hidden md:block flex-shrink-0 p-3" style={{ borderTop: "1px solid #E0D5C5" }}>
            <div className="rounded-xl p-3" style={{ backgroundColor: "#EDE3D3", border: "1px solid #E0D5C5" }}>
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
        </>
      )}
    </aside>
  );
}

// Always renders a 28×28 container so cards stay aligned even when logo is absent
// or fails to load. Uses visibility:hidden on error rather than display:none.
function CompanyLogo({ company }: { company: Company }) {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  const domain = company.logo_url?.replace(/^https?:\/\/logo\.clearbit\.com\//, "");

  return (
    <div className="flex-shrink-0" style={{ width: 28, height: 28, marginTop: 2 }}>
      {domain && token && (
        <img
          src={`https://img.logo.dev/${domain}?token=${token}&size=56`}
          alt=""
          className="w-full h-full rounded object-contain"
          onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
        />
      )}
    </div>
  );
}
