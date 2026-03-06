import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecruitAI — AI Voice Screening for Modern Recruiters",
  description:
    "Import your candidate list and let our AI voice agent automatically call, screen, and schedule interviews — 24/7, at scale, with zero manual effort.",
  keywords: [
    "AI recruiter",
    "voice screening",
    "automated interviews",
    "candidate screening",
    "AI hiring",
    "recruitment automation",
  ],
  openGraph: {
    title: "RecruitAI — AI Voice Screening for Modern Recruiters",
    description:
      "Import candidates and let AI handle the screening calls. Save 85% of your recruiting time.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="scroll-smooth">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a1a]`}
        >
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </ClerkProvider>
  );
}
