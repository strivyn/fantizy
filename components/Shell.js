import { SITE } from "../lib/site";
const NAV = [["/", "Today"], ["/board", "Board"], ["/waivers", "Waivers"], ["/injuries", "Injuries"], ["/data", "Data"]];
export function Figures({ d }) {
  const n = (x) => x.toLocaleString();
  return (
    <div className="figs">
      <div><div className="v">{n(d.total)}</div><div className="l">Drafts sampled</div></div>
      <div><div className="v">{n(d.board.length)}</div><div className="l">Players ranked</div></div>
      <div><div className="v">{n(d.counts.snap)}</div><div className="l">Snap shares</div></div>
      <div><div className="v">{n(d.counts.withReturn)}</div><div className="l">Injuries with return dates</div></div>
      <div><div className="v">30<em>min</em></div><div className="l">Refresh</div></div>
    </div>
  );
}
export { NAV };
