import PageLayout from "@/components/PageLayout";

export const metadata = { title: "About — BridgeCross Bio" };

const TEAM = [
  {
    photo: "/team/matt.jpg",
    name: "Matt Marlowe",
    title: "Director & Founder",
    bio: "Matt Marlowe is a marketing strategist specialised in helping life science and biotech teams turn complex science into clear, commercial narratives. With deep experience in genomics and molecular diagnostics, Matt partners with founders and product leaders to position offerings, accelerate adoption, and drive measurable market traction.",
    linkedin: "https://www.linkedin.com/in/matt-marlowe-25836464/",
  },
  {
    photo: "/team/michelle.jpg",
    name: "Michelle (Qian) Mao",
    title: "Consultant",
    bio: "Michelle Mao is a seasoned life sciences and genomics expert with over 15 years of experience in molecular diagnostics, IVD, and global healthcare market expansion. Her expertise covers the full spectrum of product and partner lifecycle management — from R&D alignment and regulatory strategy to channel enablement, KOL engagement, and post-market support.",
    linkedin: null,
  },
];

export default function AboutPage() {
  return (
    <PageLayout>
      <div className="max-w-2xl">
        {/* Header */}
        <p className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: "#B83A2A" }}>
          About BridgeCross Bio
        </p>
        <h1 className="text-3xl font-bold leading-snug mb-6" style={{ color: "#1C1C1C" }}>
          A More Nuanced Conversation About China and Biotech
        </h1>

        {/* Body copy */}
        <div className="space-y-4 leading-relaxed" style={{ color: "#6B5E52", fontSize: "15px", lineHeight: "1.75" }}>
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
        <div className="mt-10 rounded-2xl p-6" style={{ backgroundColor: "#EDE3D3", border: "1px solid #E0D5C5" }}>
          <h2 className="text-base font-bold mb-4" style={{ color: "#1C1C1C" }}>What you can expect from BridgeCross</h2>
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
                <span className="mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: "#B83A2A20" }}>
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="#B83A2A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm" style={{ color: "#6B5E52" }}>
                  <strong style={{ color: "#1C1C1C" }}>{item.title}:</strong> {item.body}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Team */}
        <div className="mt-12">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2" style={{ color: "#B83A2A" }}>
            The Team
          </p>
          <h2 className="text-2xl font-bold mb-8" style={{ color: "#1C1C1C" }}>
            Who We Are
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {TEAM.map((person) => (
              <div
                key={person.name}
                className="flex flex-col items-center text-center rounded-2xl"
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E0D5C5",
                  boxShadow: "0 2px 12px rgba(28,28,28,0.06)",
                  padding: "32px",
                }}
              >
                <img
                  src={person.photo}
                  alt={person.name}
                  style={{
                    width: "140px",
                    height: "140px",
                    borderRadius: "9999px",
                    objectFit: "cover",
                    border: "3px solid #E0D5C5",
                    marginBottom: "20px",
                  }}
                />
                <h3
                  style={{
                    fontFamily: "Georgia, serif",
                    color: "#1C1C1C",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginBottom: "6px",
                  }}
                >
                  {person.name}
                </h3>
                <p
                  style={{
                    color: "#B83A2A",
                    fontSize: "13px",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    textTransform: "uppercase",
                    marginBottom: "16px",
                  }}
                >
                  {person.title}
                </p>
                <p
                  style={{
                    color: "#6B5E52",
                    fontSize: "15px",
                    lineHeight: "1.75",
                    marginBottom: person.linkedin ? "20px" : "0",
                  }}
                >
                  {person.bio}
                </p>
                {person.linkedin && (
                  <a
                    href={person.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ color: "#B83A2A" }}
                  >
                    LinkedIn →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <a
            href="https://bridgecrossbio.substack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#B83A2A" }}
          >
            <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold bg-white" style={{ color: "#B83A2A" }}>S</span>
            Subscribe on Substack
          </a>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:bg-white"
            style={{ color: "#1C1C1C", borderColor: "#E0D5C5" }}
          >
            Contact Us
          </a>
        </div>
      </div>
    </PageLayout>
  );
}
