// Run with:  node --test   (from the functions folder)
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const sim = require('./sim');

const seq = (...values) => { let i = 0; return () => values[i++ % values.length]; };

test('a normal reading stays inside the default limits and is Normal', () => {
  for (let i = 0; i < 500; i++) {
    const d = sim.newDevice(sim.DEVICE_TEMPLATES[i % 3]);
    const out = sim.simulateDevice(d, null, new Date());
    assert.strictEqual(out.deviceUpdate.status, 'Normal', JSON.stringify(out.reading));
    assert.strictEqual(out.alerts.length, 0);
    assert.strictEqual(out.reading.out_of_limits, false);
  }
});

test('power is voltage x current', () => {
  const r = { temperature: 31.2, humidity: 66, voltage: 231.5, current: 8.2, vibration: 1.9 };
  assert.strictEqual(sim.applyRules(r, sim.DEFAULT_LIMITS).power, 1898.3);
});

test('each event breaks the right limit with the right status', () => {
  const cases = {
    'overheating': ['temperature', 'Critical'],
    'voltage-drop': ['voltage (low)', 'Warning'],
    'current-spike': ['current', 'Warning'],
    'high-vibration': ['vibration', 'Critical'],
  };
  for (const [event, [param, status]] of Object.entries(cases)) {
    const d = sim.newDevice(sim.DEVICE_TEMPLATES[1]);
    const out = sim.simulateDevice(d, event, new Date());
    assert.strictEqual(out.deviceUpdate.status, status, event);
    assert.ok(out.alerts.some((a) => a.parameter === param), event);
    assert.ok(out.alerts.every((a) => a.level === status && a.resolved === false && a.device_code === 'PNL-02'));
  }
});

test('a lowered limit from the admin is used', () => {
  const d = { ...sim.newDevice(sim.DEVICE_TEMPLATES[1]), max_temperature: 20 };
  const out = sim.simulateDevice(d, null, new Date());
  assert.strictEqual(out.deviceUpdate.status, 'Warning');
  assert.ok(out.alerts.some((a) => a.parameter === 'temperature' && a.limit === 20));
});

test('history keeps the last 10 temperatures and feeds the summary', () => {
  let h = [];
  for (let i = 1; i <= 15; i++) h = sim.nextHistory(h, i);
  assert.deepStrictEqual(h, [6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
  const s = sim.summaryText(h, 'Normal', sim.DEFAULT_LIMITS, 1800);
  assert.match(s, /average temperature 10\.5 °C, highest 15 °C \(limit 45\)/);
  assert.match(s, /No action needed\./);
});

test('around() stays within base +/- spread', () => {
  assert.strictEqual(sim.around(10, 2, seq(0)), 8);
  assert.strictEqual(sim.around(10, 2, seq(0.999999)), 12);
});

test('malaysiaText is UTC+8', () => {
  assert.strictEqual(sim.malaysiaText(new Date('2026-10-18T06:05:33Z')), '18/10 14:05:33');
});

test('devices get the right templates', () => {
  assert.strictEqual(sim.templateFor('PNL-02').name, 'CNC Machine Panel');
  const d = sim.newDevice(sim.DEVICE_TEMPLATES[2]);
  assert.strictEqual(d.code, 'PNL-03');
  assert.strictEqual(d.max_vibration, 4.5);
});
