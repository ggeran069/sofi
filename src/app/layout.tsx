import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import "@/app/globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "SOFIA", template: "%s | SOFIA" },
  description:
    "Sofia — Styling, Design, Art Direction. A fashion and creative portfolio.",
  openGraph: { images: ["/og-image.png"] },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={hankenGrotesk.variable}>
      <body className="font-[var(--font-hanken)]">{children}</body>
    </html>
  );
}
