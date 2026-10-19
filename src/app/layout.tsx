import type { Metadata } from "next";
import localFont from "next/font/local";
import "katex/dist/katex.min.css";
import "./globals.css";
import "./studio.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { copy } from "@/lib/copy";
import { AuthProvider } from "@/lib/auth";
import { AuthGate } from "@/components/AuthGate";
import { EditModeProvider } from "@/lib/editMode";

const spectral = localFont({
  src: [
    {
      path: "./fonts/spectral-latin-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/spectral-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  adjustFontFallback: "Times New Roman",
  variable: "--font-spectral",
  display: "swap",
});

const plexSans = localFont({
  src: "./fonts/ibm-plex-sans-latin.woff2",
  weight: "100 700",
  style: "normal",
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
          <EditModeProvider>
            <SiteHeader />
            <div id="site-content" tabIndex={-1} className="flex-1">
              <AuthGate>{children}</AuthGate>
            </div>
            <SiteFooter />
          </EditModeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
