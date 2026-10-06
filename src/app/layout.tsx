import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { education, person, SITE_URL, seo, work } from "@/content/profile";
import { Providers } from "@/components/ui/Providers";
import { ConsoleNote } from "@/components/ui/ConsoleNote";
import { NavBridge } from "@/components/ui/NavBridge";
import { GlobalPress } from "@/components/ui/GlobalPress";

// Dela Gothic One, cut down to Latin (11KB). Google serves it as 120+ CJK slices otherwise.
// The same subset, as TTF, sets the type on the island.
const display = localFont({
  src: "../assets/fonts/DelaGothicOne-latin.woff2",
  variable: "--font-dela",
  weight: "400",
  display: "swap",
  fallback: ["Arial Black", "system-ui", "sans-serif"],
});

const sans = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: seo.title, template: `%s · ${person.name}` },
  description: seo.description,
  applicationName: person.name,
  authors: [{ name: person.name, url: SITE_URL }],
  creator: person.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    url: SITE_URL,
    siteName: person.name,
    title: seo.title,
    description: seo.description,
    firstName: "Harshita",
    lastName: "Jogi",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff6e8" },
    { media: "(prefers-color-scheme: dark)", color: "#fff6e8" },
  ],
  colorScheme: "light",
};

const personLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: person.name,
  url: SITE_URL,
  email: `mailto:${person.email}`,
  jobTitle: person.role,
  description: seo.description,
  address: { "@type": "PostalAddress", addressLocality: "Sunnyvale", addressRegion: "CA", addressCountry: "US" },
  worksFor: { "@type": "Organization", name: work.roles[0].company },
  alumniOf: education.schools.map((s) => ({ "@type": "CollegeOrUniversity", name: s.school })),
  sameAs: [person.links.linkedin, person.links.github],
  knowsAbout: ["LLM agents", "LLM evaluation", "Data pipelines", "ETL", "Test automation", "Cloud migration", "Edge ML"],
};

// Runs before paint: restores the margam unlock from the session.
const bootScript = `(function(){try{var d=document.documentElement;d.classList.add('js');if(sessionStorage.getItem('margam')==='seen')d.dataset.margam='seen';}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />
      </head>
      <body>
        <a
          href="#main"
          className="fixed top-3 left-3 z-100 -translate-y-20 rounded-full bg-ink px-4 py-2 text-paper transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        <Providers>
          <NavBridge />
          <GlobalPress />
          {children}
        </Providers>
        <ConsoleNote />
      </body>
    </html>
  );
}
