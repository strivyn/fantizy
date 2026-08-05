export const SITE = {
  name: "Fantizy",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://fantizy.com",
  tagline: "Every call carries the number behind it",
  description:
    "Fantasy football rankings, waivers and injuries built on thousands of live drafts, last season's production and real snap share. Every claim carries its source number and timestamp.",
  author: { name: "Edward", url: "https://strivyn.com" },
};
export const prettyDate = (d = new Date()) =>
  d.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
