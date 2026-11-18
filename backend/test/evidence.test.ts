import { describe, expect, it } from "vitest";
import { validateEvidence, buildClarification } from "../src/services/evidence-validation.js";
import type { EvidenceMemory, EvidenceResult } from "../src/schemas/evidence.schema.js";
const memory: EvidenceMemory = { id: "m1", date: "2025-09-25", title: "河边", generated: "和小林看晚霞", sources: [{field:"user_note",text:"今天去了河边。",origin:"user"},{field:"image_scene",text:"和小林看晚霞",origin:"image_model"}] };
function result(quote: string, field = "user_note", status: "supported" | "conflict" | "unknown" = "supported"): EvidenceResult {
  return { clues: [{id:"c1",text:"和小林在一起"}], comparisons: [{memoryId:"m1",clueId:"c1",status,sources:[{field,quote}]}], clarification:null };
}
describe("evidence quote guard", () => {
  it("accepts exact original quotes", () => expect(validateEvidence(result("今天去了河边。"),[memory]).comparisons[0]?.status).toBe("supported"));
  it("downgrades invented quotes instead of inventing evidence", () => expect(validateEvidence(result("和小林去了河边"),[memory]).comparisons[0]?.status).toBe("unknown"));
  it("does not use image-model observations as user evidence", () => expect(validateEvidence(result("和小林看晚霞","image_scene"),[memory]).comparisons[0]?.status).toBe("unknown"));
  it("rejects nonexistent memory IDs", () => { const r=result("今天去了河边。");r.comparisons[0]!.memoryId="fake";expect(validateEvidence(r,[memory]).comparisons.every(c=>c.status==="unknown")).toBe(true); });
  it("fills missing claims as unknown, never conflict", () => expect(validateEvidence({...result("x"),comparisons:[]},[memory]).comparisons[0]?.status).toBe("unknown"));
  it("requires an actual quote for explicit contradictions", () => expect(validateEvidence(result("从没去过河边","user_note","conflict"),[memory]).comparisons[0]?.status).toBe("unknown"));
  it("removes citations for unknown claims", () => expect(validateEvidence(result("今天去了河边。","user_note","unknown"),[memory]).comparisons[0]?.sources).toEqual([]));
  it("cannot cite generated writing as an original field", () => expect(validateEvidence(result("和小林看晚霞","generated"),[memory]).comparisons[0]?.status).toBe("unknown"));
  it("does not suggest an unrecorded alternative such as being alone", () => {const r=result("x");r.comparisons.push({memoryId:"m2",clueId:"c1",status:"unknown",sources:[]});const c=buildClarification(r,"uncertain");expect(c?.question).not.toContain("独自");expect(c?.options[0]?.text).toContain("和小林在一起");});
  it("does not fabricate clarification options when there is no evidence", () => expect(buildClarification(result("x"),"no_evidence")?.options).toEqual([]));
});
