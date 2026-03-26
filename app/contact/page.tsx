"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";

type TabId =
  | "submit-company"
  | "correction"
  | "bug"
  | "improvement"
  | "sponsorship"
  | "research";

interface Tab {
  id: TabId;
  label: string;
  description: string;
  fields: Field[];
  subjectPrefix: string;
  subjectKey?: string;
}

interface Field {
  key: string;
  label: string;
  type: "input" | "email" | "textarea" | "select";
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

const TABS: Tab[] = [
  {
    id: "submit-company",
    label: "Submit a Company",
    description: "Suggest a company we should add to the map.",
    subjectPrefix: "New Company Submission",
    subjectKey: "companyName",
    fields: [
      { key: "companyName", label: "Company name", type: "input", required: true },
      { key: "website", label: "Website", type: "input", required: true },
      {
        key: "category", label: "Category", type: "select", required: true,
        options: ["Sequencing", "DNA Synthesis", "Liquid Biopsy", "AI Drug Discovery", "VC"],
      },
      { key: "reason", label: "Why should it be included?", type: "textarea", required: true },
      { key: "yourName", label: "Your name", type: "input", required: true },
      { key: "yourEmail", label: "Your email", type: "email", required: true },
    ],
  },
  {
    id: "correction",
    label: "File a Correction",
    description: "Report incorrect or outdated information.",
    subjectPrefix: "Data Correction",
    subjectKey: "companyName",
    fields: [
      { key: "companyName", label: "Company name", type: "input", required: true },
      { key: "whatIsIncorrect", label: "What is incorrect?", type: "textarea", required: true },
      { key: "whatItShouldSay", label: "What should it say?", type: "textarea", required: true },
      { key: "source", label: "Source / evidence (optional)", type: "input" },
      { key: "yourName", label: "Your name", type: "input", required: true },
      { key: "yourEmail", label: "Your email", type: "email", required: true },
    ],
  },
  {
    id: "bug",
    label: "Bug Report",
    description: "Let us know about a technical issue.",
    subjectPrefix: "Bug Report",
    fields: [
      { key: "whatHappened", label: "What happened?", type: "textarea", required: true },
      { key: "stepsToReproduce", label: "Steps to reproduce", type: "textarea", required: true },
      { key: "browserDevice", label: "Browser / device", type: "input", placeholder: "e.g. Chrome on macOS", required: true },
      { key: "yourEmail", label: "Your email", type: "email", required: true },
    ],
  },
  {
    id: "improvement",
    label: "Suggest an Improvement",
    description: "Share ideas for new features or capabilities.",
    subjectPrefix: "Improvement Suggestion",
    fields: [
      { key: "suggestion", label: "Your suggestion", type: "textarea", required: true },
      { key: "useCase", label: "Use case / why this would be valuable", type: "textarea", required: true },
      { key: "yourEmail", label: "Your email", type: "email", required: true },
    ],
  },
  {
    id: "sponsorship",
    label: "Sponsorship",
    description: "Interested in sponsoring BridgeCross Bio?",
    subjectPrefix: "Sponsorship Enquiry",
    subjectKey: "orgName",
    fields: [
      { key: "orgName", label: "Organisation name", type: "input", required: true },
      { key: "yourName", label: "Your name", type: "input", required: true },
      { key: "yourEmail", label: "Your email", type: "email", required: true },
      { key: "details", label: "Tell us about your organisation and what you have in mind", type: "textarea", required: true },
    ],
  },
  {
    id: "research",
    label: "Research & Consultancy",
    description: "Market research or consultancy enquiries.",
    subjectPrefix: "Research & Consultancy",
    subjectKey: "orgName",
    fields: [
      { key: "orgName", label: "Organisation name", type: "input", required: true },
      { key: "yourName", label: "Your name", type: "input", required: true },
      { key: "yourEmail", label: "Your email", type: "email", required: true },
      { key: "details", label: "Briefly describe your research or consultancy need", type: "textarea", required: true },
    ],
  },
];

function ContactForm({ tab }: { tab: Tab }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const set = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setStatus("idle");

    const subjectSuffix = tab.subjectKey && values[tab.subjectKey]
      ? `: ${values[tab.subjectKey]}`
      : "";
    const subject = `BridgeCross Map — ${tab.subjectPrefix}${subjectSuffix}`;

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: tab.label, subject, fields: values }),
    });

    setStatus(res.ok ? "success" : "error");
    setSubmitting(false);
    if (res.ok) setValues({});
  }

  if (status === "success") {
    return (
      <div className="py-10 text-center">
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#B83A2A18" }}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#B83A2A" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold mb-1" style={{ color: "#1C1C1C" }}>Message sent</p>
        <p className="text-sm" style={{ color: "#6B5E52" }}>Thanks — we'll be in touch soon.</p>
        <button onClick={() => setStatus("idle")} className="mt-4 text-sm underline" style={{ color: "#B83A2A" }}>
          Send another
        </button>
      </div>
    );
  }

  const inputCls = "w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none transition-colors bg-white";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {tab.fields.map((field) => {
        return (
          <div key={field.key}>
            <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#6B5E52" }}>
              {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            {field.type === "textarea" ? (
              <textarea
                required={field.required}
                value={values[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
                rows={3}
                placeholder={field.placeholder}
                className={inputCls}
                style={{ border: "1px solid #E0D5C5", color: "#1C1C1C" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
              />
            ) : field.type === "select" ? (
              <select
                required={field.required}
                value={values[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
                className={inputCls}
                style={{ border: "1px solid #E0D5C5", color: "#1C1C1C" }}
              >
                <option value="">Select…</option>
                {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input
                type={field.type}
                required={field.required}
                value={values[field.key] ?? ""}
                onChange={(e) => set(field.key, e.target.value)}
                placeholder={field.placeholder}
                className={inputCls}
                style={{ border: "1px solid #E0D5C5", color: "#1C1C1C" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "#B83A2A"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "#E0D5C5"; }}
              />
            )}
          </div>
        );
      })}

      {status === "error" && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          Something went wrong. Please try emailing us directly at bridgecrossbio@gmail.com.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-2.5 rounded-full text-sm font-semibold text-white transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "#B83A2A" }}
      >
        {submitting ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<TabId>("submit-company");
  const tab = TABS.find((t) => t.id === activeTab)!;

  return (
    <PageLayout>
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#B83A2A" }}>
          Contact
        </p>
        <h1 className="text-3xl font-bold mb-1" style={{ color: "#1C1C1C" }}>Get in Touch</h1>
        <p className="mb-8" style={{ color: "#6B5E52" }}>We'd love to hear from you.</p>

        {/* Tab bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: activeTab === t.id ? "#B83A2A" : "#FFFFFF",
                color: activeTab === t.id ? "#FFFFFF" : "#1C1C1C",
                border: `1px solid ${activeTab === t.id ? "#B83A2A" : "#E0D5C5"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E0D5C5", boxShadow: "0 1px 4px rgba(28,28,28,0.06)" }}>
          <p className="text-sm mb-4" style={{ color: "#6B5E52" }}>{tab.description}</p>
          <ContactForm key={activeTab} tab={tab} />
        </div>
      </div>
    </PageLayout>
  );
}
