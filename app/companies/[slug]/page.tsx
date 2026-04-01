import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Company } from "@/types/company";
import { CATEGORY_COLORS } from "@/lib/companies";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data } = await supabase.from("companies").select("name").eq("slug", slug).single();
  return { title: data ? `${data.name} — BridgeCross Bio` : "Company — BridgeCross Bio" };
}

export default async function CompanyProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("slug", slug)
    .single<Company>();

  if (!company) notFound();

  const color = CATEGORY_COLORS[company.category] ?? "#B83A2A";
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  const hasContact = company.contact_name || company.contact_title || company.contact_email || company.contact_linkedin;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5EDE0", paddingTop: "72px" }}>
      <div className="max-w-3xl mx-auto px-5 py-12">

        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm mb-8 transition-opacity hover:opacity-70"
          style={{ color: "#6B5E52" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to map
        </Link>

        {/* Header card: logo, name, Chinese name, category badge, location */}
        <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: "1px solid #E0D5C5", boxShadow: "0 2px 16px rgba(28,28,28,0.06)" }}>
          <div className="h-1 rounded-full mb-6" style={{ backgroundColor: color, width: "48px" }} />

          {company.logo_url && token && (
            <img
              src={`https://img.logo.dev/${company.logo_url.replace(/^https?:\/\/logo\.clearbit\.com\//, "")}?token=${token}&size=80`}
              alt={`${company.name} logo`}
              style={{ height: "52px", width: "auto", maxWidth: "180px", display: "block", marginBottom: "16px" }}
            />
          )}

          <div className="flex flex-wrap items-start gap-3 mb-1">
            <h1 className="text-3xl font-bold leading-tight" style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}>
              {company.name}
            </h1>
            <span
              className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full text-white mt-1.5 flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              {company.category === "China VC" ? "VC" : company.category}
              {company.sub_category ? ` · ${company.sub_category}` : ""}
            </span>
          </div>

          {company.name_chinese && (
            <p className="text-lg mb-2" style={{ color: "#6B5E52" }}>{company.name_chinese}</p>
          )}

          <p className="text-sm" style={{ color: "#6B5E52" }}>
            {company.city}{company.province ? `, ${company.province}` : ""}
          </p>
        </div>

        {/* Core data grid */}
        <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: "1px solid #E0D5C5", boxShadow: "0 2px 16px rgba(28,28,28,0.06)" }}>
          <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}>
            Company Details
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {company.founded && <DataRow label="Founded">{company.founded}</DataRow>}
            {company.funding_stage && <DataRow label="Stage">{company.funding_stage}</DataRow>}
            {company.funding_total && <DataRow label="Total Funding">{company.funding_total}</DataRow>}
            {company.employees_range && <DataRow label="Employees">{company.employees_range}</DataRow>}
            {company.technology_type && <DataRow label="Technology">{company.technology_type}</DataRow>}
            {company.listed !== null && <DataRow label="Listed">{company.listed ? "Yes" : "No"}</DataRow>}
          </dl>

          {company.key_products && (
            <div className="mt-5 pt-5" style={{ borderTop: "1px solid #E0D5C5" }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#6B5E52" }}>Key Products</p>
              <p className="text-sm leading-relaxed" style={{ color: "#1C1C1C" }}>{company.key_products}</p>
            </div>
          )}

          {company.website && (
            <div className="mt-5 pt-5" style={{ borderTop: "1px solid #E0D5C5" }}>
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ color: "#B83A2A" }}
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                {company.website.replace(/^https?:\/\//, "")}
              </a>
            </div>
          )}
        </div>

        {/* Description */}
        {company.description && (
          <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: "1px solid #E0D5C5", boxShadow: "0 2px 16px rgba(28,28,28,0.06)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}>
              About
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#6B5E52", lineHeight: "1.75" }}>
              {company.description}
            </p>
          </div>
        )}

        {/* Deep Dive */}
        <div className="bg-white rounded-2xl p-8 mb-6" style={{ border: "1px solid #E0D5C5", boxShadow: "0 2px 16px rgba(28,28,28,0.06)" }}>
          <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}>
            Deep Dive
          </h2>
          {company.analysis ? (
            <p className="text-sm leading-relaxed" style={{ color: "#6B5E52", lineHeight: "1.75" }}>
              {company.analysis}
            </p>
          ) : (
            <p className="text-sm italic" style={{ color: "#B8A99A" }}>Detailed analysis coming soon.</p>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-2xl p-8" style={{ border: "1px solid #E0D5C5", boxShadow: "0 2px 16px rgba(28,28,28,0.06)" }}>
          <h2 className="text-lg font-bold mb-5" style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}>
            Contact Information
          </h2>
          {hasContact ? (
            <dl className="space-y-3">
              {company.contact_name && <DataRow label="Name">{company.contact_name}</DataRow>}
              {company.contact_title && <DataRow label="Title">{company.contact_title}</DataRow>}
              {company.contact_email && (
                <DataRow label="Email">
                  <a href={`mailto:${company.contact_email}`} className="hover:underline" style={{ color: "#B83A2A" }}>
                    {company.contact_email}
                  </a>
                </DataRow>
              )}
              {company.contact_linkedin && (
                <DataRow label="LinkedIn">
                  <a
                    href={company.contact_linkedin.startsWith("http") ? company.contact_linkedin : `https://${company.contact_linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: "#B83A2A" }}
                  >
                    View profile
                  </a>
                </DataRow>
              )}
            </dl>
          ) : (
            <p className="text-sm italic" style={{ color: "#B8A99A" }}>Contact information coming soon.</p>
          )}
        </div>

      </div>
    </div>
  );
}

function DataRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-32 flex-shrink-0 text-sm font-medium" style={{ color: "#6B5E52" }}>{label}</dt>
      <dd className="text-sm" style={{ color: "#1C1C1C" }}>{children}</dd>
    </div>
  );
}
