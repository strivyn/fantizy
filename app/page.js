import { load } from "../lib/page";
import { SITE, prettyDate } from "../lib/site";
import Board from "../components/Board";
import { Figures } from "../components/Shell";
export const revalidate = 1800;

export async function generateMetadata() {
  const d = await load();
  return { title: `Fantasy football calls for ${prettyDate()}`,
    description: `Rankings, waivers and injuries built on ${d.total.toLocaleString()} live drafts, last season's production and real snap share.`,
    alternates: { canonical: "/" } };
}

export default async function Home() {
  const d = await load();
  const n = (x) => x.toLocaleString();
  const top = d.adds[0], rest = d.adds.slice(1, 5).reduce((s, p) => s + p.count, 0);
  const off = d.board.filter((b) => b.grp === "OFF" && b.ppg && b.g >= 8);
  const vol = d.board.filter((b) => b.grp === "OFF").slice(0, 48)
    .reduce((a, b) => ((b.lo.ppr - b.hi.ppr) > ((a?.lo.ppr - a?.hi.ppr) || 0) ? b : a), null);
  const val = off.slice(10, 60).reduce((a, b) => (b.ppg / Math.pow(b.blend, 0.32) > (a ? a.ppg / Math.pow(a.blend, 0.32) : 0) ? b : a), null);
  const calls = [
    [`Add ${top.name} (${top.pos}, ${top.team}).`,
     `Picked up in ${n(top.count)} leagues in 24 hours, more than the next four combined (${n(rest)}). ${top.inj ? `Listed ${top.inj}.` : "No designation."}`],
    vol && [`${vol.name} is the most contested pick on the board.`,
     `Average draft position ${vol.blend} across ${n(d.total)} drafts, taken as early as ${vol.hi.ppr} and as late as ${vol.lo.ppr}.`],
    val && [`${val.name} is the value on this board.`,
     `Going at ${val.blend} after ${val.ppg} PPR points per game across ${val.g} games${val.snap ? `, on a ${val.snap}% snap share.` : "."}`],
    [`Drop ${d.drops[0].name} if you need the roster spot.`,
     `Cut in ${n(d.drops[0].count)} leagues in 24 hours, the most dropped player in fantasy football.`],
  ].filter(Boolean);

  const ld = { "@context": "https://schema.org", "@type": "NewsArticle",
    headline: `Fantasy football calls for ${prettyDate()}`,
    datePublished: d.generated, dateModified: d.generated,
    author: { "@type": "Person", name: SITE.author.name, url: SITE.author.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    mainEntityOfPage: { "@type": "WebPage", "@id": SITE.url }, isAccessibleForFree: true };

  return (<>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    <div className="hero">
      <h1>Every call carries the <span>number</span> behind it.</h1>
      <p className="sub">Fantasy football built on {n(d.total)} live drafts across four formats, last season&rsquo;s production and real snap share.</p>
      <Figures d={d} />
    </div>
    <div className="sh"><h2>Today&rsquo;s calls</h2><small>{prettyDate()} &middot; updated {new Date(d.generated).toUTCString()}</small></div>
    {calls.map(([a, b], i) => (<article className="call" key={i}><h3>{a}</h3><p>{b}</p></article>))}
    <Board board={d.board} adds={d.adds} drops={d.drops} injuries={d.injuries} view="today" />
    <p className="src">Roster movement from the Sleeper API over a rolling 24-hour window. Draft position from Fantasy Football Calculator across {n(d.total)} drafts. Regenerated every 30 minutes.</p>
  </>);
}
