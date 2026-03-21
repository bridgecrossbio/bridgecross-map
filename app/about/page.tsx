import PageLayout from "@/components/PageLayout";
import Link from "next/link";

export const metadata = { title: "About — BridgeCross Bio" };

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#C4622D" }}>
          About BridgeCross Bio
        </p>
        <h1 className="text-3xl font-bold leading-snug mb-6" style={{ color: "#8B3A2F" }}>
          A More Nuanced Conversation About China and Biotech
        </h1>

        {/* Body copy */}
        <div className="prose prose-sm max-w-none space-y-4 text-gray-700 leading-relaxed">
          <p>
            Our goal at BridgeCross Bio is to provide audiences with an accurate, contextual
            understanding of China's biotech and medtech landscape. We are neither pro- nor
            anti-China. We do not aim to hype, nor to vilify. We believe that good reporting,
            like good science, should follow the data.
          </p>
          <p>
            The BridgeCross Map is an interactive directory of Chinese biotech companies across
            four sectors: Sequencing Technology, DNA Synthesis, Liquid Biopsy Oncology, and AI
            Drug Discovery — plus the venture capital firms backing them.
          </p>
        </div>

        {/* What to expect */}
        <div className="mt-10 rounded-2xl p-6 border border-[#8B3A2F]/12" style={{ backgroundColor: "#8B3A2F08" }}>
          <h2 className="text-base font-bold mb-4" style={{ color: "#8B3A2F" }}>What you can expect from BridgeCross</h2>
          <ul className="space-y-3">
            {[
              {
                title: "Independent analysis",
                body: "Editorially independent, no government or political funding.",
              },
              {
                title: "On-the-ground insight",
                body: "Contributors have worked and built careers within China's science ecosystem.",
              },
              {
                title: "Global relevance",
                body: "China's biotech policies and companies will shape scientific and commercial decisions globally in the decade ahead.",
              },
            ].map((item) => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#C4622D20" }}>
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#C4622D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm text-gray-700">
                  <strong className="text-gray-900">{item.title}:</strong> {item.body}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a
            href="https://bridgecrossbio.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#C4622D" }}
          >
            <span className="w-4 h-4 rounded flex items-center justify-center text-[#C4622D] text-[9px] font-bold bg-white">S</span>
            Subscribe on Substack
          </a>
          <a
            href="https://bridgecrossbio.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white"
            style={{ color: "#8B3A2F", borderColor: "#8B3A2F30" }}
          >
            Read our research →
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
