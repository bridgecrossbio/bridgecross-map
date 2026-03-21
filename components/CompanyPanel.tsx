"use client";

import { useRouter } from "next/navigation";
import { Company } from "@/types/company";
import { CATEGORY_COLORS } from "@/lib/companies";

interface CompanyPanelProps {
  company: Company;
  onClose: () => void;
  hasAccess: boolean;
  isLoggedIn: boolean;
}

export default function CompanyPanel({ company, onClose, hasAccess, isLoggedIn }: CompanyPanelProps) {
  const color = CATEGORY_COLORS[company.category] ?? "#8B3A2F";
  const router = useRouter();

  return (
    <div className="absolute bottom-6 right-6 z-40 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Colour strip */}
      <div className="h-1.5" style={{ backgroundColor: color }} />

      <div className="p-5 max-h-[80vh] overflow-y-auto">
        {/* Header — always visible */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5"
              style={{ backgroundColor: color + "22", color }}
            >
              {company.category === "China VC" ? "VC" : company.category}
              {company.sub_category ? ` · ${company.sub_category}` : ""}
            </span>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{company.name}</h2>
            {company.name_chinese && (
              <p className="text-sm text-gray-400 mt-0.5">{company.name_chinese}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 mt-0.5 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Gated content */}
        {hasAccess ? (
          <FullDetail company={company} color={color} />
        ) : (
          <GateOverlay isLoggedIn={isLoggedIn} onAction={() => router.push("/auth")} color={color} />
        )}
      </div>
    </div>
  );
}

function FullDetail({ company, color }: { company: Company; color: string }) {
  return (
    <>
      {company.description && (
        <p className="text-sm text-gray-600 leading-relaxed mb-4">{company.description}</p>
      )}

      <dl className="space-y-1.5 text-sm mb-4">
        <Row label="Location">
          {company.city}{company.province ? `, ${company.province}` : ""}
        </Row>
        {company.founded && <Row label="Founded">{company.founded}</Row>}
        {company.funding_stage && <Row label="Stage">{company.funding_stage}</Row>}
        {company.funding_total && <Row label="Funding">{company.funding_total}</Row>}
        {company.employees_range && <Row label="Employees">{company.employees_range}</Row>}
        {company.technology_type && <Row label="Technology">{company.technology_type}</Row>}
        {company.listed !== null && <Row label="Listed">{company.listed ? "Yes" : "No"}</Row>}
      </dl>

      {company.key_products && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#8B3A2F80" }}>
            Key products
          </p>
          <p className="text-sm text-gray-600">{company.key_products}</p>
        </div>
      )}

      {company.website && (
        <a
          href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: "#C4622D" }}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          <span className="truncate">{company.website.replace(/^https?:\/\//, "")}</span>
        </a>
      )}
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 flex-shrink-0 text-gray-400 font-medium">{label}</dt>
      <dd className="text-gray-700">{children}</dd>
    </div>
  );
}

function GateOverlay({ isLoggedIn, onAction, color }: { isLoggedIn: boolean; onAction: () => void; color: string }) {
  return (
    <div>
      {/* Blurred placeholder content */}
      <div className="relative mb-4">
        <div className="blur-sm select-none pointer-events-none space-y-2 text-sm text-gray-600">
          <p>This Chinese biotech company is active in sequencing technology and genomics research, with a significant presence across major research hubs.</p>
          <div className="space-y-1.5">
            {["Location", "Founded", "Stage", "Funding"].map((l) => (
              <div key={l} className="flex gap-2">
                <span className="w-24 text-gray-400 font-medium">{l}</span>
                <span className="bg-gray-200 rounded text-gray-200">████████████</span>
              </div>
            ))}
          </div>
        </div>
        {/* Lock overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm bg-white border border-gray-100">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: "#F5EFE6", borderColor: "#8B3A2F18" }}>
        {isLoggedIn ? (
          <>
            <p className="text-sm font-semibold text-gray-800 mb-1">Your free trial has ended</p>
            <p className="text-xs text-gray-500 mb-3">Upgrade to continue accessing company profiles.</p>
            <a
              href="https://bridgecrossbio.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#8B3A2F" }}
            >
              Upgrade on Substack →
            </a>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold text-gray-800 mb-1">Free 3-day trial</p>
            <p className="text-xs text-gray-500 mb-3">Sign up to access all {55} company profiles. No credit card required.</p>
            <button
              onClick={onAction}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: "#8B3A2F" }}
            >
              Start free trial →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
