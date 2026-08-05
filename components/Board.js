"use client";
import { useState, useMemo } from "react";

const FMT = [["ppr","PPR"],["half","Half PPR"],["std","Standard"],["sf","Superflex / 2QB"]];
const POSN = ["ALL","QB","RB","WR","TE","K","DEF"];
const IDPP = ["DL","LB","DB"];
const dash = "—";

function Pill({ s }) {
  if (!s) return <i className="t ok">Active</i>;
  const c = /^(out|ir|pup|doubtful|dnr|sus|na|retired)$/i.test(s) ? "out" : "q";
  return <i className={`t ${c}`}>{s}</i>;
}

function Table({ cols, rows, init, empty }) {
  const [sort, setSort] = useState(init);
  const data = useMemo(() => {
    const col = cols.find((c) => c.k === sort.k) || cols[0];
    return [...rows].sort((a, b) => {
      const x = col.v(a), y = col.v(b);
      if (x == null && y == null) return 0;
      if (x == null) return 1; if (y == null) return -1;
      return typeof x === "string" ? sort.d * x.localeCompare(y) : sort.d * (x - y);
    });
  }, [rows, sort, cols]);
  const click = (k) => setSort((s) => (s.k === k ? { k, d: -s.d } : { k, d: 1 }));
  return (
    <table>
      <thead><tr>{cols.map((c) => (
        <th key={c.k} className={c.k === "#" ? "" : "s"} onClick={c.k === "#" ? undefined : () => click(c.k)}>
          {c.l}{sort.k === c.k && c.k !== "#" ? <span className="ar">{sort.d > 0 ? "▲" : "▼"}</span> : null}
        </th>))}</tr></thead>
      <tbody>
        {data.length === 0 ? (
          <tr><td colSpan={cols.length} style={{ padding: "26px 0", color: "var(--faint)" }}>{empty}</td></tr>
        ) : data.map((o, i) => (
          <tr key={o.name + o.pos + i}>{cols.map((c) => (
            <td key={c.k} className={c.c || "d"}>{c.r ? c.r(o, i) : (c.v(o) ?? dash)}</td>))}</tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Board({ board, adds, drops, injuries, view }) {
  const [f, setF] = useState("ppr");
  const [g, setG] = useState("OFF");
  const [p, setP] = useState("ALL");
  const ok = (o) => (p !== "ALL" ? o.pos === p : g === "ALL" ? true : o.grp === "OFF");
  const fmtLabel = FMT.find((x) => x[0] === f)[1];

  const b = useMemo(() => board.filter((o) => ok(o) && o.adp[f] != null), [board, f, g, p]);
  const MX = Math.max(...b.map((o) => o.lo[f] ?? o.adp[f]), 1);
  const L = (x) => Math.max(0, Math.min(100, Math.sqrt(x / MX) * 100));

  const boardCols = [
    { k: "#", l: "#", c: "r", r: (o, i) => i + 1, v: () => 0 },
    { k: "n", l: "Player", c: "p", v: (o) => o.name },
    { k: "p", l: "Pos", v: (o) => o.pos },
    { k: "t", l: "Tm", v: (o) => o.team },
    { k: "a", l: "ADP", c: "v", v: (o) => o.adp[f] },
    { k: "rg", l: "Range", c: "v", v: (o) => (o.lo[f] != null ? o.lo[f] - o.hi[f] : null),
      r: (o) => o.hi[f] == null ? dash : (
        <><span className="rbar" title={`${o.hi[f]} to ${o.lo[f]}`}>
          <span className="trk" style={{ left: `${L(o.hi[f])}%`, right: `${100 - L(o.lo[f])}%` }} />
          <span className="pin" style={{ left: `${L(o.adp[f])}%` }} />
        </span><span className="rgn">{o.hi[f]}&ndash;{o.lo[f]}</span></>) },
    { k: "pg", l: "25 PPG", c: "v", v: (o) => o.ppg, r: (o) => o.ppg ?? (o.rk ? <i className="t ok">Rookie</i> : dash) },
    { k: "s", l: "Snap%", c: "v", v: (o) => o.snap, r: (o) => o.snap != null ? o.snap + "%" : (o.rk ? <i className="t ok">Rookie</i> : dash) },
    { k: "y", l: "Bye", c: "v", v: (o) => o.bye },
  ];
  const wvCols = [
    { k: "#", l: "#", c: "r", r: (o, i) => i + 1, v: () => 0 },
    { k: "n", l: "Player", c: "p", v: (o) => o.name },
    { k: "p", l: "Pos", v: (o) => o.pos },
    { k: "t", l: "Team", v: (o) => o.team },
    { k: "c", l: "Leagues", c: "v", v: (o) => o.count, r: (o) => o.count.toLocaleString() },
    { k: "i", l: "Status", v: (o) => o.inj || "", r: (o) => <Pill s={o.inj} /> },
  ];
  const injCols = [
    { k: "n", l: "Player", c: "p", v: (o) => o.name },
    { k: "p", l: "Pos", v: (o) => o.pos },
    { k: "t", l: "Tm", v: (o) => o.team },
    { k: "st", l: "Status", v: (o) => o.status, r: (o) => <Pill s={o.status} /> },
    { k: "pt", l: "Injury", v: (o) => o.part },
    { k: "r", l: "Expected return", c: "v", v: (o) => (o.ret ? Date.parse(o.ret) : null), r: (o) => o.ret || dash },
    { k: "s", l: "Snap%", c: "v", v: (o) => o.snap, r: (o) => (o.snap != null ? o.snap + "%" : dash) },
    { k: "a", l: "ADP", c: "v", v: (o) => o.adp },
  ];

  const A = adds.filter(ok), D = drops.filter(ok), I = injuries.filter(ok);
  const posLabel = p === "ALL" ? (g === "ALL" ? "all positions" : "offense") : p;

  return (
    <>
      <div className="ctl">
        <div className="grp"><span className="lab">Scoring</span>
          <div className="seg">{FMT.map(([c, l]) => (
            <button key={c} className={f === c ? "on" : ""} onClick={() => setF(c)}>{l}</button>))}</div></div>
        <div className="grp"><span className="lab">Side <span style={{color:"var(--faint)",fontWeight:400,letterSpacing:0,textTransform:"none"}}>(injuries)</span></span>
          <div className="seg">
            <button className={g === "OFF" ? "on" : ""} onClick={() => { setG("OFF"); if (IDPP.includes(p)) setP("ALL"); }}>Offense</button>
            <button className={g === "ALL" ? "on" : ""} onClick={() => setG("ALL")}>Include IDP</button></div></div>
        <div className="grp"><span className="lab">Position</span>
          <div className="seg">{[...POSN, ...(g === "ALL" ? IDPP : [])].map((x) => (
            <button key={x} className={p === x ? "on" : ""} onClick={() => setP(x)}>{x === "ALL" ? "All" : x}</button>))}</div></div>
      </div>

      {view === "board" && (<>
        <div className="sh"><h2>The board</h2><small>{b.length} {posLabel} &middot; {fmtLabel} &middot; click any column to sort</small></div>
        <Table cols={boardCols} rows={b} init={{ k: "a", d: 1 }}
          empty="No free source publishes draft position for defensive players. Sleeper covers them for injuries, so the IDP filter works on the injury report." />
        <p className="src">The board covers offensive players only, because no free source publishes IDP draft position. The bar shows the full range a player has been drafted in with the marker at the average, on a compressed scale so early picks stay readable. 25 PPG is PPR points per game last regular season. Snap% is average offensive snap share.</p>
      </>)}

      {view === "waivers" && (<>
        <div className="sh"><h2>Most added</h2><small>rolling 24 hours</small></div>
        <Table cols={wvCols} rows={A} init={{ k: "c", d: -1 }} empty="Nothing matches this filter." />
        <div className="sh"><h2>Most dropped</h2><small>rolling 24 hours</small></div>
        <Table cols={wvCols.slice(0, 5)} rows={D} init={{ k: "c", d: -1 }} empty="Nothing matches this filter." />
      </>)}

      {view === "injuries" && (<>
        <div className="sh"><h2>Injury report</h2><small>{I.length} shown &middot; {posLabel} &middot; click any column to sort</small></div>
        <Table cols={injCols} rows={I} init={{ k: "a", d: 1 }} empty="Nothing matches this filter." />
        <p className="src">Status and body part from the Sleeper feed, expected return from MyFantasyLeague. Return dates are the league&rsquo;s published estimate, not a medical opinion, and they move. Switch to Include IDP to see defensive players.</p>
      </>)}

      {view === "today" && (<>
        <div className="sh"><h2>Most added</h2><small>rolling 24 hours</small></div>
        <Table cols={wvCols} rows={A.slice(0, 16)} init={{ k: "c", d: -1 }} empty="Nothing matches this filter." />
      </>)}
    </>
  );
}
