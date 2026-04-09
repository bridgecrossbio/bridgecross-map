"use client";

import Link from "next/link";
import { Company } from "@/types/company";
import { CATEGORY_COLORS } from "@/lib/companies";
import { useSignupModal } from "@/lib/signup-modal-context";

interface CompanyPanelProps {
  company: Company;
  onClose: () => void;
  hasAccess: boolean;
  isLoggedIn: boolean;
}

export default function CompanyPanel({ company, onClose, hasAccess }: CompanyPanelProps) {
  const color = CATEGORY_COLORS[company.category] ?? "#B83A2A";

  return (
    <div
      className="animate-slide-up fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl flex flex-col overflow-hidden md:absolute md:inset-x-auto md:bottom-6 md:right-6 md:z-40 md:w-80 md:rounded-2xl md:max-h-[82vh]"
      style={{ boxShadow: "0 -2px 24px rgba(28,28,28,0.12)", maxHeight: "50vh" }}
    >
      {/* Mobile drag handle */}
      <div className="flex justify-center pt-3 pb-1 md:hidden">
        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "#D0C5B5" }} />
      </div>

      {/* Mobile location bar */}
      <div className="md:hidden flex items-center gap-1.5 px-4 pb-2" style={{ color: "#6B5E52" }}>
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span className="text-xs font-medium truncate">{company.city}{company.province ? `, ${company.province}` : ""}</span>
      </div>

      {/* Colour strip */}
      <div className="h-1.5 flex-shrink-0" style={{ backgroundColor: color }} />

      <div className="p-4 md:p-5 overflow-y-auto overflow-x-hidden flex-1">
        {/* Logo — always visible if present */}
        {company.logo_url && (
          <LogoImage domain={company.logo_url.replace(/^https?:\/\/logo\.clearbit\.com\//, "")} name={company.name} />
        )}

        {/* Header — always visible */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1.5 text-white"
              style={{ backgroundColor: color }}
            >
              {company.category === "China VC" ? "VC" : company.category}
              {company.sub_category ? ` · ${company.sub_category}` : ""}
            </span>
            <h2 className="text-lg font-bold leading-tight" style={{ color: "#1C1C1C", fontFamily: "Georgia, serif" }}>{company.name}</h2>
            {company.name_chinese && (
              <p className="text-sm mt-0.5" style={{ color: "#6B5E52" }}>{company.name_chinese}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 mt-0.5 transition-colors"
            style={{ color: "#6B5E52" }}
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Gated content */}
        {hasAccess ? (
          <FullDetail company={company} />
        ) : (
          <EmailGateOverlay company={company} />
        )}
      </div>
    </div>
  );
}

// ── Full access ───────────────────────────────────────────────────────────────
function FullDetail({ company }: { company: Company }) {
  return (
    <>
      {company.description && (
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B5E52" }}>{company.description}</p>
      )}

      <dl className="space-y-1.5 text-sm mb-4">
        <Row label="Location">{company.city}{company.province ? `, ${company.province}` : ""}</Row>
        {company.founded && <Row label="Founded">{company.founded}</Row>}
        {company.funding_stage && <Row label="Stage">{company.funding_stage}</Row>}
        {company.funding_total && <Row label="Funding">{company.funding_total}</Row>}
        {company.employees_range && <Row label="Employees">{company.employees_range}</Row>}
        {company.technology_type && <Row label="Technology">{company.technology_type}</Row>}
        {company.listed !== null && <Row label="Listed">{company.listed ? "Yes" : "No"}</Row>}
      </dl>

      {company.key_products && (
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#6B5E52" }}>Key products</p>
          <p className="text-sm" style={{ color: "#6B5E52" }}>{company.key_products}</p>
        </div>
      )}

      {company.website && <WebsiteLink url={company.website} />}

      {company.slug && (
        <Link
          href={`/companies/${company.slug}`}
          className="mt-3 block w-full py-2.5 rounded-full text-sm font-bold text-white text-center transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#B83A2A" }}
        >
          Go Deeper →
        </Link>
      )}
    </>
  );
}

// ── Signup gate ───────────────────────────────────────────────────────────────
function EmailGateOverlay({ company }: { company: Company }) {
  const { openModal } = useSignupModal();

  return (
    <>
      {company.description && (
        <p className="text-sm leading-relaxed mb-4" style={{ color: "#6B5E52" }}>{company.description}</p>
      )}

      {/* Visible free fields */}
      <dl className="space-y-1.5 text-sm mb-4">
        <Row label="Location">{company.city}{company.province ? `, ${company.province}` : ""}</Row>
        {company.founded && <Row label="Founded">{company.founded}</Row>}
        {company.funding_stage && <Row label="Stage">{company.funding_stage}</Row>}
        {company.funding_total && <Row label="Funding">{company.funding_total}</Row>}
      </dl>

      {/* Blurred premium fields */}
      <div className="relative mb-4 rounded-xl overflow-hidden" style={{ border: "1px solid #E0D5C5" }}>
        <div className="px-3 py-3 space-y-1.5 text-sm blur-sm select-none pointer-events-none">
          {[
            ["Employees", "201–500"],
            ["Technology", "NGS Instruments"],
            ["Listed", "No"],
          ].map(([label, val]) => (
            <div key={label} className="flex gap-2">
              <span className="w-24 flex-shrink-0 font-medium" style={{ color: "#6B5E52" }}>{label}</span>
              <span style={{ color: "#1C1C1C" }}>{val}</span>
            </div>
          ))}
          <div className="pt-1">
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#6B5E52" }}>Key products</p>
            <p style={{ color: "#6B5E52" }}>DNBSEQ Sequencing Platform, MGI-2000</p>
          </div>
        </div>
        {/* Lock icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-9 h-9 rounded-full flex items-center justify-center bg-white" style={{ border: "1px solid #E0D5C5", boxShadow: "0 1px 4px rgba(28,28,28,0.08)" }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ color: "#6B5E52" }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Signup CTA */}
      <div className="rounded-xl p-4" style={{ backgroundColor: "#EDE3D3", border: "1px solid #E0D5C5" }}>
        <p className="text-sm font-semibold mb-1" style={{ color: "#1C1C1C" }}>Unlock full company data — free</p>
        <p className="text-xs mb-3" style={{ color: "#6B5E52" }}>
          Create a free account to access full company profiles.
        </p>
        <button
          onClick={openModal}
          className="w-full px-5 py-2 rounded-full text-xs font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#B83A2A", boxShadow: "0 2px 8px rgba(184,58,42,0.25)" }}
        >
          Create free account →
        </button>
      </div>
    </>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────
function LogoImage({ domain, name }: { domain: string; name: string }) {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  const src = `https://img.logo.dev/${domain}?token=${token}&size=80`;
  return (
    <img
      src={src}
      alt={`${name} logo`}
      style={{ height: "48px", width: "auto", maxWidth: "160px", display: "block", marginBottom: "12px" }}
      onError={(e) => { e.currentTarget.style.display = "none"; }}
    />
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-24 flex-shrink-0 font-medium text-sm" style={{ color: "#6B5E52" }}>{label}</dt>
      <dd className="text-sm min-w-0 break-words" style={{ color: "#1C1C1C" }}>{children}</dd>
    </div>
  );
}

function WebsiteLink({ url }: { url: string }) {
  return (
    <a
      href={url.startsWith("http") ? url : `https://${url}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
      style={{ color: "#B83A2A" }}
    >
      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
      <span className="truncate">{url.replace(/^https?:\/\//, "")}</span>
    </a>
  );
}
