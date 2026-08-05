import { load } from "../../lib/page";
export const revalidate = 1800;
export const metadata = { title: "Data", description: "Every source behind Fantizy: what it gives, how many records, and why one of them is deliberately excluded from ADP.", alternates: { canonical: "/data" } };
export default async function P() {
  const d = await load(); const n = (x) => x.toLocaleString();
  return (<>
    <div className="sh" style={{ marginTop: 34 }}><h2>Draft data</h2><small>all free, all keyless</small></div>
    <table><thead><tr><th>Format</th><th>Drafts</th><th>Window</th></tr></thead><tbody>
      {d.parts.map((p) => (<tr key={p.label}><td className="p">{p.label}</td><td className="v">{n(p.drafts)}</td><td className="d">{p.from} to {p.to}</td></tr>))}
      <tr><td className="p">Combined</td><td className="v">{n(d.total)}</td><td className="d">redraft only, selectable by format</td></tr>
    </tbody></table>
    <div className="sh"><h2>Everything else</h2></div>
    <table><thead><tr><th>Source</th><th>What it gives</th><th>Records</th></tr></thead><tbody>
      <tr><td className="p">Sleeper API</td><td className="d">Claims, drops, injury status and body part, rookie status</td><td className="v">12,000+</td></tr>
      <tr><td className="p">MyFantasyLeague API</td><td className="d">Injury detail and expected return dates. Deliberately excluded from ADP: its feed mixes redraft, rookie and devy drafts with no way to separate them.</td><td className="v">{n(d.counts.mflPlayers)}</td></tr>
      <tr><td className="p">nflverse season stats</td><td className="d">Last regular season production and PPR points per game</td><td className="v">{n(d.counts.prod)}</td></tr>
      <tr><td className="p">nflverse snap counts</td><td className="d">Offensive snap share by week</td><td className="v">{n(d.counts.snap)}</td></tr>
      <tr><td className="p">Fantasy Football Calculator</td><td className="d">ADP across PPR, half PPR, standard and 2QB redraft drafts</td><td className="v">{n(d.total)}</td></tr>
    </tbody></table>
    <p className="src">Every source is public, needs no API key and permits commercial use. Data cost of this site is zero.</p>
  </>);
}
