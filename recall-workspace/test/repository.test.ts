import { describe, expect, it } from "vitest";
import { demoMemories, searchMemories, toMemory } from "../src/repository";
describe("local evidence repository", () => {
  it("keeps AI rewriting separate from original evidence", () => { const m=toMemory({id:"x",note:"去了河边",final:"和小林看晚霞"});expect(m.sources.some(s=>s.text.includes("小林"))).toBe(false);expect(m.generated).toContain("小林"); });
  it("preserves user turns and marks image observations", () => { const m=toMemory({id:"x",chat:[{role:"me",text:"下雨了"},{role:"it",text:"和朋友吗"}],facts:{scene:"河边"}});expect(m.sources.some(s=>s.text==="下雨了"&&s.origin==="user")).toBe(true);expect(m.sources.some(s=>s.text==="和朋友吗")).toBe(false);expect(m.sources.find(s=>s.field==="image_scene")?.origin).toBe("image_model"); });
  it("recalls conflicting candidates using OR, not all clues as a hard filter", () => { const r=searchMemories(demoMemories(),{terms:["河边","小林","下雨"],limit:8});expect(r.matches.some(m=>m.id==="synthetic-rain")).toBe(true);expect(r.matches.some(m=>m.id==="synthetic-friend")).toBe(true); });
  it("applies dates and reruns after conditions change", () => { const memories=demoMemories();const year=new Date().getFullYear()-1;const a=searchMemories(memories,{terms:["河边"],from:`${year}-09-20`,limit:8});expect(a.matches.map(m=>m.id).sort()).toEqual(["synthetic-coffee","synthetic-friend"]);const b=searchMemories(memories,{terms:["桥下"],limit:8});expect(b.matches.map(m=>m.id)).toEqual(["synthetic-rain"]); });
  it("returns nothing for an unrecorded event", () => expect(searchMemories(demoMemories(),{terms:["火星旅行"],limit:8}).matches).toEqual([]));
it("recalls memories via local synonym clusters and CJK bigrams when exact words differ", () => {
    const r1 = searchMemories(demoMemories(), { terms: ["夕阳"], limit: 8 });
    expect(r1.matches.some(m => m.id === "synthetic-rain")).toBe(true);
    expect(r1.matches.some(m => m.id === "synthetic-friend")).toBe(true);
    const r2 = searchMemories(demoMemories(), { terms: ["淋雨"], limit: 8 });
    expect(r2.matches[0]?.id).toBe("synthetic-rain");
  });
  it("does not mutate the original diary when refining a query", () => {const rows=demoMemories();const before=JSON.stringify(rows);searchMemories(rows,{terms:["小林"],limit:8});expect(JSON.stringify(rows)).toBe(before);});
});
