// End-to-end test of one simulator tick against a tiny in-memory stand-in for Firestore.
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const Module = require('node:module');

// ---- a minimal fake Firestore -------------------------------------------
const store = new Map(); // "collection/id" -> data
let autoId = 0;
const docRef = (col, id) => ({
  path: `${col}/${id}`,
  async get() { const d = store.get(`${col}/${id}`); return { exists: !!d, data: () => d && { ...d }, ref: docRef(col, id), id }; },
  async update(patch) { store.set(`${col}/${id}`, { ...store.get(`${col}/${id}`), ...patch }); },
});
const fakeDb = {
  doc(path) { const [c, i] = path.split('/'); return docRef(c, i); },
  collection(col) {
    return {
      doc(id) { return docRef(col, id || `auto${++autoId}`); },
      where(field, op, value) {
        return {
          limit() { return this; },
          async get() {
            const docs = [...store.entries()]
              .filter(([k, v]) => k.startsWith(`${col}/`) && op === '==' && v[field] === value)
              .map(([k, v]) => ({ id: k.split('/')[1], data: () => ({ ...v }), ref: docRef(col, k.split('/')[1]) }));
            return { docs };
          },
        };
      },
    };
  },
  batch() {
    const ops = [];
    return {
      set(ref, data) { ops.push(() => store.set(ref.path, { ...data })); },
      update(ref, patch) { ops.push(() => store.set(ref.path, { ...store.get(ref.path), ...patch })); },
      async commit() { ops.forEach((op) => op()); },
    };
  },
};
const fakes = {
  'firebase-admin/app': { initializeApp() {} },
  'firebase-admin/firestore': { getFirestore: () => fakeDb, FieldValue: { serverTimestamp: () => 'SERVER_TIME' } },
};
const realLoad = Module._load;
Module._load = function (request, ...rest) {
  return fakes[request] || realLoad.call(this, request, ...rest);
};
const { _tick } = require('./index');
// -------------------------------------------------------------------------

const all = (col) => [...store.entries()].filter(([k]) => k.startsWith(`${col}/`)).map(([, v]) => v);

test('first tick creates the 3 devices and writes 3 readings', async () => {
  await _tick(0);
  assert.deepStrictEqual(all('devices').map((d) => d.code).sort(), ['PNL-01', 'PNL-02', 'PNL-03']);
  assert.strictEqual(all('readings').length, 3);
  assert.ok(all('devices').every((d) => d.status === 'Normal' && d.last_reading_text !== '-'));
  assert.strictEqual(all('alerts').length, 0);
});

test('a test event from the admin is applied once and marked done', async () => {
  store.set('commands/c1', { device_code: 'PNL-02', event: 'overheating', done: false });
  await _tick(0);
  assert.strictEqual(store.get('devices/PNL-02').status, 'Critical');
  assert.ok(all('alerts').some((a) => a.device_code === 'PNL-02' && a.parameter === 'temperature'));
  assert.strictEqual(store.get('commands/c1').done, true);
  await _tick(0); // next tick: back to normal readings
  assert.strictEqual(store.get('devices/PNL-02').status, 'Normal');
});

test('an unknown event or device is ignored but still marked done', async () => {
  store.set('commands/c2', { device_code: 'PNL-99', event: 'explode', done: false });
  const alertsBefore = all('alerts').length;
  await _tick(0);
  assert.strictEqual(store.get('commands/c2').done, true);
  assert.strictEqual(all('alerts').length, alertsBefore);
});

test('a limit changed by the admin applies on the next tick', async () => {
  store.set('devices/PNL-01', { ...store.get('devices/PNL-01'), max_temperature: 20 });
  await _tick(0);
  assert.strictEqual(store.get('devices/PNL-01').status, 'Warning');
  assert.strictEqual(store.get('devices/PNL-01').max_temperature, 20); // the limit itself is kept
  assert.ok(store.get('devices/PNL-01').recent_temperatures.length >= 2);
});
