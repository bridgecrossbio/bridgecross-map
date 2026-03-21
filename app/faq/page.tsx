"use client";

import { useState } from "react";
import PageLayout from "@/components/PageLayout";

const FAQS = [
  {
    q: "What companies are included in the map?",
    a: "The map currently covers Chinese companies across four sectors: Sequencing Technology (instruments and services), DNA Synthesis (technology and service providers), Liquid Biopsy Oncology, and AI Drug Discovery. We also include the major China-focused venture capital firms active in these sectors. The current dataset covers 55 companies and funds.",
  },
  {
    q: "How often is the data updated?",
    a: "We aim to update the dataset quarterly, adding new companies, correcting funding information, and reflecting significant corporate changes. If you spot an error or want to suggest a company, use the Contact page.",
  },
  {
    q: "What does the free trial include?",
    a: "The 3-day free trial gives you full access to all company profiles, filters, and search functionality. No credit card required to sign up.",
  },
  {
    q: "What are the paid plan features?",
    a: "Paid subscribers get unlimited access to all company profiles, priority updates when new companies are added, and early access to new sectors and features as we expand the dataset.",
  },
  {
    q: "How do I suggest a company to add?",
    a: 'Use the Contact page and select "Submit a New Company". We review all suggestions and aim to add verified companies within 2–4 weeks.',
  },
  {
    q: "Is the data available to download or export?",
    a: "Data export is available on paid plans. Contact us to discuss bulk data or API access for enterprise use cases.",
  },
  {
    q: "Who is behind BridgeCross Bio?",
    a: "BridgeCross Bio is an independent research publication focused on China's biotech and medtech landscape. Our contributors have worked and lived within China's science ecosystem. We are editorially independent and do not accept funding from any government or political entity.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#8B3A2F]/10 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left"
      >
        <span className="text-sm font-semibold text-gray-900">{q}</span>
        <svg
          className="w-4 h-4 flex-shrink-0 mt-0.5 transition-transform"
          style={{ color: "#8B3A2F", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <p className="pb-5 text-sm text-gray-600 leading-relaxed">{a}</p>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <PageLayout>
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#C4622D" }}>
          Support
        </p>
        <h1 className="text-3xl font-bold mb-8" style={{ color: "#8B3A2F" }}>
          Frequently Asked Questions
        </h1>

        <div className="bg-white rounded-2xl px-6 shadow-sm border border-[#8B3A2F]/8">
          {FAQS.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        <p className="mt-8 text-sm text-gray-500">
          Still have questions?{" "}
          <a href="/contact" className="font-medium underline" style={{ color: "#C4622D" }}>
            Get in touch →
          </a>
        </p>
      </div>
    </PageLayout>
  );
}
