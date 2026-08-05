export function parse(text) {
  const lines = text.split("\n"); if (!lines.length) return [];
  const head = split(lines[0]); const out = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const c = split(lines[i]); const o = {};
    for (let k = 0; k < head.length; k++) o[head[k]] = c[k];
    out.push(o);
  }
  return out;
}
function split(line) {
  const out = []; let cur = "", q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { q = !q; continue; }
    if (ch === "," && !q) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur.replace(/\r$/, ""));
  return out;
}
