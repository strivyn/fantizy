// Every source here is public, keyless and permits commercial use.
import { parse } from "./csv";

const R = (s) => ({ next: { revalidate: s } });
const SUF = /\b(jr|sr|ii|iii|iv|v)\b/g;
export const norm = (s) =>
  ((s || "").toLowerCase().replace(/\./g, " ").replace(/'/g, "").replace(/-/g, " ").replace(SUF, ""))
    .replace(/[^a-z]/g, "");
const POSMAP = { HB: "RB", FB: "RB", PK: "K", DST: "DEF", S: "DB", CB: "DB", SS: "DB", FS: "DB",
  OLB: "LB", ILB: "LB", MLB: "LB", DE: "DL", DT: "DL", NT: "DL" };
export const pos = (p) => { const x = (p || "").toUpperCase(); return POSMAP[x] || x; };
export const key = (n, p) => norm(n) + "|" + pos(p);
export const OFF = new Set(["QB", "RB", "WR", "TE", "K", "DEF"]);

export const FORMATS = [
  { code: "ppr", api: "ppr", label: "PPR" },
  { code: "half", api: "half-ppr", label: "Half PPR" },
  { code: "std", api: "standard", label: "Standard" },
  { code: "sf", api: "2qb", label: "Superflex / 2QB" },
];

const SLEEPER = "https://api.sleeper.app/v1";
const MFL = "https://api.myfantasyleague.com/2026/export?JSON=1";
const NFLV = "https://github.com/nflverse/nflverse-data/releases/download";

async function j(url, secs = 1800) { const r = await fetch(url, R(secs)); if (!r.ok) throw new Error(url); return r.json(); }
async function t(url, secs = 86400) { const r = await fetch(url, R(secs)); if (!r.ok) throw new Error(url); return r.text(); }

export async function getBoard() {
  const year = new Date().getFullYear();
  const P = new Map();
  let total = 0; const parts = [];
  for (const f of FORMATS) {
    const d = await j(`https://fantasyfootballcalculator.com/api/v1/adp/${f.api}?teams=12&year=${year}`);
    const n = d.meta.total_drafts; total += n;
    parts.push({ label: f.label, drafts: n, from: d.meta.start_date, to: d.meta.end_date });
    for (const p of d.players) {
      const k = key(p.name, p.position);
      const a = P.get(k) || { name: p.name, pos: pos(p.position), team: p.team, adp: {}, hi: {}, lo: {}, bye: null };
      a.adp[f.code] = p.adp; a.hi[f.code] = p.high; a.lo[f.code] = p.low;
      a.bye = p.bye || a.bye; P.set(k, a);
    }
  }
  const [prod, snap, rookies] = await Promise.all([getProduction(), getSnaps(), getRookies()]);
  const board = [...P.entries()].map(([k, a]) => ({
    ...a, blend: +(Object.values(a.adp).reduce((s, v) => s + v, 0) / Object.values(a.adp).length).toFixed(1),
    grp: OFF.has(a.pos) ? "OFF" : "IDP",
    ppg: prod.get(k)?.ppg ?? null, g: prod.get(k)?.g ?? null,
    snap: snap.get(k) ?? null, rk: rookies.has(k),
  })).sort((x, y) => x.blend - y.blend);
  return { board, total, parts, counts: { prod: prod.size, snap: snap.size } };
}

async function getProduction() {
  const rows = parse(await t(`${NFLV}/stats_player/stats_player_reg_${new Date().getFullYear() - 1}.csv`));
  const m = new Map();
  for (const r of rows) {
    const n = r.player_display_name, p = r.position;
    if (!n || !p) continue;
    const fp = parseFloat(r.fantasy_points_ppr || 0), g = parseInt(r.games || 0);
    if (!g) continue;
    m.set(key(n, p), { ppg: +(fp / g).toFixed(1), g });
  }
  return m;
}
async function getSnaps() {
  const rows = parse(await t(`${NFLV}/snap_counts/snap_counts_${new Date().getFullYear() - 1}.csv`));
  const acc = new Map();
  for (const r of rows) {
    const n = r.player, p = r.position;
    if (!n || !p) continue;
    const v = parseFloat(r.offense_pct || 0);
    const k = key(n, p); const c = acc.get(k) || [0, 0];
    c[0] += v; c[1] += 1; acc.set(k, c);
  }
  const m = new Map();
  for (const [k, [s, c]] of acc) if (c >= 3) m.set(k, +(100 * s / c).toFixed(1));
  return m;
}

let _players = null;
export async function getPlayers() {
  if (_players) return _players;
  _players = await j(`${SLEEPER}/players/nfl`, 86400);
  return _players;
}
async function getRookies() {
  const ps = await getPlayers();
  const s = new Set();
  for (const p of Object.values(ps)) if (p.years_exp === 0 && p.full_name) s.add(key(p.full_name, p.position));
  return s;
}
export async function getState() { return j(`${SLEEPER}/state/nfl`); }
export async function getTrending(type = "add", limit = 40) {
  const rows = await j(`${SLEEPER}/players/nfl/trending/${type}?lookback_hours=24&limit=${limit}`);
  const ps = await getPlayers();
  return rows.map((x) => {
    const p = ps[x.player_id] || {};
    if (!p.full_name || !p.position) return null;
    return { name: p.full_name, pos: pos(p.position), team: p.team || "FA", count: x.count,
      inj: p.injury_status || null, grp: OFF.has(pos(p.position)) ? "OFF" : "IDP" };
  }).filter(Boolean);
}

// MFL is used ONLY for injuries. Its ADP feed mixes redraft, rookie and devy drafts
// with no way to separate them, so it is deliberately excluded from the board.
export async function getInjuries(board) {
  const [ps, mflPlayers, mflInj] = await Promise.all([
    getPlayers(),
    j(`${MFL}&TYPE=players&DETAILS=1`, 86400),
    j(`${MFL}&TYPE=injuries`, 1800),
  ]);
  const mp = new Map(mflPlayers.players.player.map((p) => [p.id, p]));
  const mn = (p) => (p.name?.includes(", ") ? `${p.name.split(", ")[1]} ${p.name.split(", ")[0]}` : p.name || "");
  const ret = new Map();
  for (const x of mflInj.injuries?.injury || []) {
    const m = mp.get(x.id); if (!m) continue;
    ret.set(key(mn(m), m.position), { ret: x.exp_return, det: x.details });
  }
  const bmap = new Map(board.map((b) => [key(b.name, b.pos), b]));
  const out = [];
  for (const p of Object.values(ps)) {
    if (!p.injury_status || !p.full_name || !p.position) continue;
    const k = key(p.full_name, p.position), m = ret.get(k) || {}, b = bmap.get(k), pp = pos(p.position);
    out.push({ name: p.full_name, pos: pp, team: p.team || "FA", status: p.injury_status,
      part: p.injury_body_part || m.det || null, ret: m.ret || null,
      adp: b?.blend ?? null, snap: b?.snap ?? null, grp: OFF.has(pp) ? "OFF" : "IDP" });
  }
  out.sort((a, b) => (a.adp ?? 9e9) - (b.adp ?? 9e9));
  return { injuries: out, withReturn: [...ret.values()].filter((v) => v.ret).length, mflPlayers: mp.size };
}
