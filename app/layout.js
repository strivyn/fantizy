import "./globals.css";
import { SITE } from "../lib/site";
import { NAV } from "../components/Shell";

export const metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: SITE.description,
  alternates: { canonical: "/" },
  openGraph: { title: SITE.name, description: SITE.description, url: SITE.url, siteName: SITE.name, type: "website" },
  robots: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
};

export default function RootLayout({ children }) {
  const ld = [
    { "@context": "https://schema.org", "@type": "Organization", name: SITE.name, url: SITE.url, description: SITE.description },
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE.name, url: SITE.url },
  ];
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        <hdr><div className="w bar">
          <a href="/" className="mark">fant<em>i</em>zy</a>
          <nav>{NAV.map(([h, l]) => <a key={h} href={h}>{l}</a>)}</nav>
        </div></hdr>
        <div className="w">{children}</div>
      </body>
    </html>
  );
}
