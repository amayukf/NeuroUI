import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "NeuroUI — Plain English in. Production React out.",
  description:
    "Six AI agents turn your plain English description into a production-ready React component in under 60 seconds. Tailwind, TypeScript, charts, micro-interactions. Ready to ship.",
  openGraph: {
    title: "NeuroUI — Plain English in. Production React out.",
    description:
      "Six AI agents turn your plain English description into a production-ready React component in under 60 seconds.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroUI — Plain English in. Production React out.",
    description: "Production React UI from plain English in under 60 seconds.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="h-screen overflow-hidden bg-bg" suppressHydrationWarning>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
