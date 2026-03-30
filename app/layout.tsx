import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { SignupModalProvider } from "@/lib/signup-modal-context";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BridgeCross Map — Chinese Biotech",
  description: "Interactive map of Chinese biotech companies across sequencing, DNA synthesis, liquid biopsy, and AI drug discovery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} antialiased`}>
      <body>
        <AuthProvider>
          <SignupModalProvider>
            <Header />
            {children}
          </SignupModalProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
