// @vitest-environment happy-dom
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";

let repository;
beforeEach(()=>{vi.resetModules();vi.stubGlobal("indexedDB",new IDBFactory());localStorage.clear();delete window.LuminaRecords;window.LuminaUI={refresh:vi.fn(),toast:vi.fn()};});
afterEach(async()=>{if(repository) await repository.ready;const {openDb}=await import('../../frontend/src/storage/indexeddb.js');(await openDb()).close();vi.restoreAllMocks();vi.unstubAllGlobals();repository=null;});
async function load(){repository=(await import('../../frontend/src/storage/records.js')).recordsRepository;await repository.ready;return repository;}
async function putLegacyMemory(value){const {dbPut}=await import('../../frontend/src/storage/indexeddb.js');await dbPut('memories',{id:'legacy',title:'河边',content:'AI整理过的正文',supplement:'用户原话',createdAt:Date.parse('2025-09-25'),updatedAt:1,revision:0,deletedAt:null,...value});}
describe('durable records and explicit deletion',()=>{
 it('recovers IndexedDB-only records and keeps them after a normal save',async()=>{await putLegacyMemory();const r=await load();expect(r.list()[0].note).toBe('用户原话');await r.replace([{id:'new',ts:new Date().toISOString(),note:'新记录'}]);expect(new Set(r.list().map(x=>x.id))).toEqual(new Set(['legacy','new']));expect(await r.pendingDeletes()).toEqual([]);});
 it('does not infer deletion from an empty or incomplete cache',async()=>{await putLegacyMemory();const r=await load();await r.replace([]);expect(r.list()).toHaveLength(1);expect(await r.pendingDeletes()).toEqual([]);});
 it('deletes only named records and durably queues the explicit intent',async()=>{await putLegacyMemory();const r=await load();await r.replace([],{deletedIds:['legacy']});expect(r.list()).toEqual([]);expect(await r.pendingDeletes()).toEqual(['legacy']);});
 it('does not reimport deleted records from a stale compatibility cache',async()=>{await putLegacyMemory();const r=await load();await r.replace([],{deletedIds:['legacy']});localStorage.setItem('lumina.records.v3',JSON.stringify([{id:'legacy',note:'旧缓存'}]));const {openDb}=await import('../../frontend/src/storage/indexeddb.js');(await openDb()).close();vi.resetModules();const again=await load();expect(again.list()).toEqual([]);});
 it('keeps saved IndexedDB data when localStorage is full',async()=>{const r=await load();vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new DOMException('full','QuotaExceededError')});await r.replace([{id:'safe',ts:new Date().toISOString(),note:'持久保存'}]);const {dbGet}=await import('../../frontend/src/storage/indexeddb.js');expect((await dbGet('records','safe')).note).toBe('持久保存');});
});
