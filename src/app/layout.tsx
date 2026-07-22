import type { Metadata, Viewport } from "next";
import "./globals.css";
import { brand } from "@/lib/brand";

export const metadata: Metadata = {
  title: {
    default: `${brand.productName} — ${brand.name}`,
    template: `%s — ${brand.name}`,
  },
  description:
    "Enter your website and see 5–8 places your ideal customers are showing buying signals right now — a personalized Buyer Signal Map from Streamline Connex.",
  metadataBase: safeMetadataBase(),
  openGraph: {
    title: `${brand.productName} — ${brand.name}`,
    description:
      "See where your future customers are revealing buying intent right now.",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0B1522",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

function safeMetadataBase(): URL | undefined {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url) return undefined;
  try {
    return new URL(url);
  } catch {
    return undefined;
  }
}
