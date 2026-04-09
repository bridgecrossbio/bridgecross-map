"use client";

import dynamic from "next/dynamic";
import { useState, useMemo, useEffect } from "react";
import { Company, Category } from "@/types/company";
import { CATEGORIES } from "@/lib/companies";
import { fetchCompanies } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import Sidebar from "@/components/Sidebar";
import CompanyPanel from "@/components/CompanyPanel";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set(CATEGORIES));
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, hasAccess } = useAuth();

  useEffect(() => {
    fetchCompanies()
      .then((data) => {
        const validCategories = new Set<string>(CATEGORIES);
        const filtered = (data ?? []).filter((c): c is Company => {
          if (c.lat == null || c.lng == null) return false;
          if (!validCategories.has(c.category)) return false;
          return true;
        });
        setCompanies(filtered);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const toggleCategory = (cat: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const filteredCompanies = useMemo(() => {
    const q = search.toLowerCase().trim();
    return companies.filter((c) => {
      const matchesCategory = activeCategories.has(c.category);
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        (c.name_chinese ?? "").toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [companies, search, activeCategories]);

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany((prev) => (prev?.id === company.id ? null : company));
  };

  const sidebarProps = {
    search,
    onSearchChange: setSearch,
    activeCategories,
    onToggleCategory: toggleCategory,
    companies: filteredCompanies,
    selectedCompany,
    isLoggedIn: !!user,
  };

  return (
    <main className="flex w-screen overflow-hidden h-[calc(100vh-72px)] mt-[72px] relative">

      {/* ── Map (full width on mobile, flex-1 on desktop) ─────────────────── */}
      <div className="relative flex-1 min-w-0">
        <Map
          companies={filteredCompanies}
          selectedCompany={selectedCompany}
          onSelectCompany={handleSelectCompany}
        />

        {/* Company panel — responsive: bottom sheet on mobile, overlay on desktop */}
        {selectedCompany && (
          <CompanyPanel
            company={selectedCompany}
            onClose={() => setSelectedCompany(null)}
            hasAccess={hasAccess}
            isLoggedIn={!!user}
          />
        )}

        {loading && (
          <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg text-sm text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            Loading companies…
          </div>
        )}
        {error && (
          <div className="absolute top-4 right-4 z-20 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 shadow-lg text-sm text-red-600">
            Failed to load: {error}
          </div>
        )}
      </div>

      {/* ── Desktop sidebar (hidden on mobile) ────────────────────────────── */}
      <div className="hidden md:flex">
        <Sidebar
          {...sidebarProps}
          onSelectCompany={handleSelectCompany}
        />
      </div>

      {/* ── Mobile: floating bottom bar (hidden when company panel is open) ── */}
      {!selectedCompany && (
        <div
          className="md:hidden fixed bottom-0 inset-x-0 z-40 flex items-center px-4 py-3"
          style={{
            backgroundColor: "#FFFFFF",
            borderTop: "1px solid #E0D5C5",
            paddingBottom: "max(12px, env(safe-area-inset-bottom))",
          }}
        >
          {/* Filter / search button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{ backgroundColor: "#F5EDE0", color: "#1C1C1C", border: "1px solid #E0D5C5" }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2" />
            </svg>
            Filters
          </button>

          {/* Count pill */}
          <div className="flex-1 flex justify-center">
            <span
              className="px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ backgroundColor: "#F5EDE0", color: "#1C1C1C", border: "1px solid #E0D5C5" }}
            >
              {filteredCompanies.length} {filteredCompanies.length === 1 ? "company" : "companies"}
            </span>
          </div>

          {/* Spacer to balance the filter button */}
          <div style={{ width: "84px" }} />
        </div>
      )}

      {/* ── Mobile: sidebar bottom sheet ──────────────────────────────────── */}
      {/* Backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        style={{ backgroundColor: "rgba(28,28,28,0.4)" }}
        onClick={() => setSidebarOpen(false)}
      />
      {/* Sheet */}
      <div
        className={`md:hidden fixed inset-x-0 bottom-0 z-50 flex flex-col bg-white rounded-t-2xl transition-transform duration-300 ${sidebarOpen ? "translate-y-0" : "translate-y-full"}`}
        style={{ height: "70vh", boxShadow: "0 -4px 24px rgba(28,28,28,0.12)" }}
      >
        {/* Drag handle */}
        <div
          className="flex-shrink-0 flex justify-center pt-3 pb-2 cursor-pointer"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "#E0D5C5" }} />
        </div>

        {/* Sidebar content fills the sheet */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden" style={{ borderTop: "1px solid #E0D5C5" }}>
          <Sidebar
            {...sidebarProps}
            onSelectCompany={(company) => {
              handleSelectCompany(company);
              setSidebarOpen(false);
            }}
          />
        </div>
      </div>

    </main>
  );
}
