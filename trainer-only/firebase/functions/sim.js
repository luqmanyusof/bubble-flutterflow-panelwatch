// PanelWatch simulator logic - pure functions, no Firebase calls (so they can be tested on their own).
'use strict';

const DEFAULT_LIMITS = Object.freeze({
  max_temperature: 45,
  max_humidity: 85,
  min_voltage: 207,
  max_voltage: 253,
  max_current: 20,
  max_vibration: 4.5,
});

// Status rule thresholds (same for every device)
const CRITICAL_TEMPERATURE = 60;
const CRITICAL_VIBRATION = 7.1;

// The three panels the whole class monitors
const DEVICE_TEMPLATES = Object.freeze([
  { code: 'PNL-01', name: 'Main Panel Level 1', location: 'Factory A, Shah Alam', baseTemperature: 30, baseCurrent: 8 },
  { code: 'PNL-02', name: 'CNC Machine Panel', location: 'Factory A, Shah Alam', baseTemperature: 33, baseCurrent: 12 },
  { code: 'PNL-03', name: 'Office Panel', location: 'Block B, Shah Alam', baseTemperature: 28, baseCurrent: 5 },
]);

const EVENTS = Object.freeze(['overheating', 'voltage-drop', 'current-spike', 'high-vibration']);

function round1(x) {
  return Math.round(x * 10) / 10;
}

// A value around base, +/- spread, rounded to 1 decimal place
function around(base, spread, rng = Math.random) {
  return round1(base + (rng() * 2 - 1) * spread);
}

function templateFor(code) {
  return DEVICE_TEMPLATES.find((t) => t.code === code) || DEVICE_TEMPLATES[0];
}

// New device document
function newDevice(template) {
  return {
    code: template.code,
    name: template.name,
    location: template.location,
    ...DEFAULT_LIMITS,
    latest_temperature: 0,
    latest_humidity: 0,
    latest_voltage: 0,
    latest_current: 0,
    latest_vibration: 0,
    latest_power: 0,
    last_reading_text: '-',
    status: 'Normal',
    summary: 'No readings yet.',
    recent_temperatures: [],
  };
}

// Five readings; event = one of EVENTS, or null for a normal reading
function makeReading(template, event, rng = Math.random) {
  const r = {
    temperature: around(template.baseTemperature, 1.5, rng),
    humidity: around(68, 8, rng),
    voltage: around(232, 4, rng),
    current: around(template.baseCurrent, 1.5, rng),
    vibration: around(2.0, 0.8, rng),
  };
  if (event === 'overheating') r.temperature = around(64, 3, rng); // always >= 61, so Critical
  if (event === 'voltage-drop') r.voltage = around(195, 5, rng);
  if (event === 'current-spike') r.current = around(28, 3, rng);
  if (event === 'high-vibration') r.vibration = around(9.5, 1, rng);
  return r;
}

// Read a limit from a device document, falling back to the default
function limitsOf(device) {
  const out = {};
  for (const k of Object.keys(DEFAULT_LIMITS)) {
    const v = Number(device && device[k]);
    out[k] = Number.isFinite(v) ? v : DEFAULT_LIMITS[k];
  }
  return out;
}

// Power, broken limits, status
function applyRules(r, limits) {
  const power = round1(r.voltage * r.current);
  const broken = [];
  if (r.temperature > limits.max_temperature) broken.push({ parameter: 'temperature', value: r.temperature, limit: limits.max_temperature });
  if (r.humidity > limits.max_humidity) broken.push({ parameter: 'humidity', value: r.humidity, limit: limits.max_humidity });
  if (r.voltage < limits.min_voltage) broken.push({ parameter: 'voltage (low)', value: r.voltage, limit: limits.min_voltage });
  if (r.voltage > limits.max_voltage) broken.push({ parameter: 'voltage (high)', value: r.voltage, limit: limits.max_voltage });
  if (r.current > limits.max_current) broken.push({ parameter: 'current', value: r.current, limit: limits.max_current });
  if (r.vibration > limits.max_vibration) broken.push({ parameter: 'vibration', value: r.vibration, limit: limits.max_vibration });

  let status = 'Normal';
  if (broken.length > 0) status = 'Warning';
  if (r.temperature >= CRITICAL_TEMPERATURE || r.vibration >= CRITICAL_VIBRATION) status = 'Critical';
  return { power, broken, status, outOfLimits: broken.length > 0 };
}

// Keep the last 10 temperatures
function nextHistory(previous, temperature) {
  const list = Array.isArray(previous) ? previous.map(Number).filter(Number.isFinite) : [];
  list.push(temperature);
  return list.slice(-10);
}

function summaryText(history, status, limits, power) {
  const avg = round1(history.reduce((a, b) => a + b, 0) / history.length);
  const max = Math.max(...history);
  const action =
    status === 'Critical' ? 'Shut down the load and inspect now.' :
    status === 'Warning' ? 'Check ventilation and connections.' :
    'No action needed.';
  return `Status: ${status}. Last ${history.length} readings: average temperature ${avg} °C, ` +
    `highest ${max} °C (limit ${limits.max_temperature}). Power now ${power} W. ${action}`;
}

// "18/10 14:05:33" in Malaysia time
function malaysiaText(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kuala_Lumpur', day: '2-digit', month: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  }).formatToParts(date);
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return `${p.day}/${p.month} ${p.hour}:${p.minute}:${p.second}`;
}

// Everything to write for one device in one tick
function simulateDevice(device, event, now, rng = Math.random) {
  const template = templateFor(device.code);
  const limits = limitsOf(device);
  const r = makeReading(template, event, rng);
  const { power, broken, status, outOfLimits } = applyRules(r, limits);
  const history = nextHistory(device.recent_temperatures, r.temperature);
  const text = malaysiaText(now);

  const reading = {
    device_code: device.code,
    ...r,
    power,
    out_of_limits: outOfLimits,
    time: now,
    time_text: text,
    time_unix: now.getTime(),
  };

  const deviceUpdate = {
    latest_temperature: r.temperature,
    latest_humidity: r.humidity,
    latest_voltage: r.voltage,
    latest_current: r.current,
    latest_vibration: r.vibration,
    latest_power: power,
    last_reading_at: now,
    last_reading_text: text,
    status,
    summary: summaryText(history, status, limits, power),
    recent_temperatures: history,
  };

  const level = status === 'Critical' ? 'Critical' : 'Warning';
  const alerts = broken.map((b) => ({
    device_code: device.code,
    parameter: b.parameter,
    value: b.value,
    limit: b.limit,
    level,
    resolved: false,
    acknowledged_by: '',
    time: now,
    time_text: text,
  }));

  return { reading, deviceUpdate, alerts };
}

module.exports = {
  DEFAULT_LIMITS, DEVICE_TEMPLATES, EVENTS, CRITICAL_TEMPERATURE, CRITICAL_VIBRATION,
  around, templateFor, newDevice, makeReading, limitsOf, applyRules, nextHistory,
  summaryText, malaysiaText, simulateDevice,
};
