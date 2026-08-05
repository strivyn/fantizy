import { load } from "../../lib/page";
import Board from "../../components/Board";
import { Figures } from "../../components/Shell";
export const revalidate = 1800;
export const metadata = {
  title: "Injuries",
  alternates: { canonical: "/injuries" },
};
export default async function P() {
  const d = await load();
  return (<>
    <div className="hero inner"><Figures d={d} /></div>
    <Board board={d.board} adds={d.adds} drops={d.drops} injuries={d.injuries} view="injuries" />
  </>);
}
