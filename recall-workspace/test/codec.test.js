import { describe,expect,it } from 'vitest';
import { recordToMemory,memoryToRecord,syncFieldsChanged } from '../../frontend/src/storage/record-codec.js';
const row={id:'a',ts:'2025-09-25T12:00:00Z',kind:'text',note:'第一句',extra:'额外原话',chat:[{role:'me',text:'第一句'},{role:'it',text:'问句',question:'然后呢？'},{role:'me',text:'第二句'}],final:'整理正文'};
describe('stable sync codec and provenance',()=>{
 it('round-trips full original turns and supplement across devices',()=>{const memory=recordToMemory(row,null,'device');const remote=memoryToRecord(memory,null);expect(remote.chat).toEqual(row.chat);expect(remote.note).toBe(row.note);expect(remote.extra).toBe(row.extra);expect(remote.thumb).toBeNull();});
 it('does not repeatedly sync absent optional fields',()=>{const m=recordToMemory({...row,note:'',extra:'',chat:[]},null,'device');expect(syncFieldsChanged({...m,mood:null,supplement:null},{...m,mood:undefined,supplement:undefined})).toBe(false);});
 it('ignores JSONB object key ordering',()=>{const m=recordToMemory(row,null,'device');const original={chat:m.original.chat,extra:m.original.extra,note:m.original.note,version:1};expect(syncFieldsChanged({...m,original},m)).toBe(false);});
});
