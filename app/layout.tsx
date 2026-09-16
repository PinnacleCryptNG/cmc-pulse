import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CMC Pulse — Underlier Desk",
  description:
    "Trace tokenized stocks, treasuries, commodities and ETFs back to the underlying asset, issuer and market.",
  applicationName: "CMC Pulse",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "CMC Pulse — Underlier Desk",
    description: "Understand what’s actually behind tokenized assets.",
    type: "website",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "CMC Pulse — Underlier Desk",
    description: "Trace tokenized assets back to the underlying asset, issuer and market.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${dmSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
