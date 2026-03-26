import Link from "next/link";

export const metadata = { title: "Subscription Confirmed — BridgeCross Bio" };

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: "#F5EDE0" }}>
      <div
        className="w-full max-w-md text-center rounded-2xl p-10"
        style={{ backgroundColor: "#FFFFFF", border: "1px solid #E0D5C5", boxShadow: "0 4px 24px rgba(28,28,28,0.08)" }}
      >
        {/* Check icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: "#B83A2A18" }}
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="#B83A2A" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: "Georgia, serif", color: "#1C1C1C" }}
        >
          You're subscribed!
        </h1>
        <p className="mb-2" style={{ color: "#6B5E52", fontSize: "15px", lineHeight: "1.75" }}>
          Thank you for supporting BridgeCross Bio. You now have full access to all company profiles.
        </p>
        <p className="text-sm mb-8" style={{ color: "#6B5E52" }}>
          If your access doesn't update immediately, try logging out and back in.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#B83A2A", boxShadow: "0 2px 8px rgba(184,58,42,0.35)" }}
        >
          Go to the map →
        </Link>
      </div>
    </div>
  );
}
