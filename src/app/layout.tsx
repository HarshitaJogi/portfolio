import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { education, person, SITE_URL, seo, work } from "@/content/profile";
import { Providers } from "@/components/ui/Providers";
import { ConsoleNote } from "@/components/ui/ConsoleNote";

const display = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const sans = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    { media: "(prefers-color-scheme: light)", color: "#f6f1e7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0d0b" },
  ],
  colorScheme: "light dark",
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

// Runs before paint: restores Skim view from the URL and the margam unlock from the session.
const bootScript = `(function(){try{var d=document.documentElement,p=new URLSearchParams(location.search);if(p.get('view')==='skim')d.dataset.view='skim';if(sessionStorage.getItem('margam')==='seen')d.dataset.margam='seen';}catch(e){}})();`;

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
        <Providers>{children}</Providers>
        <ConsoleNote />
      </body>
    </html>
  );
}
