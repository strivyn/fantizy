import { SITE } from "../lib/site";
export const revalidate = 1800;
export default async function sitemap() {
  const now = new Date();
  return [["/", 1, "hourly"], ["/board", 0.9, "hourly"], ["/waivers", 0.8, "hourly"],
          ["/injuries", 0.8, "hourly"], ["/data", 0.5, "weekly"]]
    .map(([u, p, c]) => ({ url: `${SITE.url}${u}`, lastModified: now, changeFrequency: c, priority: p }));
}
