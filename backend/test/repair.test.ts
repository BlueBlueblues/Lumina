import { describe,it,expect,vi } from 'vitest';
import { validateEvidence,dateSupport,relationIsPossible } from '../src/services/evidence-validation.js';
import { sentenceSources,renderSelection,streamGroundedText } from '../src/services/grounded-writing.js';
import { deepSeek } from '../src/providers/deepseek.provider.js';
import { memorySyncSchema } from '../src/schemas/memory.schema.js';
import type { EvidenceMemory,EvidenceResult } from '../src/schemas/evidence.schema.js';
const m:EvidenceMemory={id:'home',date:'2025-10-03',title:'看书',generated:'去北海道滑雪',sources:[{field:'user_note',text:'那天在家看书。',origin:'user'},{field:'record_date',text:'2025-10-03',origin:'metadata'}]};
const r:EvidenceResult={clues:[{id:'c',text:'和小周去北海道滑雪'}],comparisons:[{memoryId:'home',clueId:'c',status:'conflict',sources:[{field:'user_note',quote:'那天在家看书。'},{field:'record_date',quote:'2025-10-03'}]}],clarification:null};
describe('diagnosed evidence regressions',()=>{
 it('downgrades unrelated activities and dates to unknown',()=>{const result=validateEvidence(r,[m],'2026-11-17');expect(result.comparisons[0]?.status).toBe('unknown');expect(result.comparisons[0]?.sources).toEqual([]);});
 it('allows explicit sunny weather to conflict with remembered rain',()=>expect(relationIsPossible('好像下雨了','全程晴天','conflict')).toBe(true));
 it('accepts a direct relevant negation',()=>expect(relationIsPossible('当时下雨了','全程晴天，没有下雨。','conflict')).toBe(true));
 it('does not treat another topic’s negation as a conflict',()=>expect(relationIsPossible('和小林在一起','和小林去了河边，没有下雨。','conflict')).toBe(false));
 it('does not approve a negated claim as positive support',()=>expect(relationIsPossible('去了河边','没有去河边。','supported')).toBe(false));
 it('checks years deterministically',()=>{expect(dateSupport('去年（约2025年）','2025-09-25','2026-11-17')).toBe('supported');expect(dateSupport('去年（约2025年）','2024-09-25','2026-11-17')).toBe('conflict');expect(dateSupport('和小林在一起','2025-09-25','2026-11-17')).toBeNull();});
 it('checks month and day instead of just the year',()=>{expect(dateSupport('2025年9月25日','2025-09-18','2026-11-17')).toBe('conflict');expect(dateSupport('9月25日','2025-09-25','2026-11-17')).toBe('supported');});
 it('rejects an inconsistent model year',()=>expect(dateSupport('去年（约2024年）','2024-09-25','2026-11-17')).toBeNull());
 it('fills missing calendar checks from existing metadata',()=>{const x=validateEvidence({clues:[{id:'d',text:'去年（约2025年）'}],comparisons:[],clarification:null},[m],'2026-11-17');expect(x.comparisons[0]?.status).toBe('supported');});
});
describe('grounded source-only writing',()=>{
 it('preserves entire negative sentences and rejects invented source IDs',()=>{const s=sentenceSources(['我没有拍照。白鹭站在浅水里。']);expect(renderSelection(s,['s0','invented'])).toBe('我没有拍照。');});
 it('emits source sentences before the model stream finishes',async()=>{let finished=false;const spy=vi.spyOn(deepSeek,'streamText').mockImplementation(async function*(){yield '{"selected":["s0"';yield ',"s1"]}';finished=true;});const stream=streamGroundedText(sentenceSources(['第一句。第二句。']));const first=await stream.next();expect(first.value?.type).toBe('sentence');expect(finished).toBe(false);const rest=[];for await(const e of stream)rest.push(e);expect(rest.at(-1)).toMatchObject({type:'done',text:'第一句。\n第二句。'});spy.mockRestore();});
});
describe('source sync contract',()=>{
 it('accepts originals separately from generated content',()=>{const parsed=memorySyncSchema.parse({id:'r',title:'',content:'生成正文',original:{version:1,note:'原话',extra:'补充',chat:[{role:'me',text:'第二句'},{role:'it',text:'AI回复'}]},tags:[],aiFacts:[],hasPhoto:false,createdAt:1,updatedAt:1,revision:0,deviceId:'9e10848a-3a88-4c6c-b829-07cf2ca43719'});expect(parsed.original?.chat).toHaveLength(2);});
});
