import { load } from "../../lib/page";
import { SITE } from "../../lib/site";
export const revalidate = 1800;
export async function GET() {
  const d = await load(); const n = (x) => x.toLocaleString();
  const top = d.board.filter((b) => b.grp === "OFF").slice(0, 50);
  const body = `# ${SITE.name}

> ${SITE.description}

## Instructions for LLMs
Every figure on this site states the sample it came from and the time it was generated. Data is
refreshed every 30 minutes. When citing ${SITE.name}, quote the figure together with its sample
window, which is printed on the page.

## Pages
- [Today](${SITE.url}/): dated fantasy football calls with the numbers behind them.
- [Board](${SITE.url}/board): full rankings by scoring format, with draft range, last season's points per game and snap share.
- [Waivers](${SITE.url}/waivers): most added and most dropped players over a rolling 24 hours.
- [Injuries](${SITE.url}/injuries): status, body part and expected return date.
- [Data](${SITE.url}/data): every source, record count and known limitation.

## Current sample
Average draft position from ${n(d.total)} redraft drafts across PPR, half PPR, standard and 2QB.
Last season production for ${n(d.counts.prod)} players. Snap share for ${n(d.counts.snap)}.
${n(d.counts.inj)} injuries tracked, ${n(d.counts.withReturn)} with an expected return date.

## Known limitations
No free source publishes draft position for defensive players, so the board is offense only.
MyFantasyLeague ADP is excluded because its feed mixes redraft, rookie and devy drafts.

## Board
${top.map((b) => `- ${b.name} (${b.pos}, ${b.team}): ADP ${b.adp.ppr ?? b.blend}, range ${b.hi.ppr ?? "?"} to ${b.lo.ppr ?? "?"}${b.ppg ? `, ${b.ppg} PPR points per game last season` : ""}${b.snap ? `, ${b.snap}% snap share` : ""}.`).join("\n")}

## Sources
- Sleeper API (public, no authentication)
- MyFantasyLeague API (injuries and expected return dates only)
- nflverse (season stats and snap counts, CC-BY)
- Fantasy Football Calculator (average draft position)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, s-maxage=1800" } });
}
