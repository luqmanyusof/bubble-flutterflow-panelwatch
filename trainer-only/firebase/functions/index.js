// PanelWatch - the simulator that runs inside Firebase.
// Every minute Cloud Scheduler starts this function; it writes one reading for each of the
// three panels every `interval_seconds` (default 15) during that minute - but only while
// config/simulator has `enabled: true` and the time is before `stop_at`.
'use strict';

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const sim = require('./sim');

initializeApp();
const db = getFirestore();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loadConfig() {
  const snap = await db.doc('config/simulator').get();
  if (!snap.exists) return null;
  const c = snap.data();
  const interval = Math.min(60, Math.max(10, Number(c.interval_seconds) || 15));
  const eventChance = Math.min(1, Math.max(0, Number(c.event_chance ?? 0.05)));
  const stopAt = c.stop_at && typeof c.stop_at.toDate === 'function' ? c.stop_at.toDate() : null;
  return { enabled: c.enabled === true, interval, eventChance, stopAt };
}

// Read the three devices (creating any that are missing); return them by code
async function loadDevices() {
  const byCode = new Map();
  const batch = db.batch();
  let created = 0;
  for (const template of sim.DEVICE_TEMPLATES) {
    const ref = db.collection('devices').doc(template.code);
    const snap = await ref.get();
    if (snap.exists) {
      byCode.set(template.code, { ref, data: snap.data() });
    } else {
      const data = sim.newDevice(template);
      batch.set(ref, data);
      byCode.set(template.code, { ref, data });
      created++;
    }
  }
  if (created > 0) {
    await batch.commit();
    logger.info(`Created ${created} device(s).`);
  }
  return byCode;
}

// Test events queued from the Bubble admin: { device_code, event, done: false }
async function loadCommands() {
  const snap = await db.collection('commands').where('done', '==', false).limit(50).get();
  return snap.docs;
}

async function tick(eventChance) {
  const devices = await loadDevices(); // re-read each tick, so limit changes apply at once
  const commands = await loadCommands();
  const forced = new Map(); // device code -> event
  const batch = db.batch();

  for (const cmd of commands) {
    const c = cmd.data();
    const code = String(c.device_code || '').toUpperCase();
    const event = sim.EVENTS.includes(c.event) ? c.event : null;
    if (event && devices.has(code)) forced.set(code, event);
    batch.update(cmd.ref, { done: true, done_at: FieldValue.serverTimestamp() });
  }

  const now = new Date();
  for (const [code, { ref, data }] of devices) {
    let event = forced.get(code) || null;
    if (!event && Math.random() < eventChance) {
      event = sim.EVENTS[Math.floor(Math.random() * sim.EVENTS.length)];
    }
    const out = sim.simulateDevice({ ...data, code }, event, now);
    batch.set(db.collection('readings').doc(), out.reading);
    batch.update(ref, out.deviceUpdate);
    for (const alert of out.alerts) batch.set(db.collection('alerts').doc(), alert);
  }

  await batch.commit();
  return { devices: devices.size, commands: commands.length };
}

exports._tick = tick; // for tests
exports.simulateReadings = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'Asia/Kuala_Lumpur',
    region: 'asia-southeast1',
    timeoutSeconds: 120,
    memory: '256MiB',
    maxInstances: 1,
  },
  async () => {
    const cfg = await loadConfig();
    if (!cfg || !cfg.enabled) return;
    if (cfg.stopAt && new Date() > cfg.stopAt) {
      logger.info('Past stop_at - switching the simulator off.');
      await db.doc('config/simulator').update({ enabled: false });
      return;
    }
    const ticks = Math.max(1, Math.floor(60 / cfg.interval));
    for (let i = 0; i < ticks; i++) {
      if (i > 0) await sleep(cfg.interval * 1000);
      const result = await tick(cfg.eventChance);
      logger.info(`Tick ${i + 1}/${ticks}: ${result.devices} devices, ${result.commands} command(s).`);
    }
  }
);
