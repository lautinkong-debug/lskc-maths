import type { Metadata } from "next";
import { IBM_Plex_Sans, Spectral } from "next/font/google";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { copy } from "@/lib/copy";
import { AuthProvider } from "@/lib/auth";
import { AuthGate } from "@/components/AuthGate";

const spectral = Spectral({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-spectral",
  display: "swap",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: copy.school.short,
    template: `%s | ${copy.school.short}`,
  },
  description: `${copy.school.name} - ${copy.school.department}. Interactive teaching tools and the Mistakes Book.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${plexSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <AuthProvider>
          <SiteHeader />
          <div className="flex-1">
            <AuthGate>{children}</AuthGate>
          </div>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
