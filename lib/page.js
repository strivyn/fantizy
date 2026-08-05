import { getBoard, getTrending, getInjuries, getState } from "./source";
let cache = null, at = 0;
export async function load() {
  if (cache && Date.now() - at < 25 * 60 * 1000) return cache;
  const [{ board, total, parts, counts }, adds, drops, state] = await Promise.all([
    getBoard(), getTrending("add", 40), getTrending("drop", 20), getState(),
  ]);
  const { injuries, withReturn, mflPlayers } = await getInjuries(board);
  cache = { board, total, parts, counts: { ...counts, inj: injuries.length, withReturn, mflPlayers },
            adds, drops, injuries, state, generated: new Date().toISOString() };
  at = Date.now();
  return cache;
}
