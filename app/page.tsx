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

  const { user, hasAccess } = useAuth();

  useEffect(() => {
    fetchCompanies()
      .then((data) => {
        console.log("Total fetched from Supabase:", data?.length);
        console.log("Companies with missing category:", data?.filter((c) => !c.category));
        console.log("Distinct categories:", [...new Set(data?.map((c) => c.category))]);

        const validCategories = new Set<string>(CATEGORIES);
        const filtered = (data ?? []).filter((c): c is Company => {
          if (c.lat == null || c.lng == null) {
            console.log(`[dropped] "${c.name}" — missing lat/lng`);
            return false;
          }
          if (!validCategories.has(c.category)) {
            console.log(`[dropped] "${c.name}" — unrecognised category: "${c.category}"`);
            return false;
          }
          return true;
        });

        console.log("Companies passed to map:", filtered.length);
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

  return (
    <main className="relative z-0 w-screen overflow-hidden h-[calc(100vh-92px)] mt-[92px]">
      <Map
        companies={filteredCompanies}
        selectedCompany={selectedCompany}
        onSelectCompany={handleSelectCompany}
      />

      <Sidebar
        search={search}
        onSearchChange={setSearch}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        resultCount={filteredCompanies.length}
      />

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
    </main>
  );
}
