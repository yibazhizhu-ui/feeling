import test from 'node:test';
import assert from 'node:assert/strict';
import { snapMood, moodDetails, localDateKey } from '../src/mood.js';
import { saveEntry, readEntries } from '../src/storage.js';

test('pointer snaps within center zone and preserves both ends', () => {
  for (const n of [-5,-1,0,1,5]) assert.equal(snapMood(n),0);
  for (const n of [-100,-6,6,100]) assert.equal(snapMood(n),n);
  assert.equal(snapMood(-500),-100);assert.equal(snapMood(500),100);
  assert.equal(moodDetails(0).name,'平静');
});
test('date key uses local calendar day, including midnight', () => {
  assert.equal(localDateKey(new Date(2026,9,20,0,1)),'2026-10-20');
});
test('one entry per day persists, updates, and sorts newest first', () => {
  let data;
  const storage = { getItem: () => data, setItem: (_,next) => data = next };
  saveEntry({ date:'2026-10-19',value:-60,note:'a' },storage);
  saveEntry({ date:'2026-10-20',value:75,note:'b' },storage);
  saveEntry({ date:'2026-10-20',value:0,note:'updated' },storage);
  const saved = readEntries(storage);
  assert.equal(saved.length,2);assert.equal(saved[0].note,'updated');assert.equal(saved[0].value,0);
});
test('storage failure is surfaced and corrupt records are not overwritten', () => {
  assert.throws(() => saveEntry({ date:'2026-10-20',value:0,note:'' },{getItem: () => null,setItem: () => {throw Error('Quota');}}));
  let overwritten = false;
  assert.throws(() => saveEntry({ date:'2026-10-20',value:0,note:'' },{getItem: () => 'broken',setItem: () => overwritten = true}));
  assert.equal(overwritten,false);
});
