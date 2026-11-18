// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp, nextTick, type App } from "vue";
import Workspace from "../src/Workspace.vue";
let app: App | undefined;
function mount() { document.body.innerHTML = '<div id="test-root"></div>'; app=createApp(Workspace);app.mount(document.querySelector("#test-root")!); }
afterEach(()=>{app?.unmount();vi.unstubAllGlobals();delete window.LuminaRecords;});
function input(selector:string,value:string) { const el=document.querySelector<HTMLInputElement>(selector)!;el.value=value;el.dispatchEvent(new Event("input",{bubbles:true})); }
describe("evidence workspace interaction",()=>{
  it("shows an honest empty state without sending empty local records",async()=>{
    const fetcher=vi.fn();vi.stubGlobal("fetch",fetcher);window.LuminaRecords={list:()=>[]};mount();input("#er-query","河边");await nextTick();document.querySelector("form")!.dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}));await vi.waitFor(()=>expect(document.body.textContent).toContain("这台设备还没有记录"));expect(fetcher).not.toHaveBeenCalled();
  });
  it("executes local tools, displays original evidence, and starts a new search after correction",async()=>{
    window.LuminaRecords={list:()=>[{id:"test-river",ts:"2025-09-25T18:00:00+08:00",note:"和小林去了河边。"}]};
    const fetcher=vi.fn(async (_url: unknown,init:RequestInit)=>{
      const body=JSON.parse(String(init.body));let data;
      if(body.query)data={sessionId:"test-session",phase:"tools",calls:[{id:"search1",name:"search_memories",args:{terms:["河边"],limit:8}}]};
      else if(body.results[0].result.matches)data={sessionId:"test-session",phase:"tools",calls:[{id:"read1",name:"get_memory",args:{id:"test-river"}}]};
      else data={phase:"done",result:{clues:[{id:"c1",text:"去了河边"}],comparisons:[{memoryId:"test-river",clueId:"c1",status:"supported",sources:[{field:"user_note",quote:"和小林去了河边。"}]}],candidates:[{memoryId:"test-river",supported:1,conflicts:0,complete:true}],status:"matched",clarification:null,rejected:0,checkedQuotes:1}};
      return new Response(JSON.stringify(data),{status:200});
    });vi.stubGlobal("fetch",fetcher);mount();input("#er-query","河边");await nextTick();document.querySelector("form")!.dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}));
    await vi.waitFor(()=>expect(document.body.textContent).toContain("一条记录与当前线索吻合"));
    expect(document.body.textContent).toContain("已核对逐字引用");expect(document.body.textContent).toContain("search_memories");expect(document.querySelectorAll(".er-panel")).toHaveLength(3);
    input("#er-correction","更确定是小林");await nextTick();document.querySelector(".er-refine form")!.dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}));
    await vi.waitFor(()=>expect(fetcher).toHaveBeenCalledTimes(6));
    const starts=fetcher.mock.calls.map(call=>JSON.parse(String(call[1].body))).filter(body=>body.query);expect(starts).toHaveLength(2);expect(starts[1].corrections).toEqual(["更确定是小林"]);
    expect(window.LuminaRecords.list()[0].note).toBe("和小林去了河边。");
  });
  it("shows errors instead of pretending an AI request succeeded",async()=>{
    window.LuminaRecords={list:()=>[{id:"x",note:"河边"}]};vi.stubGlobal("fetch",vi.fn(async()=>new Response(JSON.stringify({error:{message:"模型暂不可用"}}),{status:502})));mount();input("#er-query","河边");await nextTick();document.querySelector("form")!.dispatchEvent(new Event("submit",{cancelable:true,bubbles:true}));await vi.waitFor(()=>expect(document.body.textContent).toContain("模型暂不可用"));expect(document.body.textContent).toContain("这次没有生成结论");expect(document.querySelector(".er-verdict")).toBeNull();
  });
});
