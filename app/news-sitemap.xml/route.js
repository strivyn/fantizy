import { SITE } from "../../lib/site";
export const revalidate = 1800;
export async function GET() {
  const now = new Date().toISOString();
  const items = [["/", "Fantasy football calls"], ["/board", "Fantasy football rankings"],
                 ["/waivers", "Fantasy football waiver wire"], ["/injuries", "NFL injury report for fantasy"]];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${items.map(([u, t]) => `  <url><loc>${SITE.url}${u}</loc><news:news><news:publication><news:name>${SITE.name}</news:name><news:language>en</news:language></news:publication><news:publication_date>${now}</news:publication_date><news:title>${t}</news:title></news:news></url>`).join("\n")}
</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, s-maxage=1800" } });
}
