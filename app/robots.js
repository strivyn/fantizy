import { SITE } from "../lib/site";
export default function robots() {
  return { rules: [{ userAgent: "*", allow: "/" }],
    sitemap: [`${SITE.url}/sitemap.xml`, `${SITE.url}/news-sitemap.xml`], host: SITE.url };
}
