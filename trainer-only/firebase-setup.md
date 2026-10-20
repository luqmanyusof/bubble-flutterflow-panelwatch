# Trainer — Firebase setup for PanelWatch

Do this **at least 3 days before the course**, then do the dry run in `delivery-notes.md`. About an
hour the first time. Participants never touch Firebase.

**One backend for the whole class:** one Firebase project, one simulator, three panels
(`PNL-01..03`), one set of collections. Participants get no device, endpoint or data of their own —
every Bubble and FlutterFlow app reads and writes the same documents. Nothing here scales with class
size except reads (section 6).

## 1. Create the project
1. **console.firebase.google.com → Add project** → e.g. `panelwatch-class` (note the **project ID** —
   it may get a suffix, e.g. `panelwatch-class-3f9a1`). Google Analytics: off.
2. **Upgrade to Blaze** (pay as you go): **Build → Functions** or the plan badge → **Upgrade**.
   Scheduled Cloud Functions need Blaze. The free allowances still apply on Blaze; this course costs
   cents (see section 6).
3. **Set a budget alert:** console.cloud.google.com → **Billing → Budgets & alerts → Create budget** →
   this project only → amount **RM 20** (or USD 5) → alerts at 50%, 90%, 100%. A budget only
   **emails** you — it doesn't stop spending. The `enabled`/`stop_at` switches below do that.

## 2. Create Firestore
1. **Build → Firestore Database → Create database** → location **asia-southeast1 (Singapore)** →
   **Start in test mode**.
2. Location can't be changed later. Use `asia-southeast1` — the Cloud Function runs there too.

## 3. Deploy the rules, indexes and simulator
On a laptop with **Node 22** and the Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
cd trainer-only/firebase/functions
npm install
npm test                      # 15 tests must pass
cd ..
firebase deploy --only firestore,functions --project <PROJECT_ID>
```
- **Always pass `--project <PROJECT_ID>`.** A bare `firebase deploy` uses the CLI's active project,
  which may be a different one.
- First deploy: the CLI enables Cloud Functions, Cloud Build, Artifact Registry and Cloud Scheduler.
  If it asks for an **Artifact Registry clean-up policy**, accept the default (1 day).
- **Before deploying, check the date in `firestore.rules`** (`open()`: now the end of 23 Oct 2026,
  Malaysia time). After it, the database refuses every participant read and write. Change it for
  each new class.
- **What gets deployed:**

| File | What it does |
|---|---|
| `firestore.rules` | Participants' apps read `devices` and `readings`, and the Bubble admin may change one field: a panel's `enabled`, to `true` or `false` (only with `updateMask`, so a panel can't be wiped). The rules cap searches at 50 documents, refuse deletes and other collections, and keep `config` read-only. They also still allow two simulator-era writes (`commands`, `alerts` updates) — unused in class, harmless. Limits can only be changed in the console. The project ID is in the public notes, so these are what stop abuse |
| `firestore.indexes.json` | Two indexes: `readings` (device_code ↑, time ↓) — the one the course uses — and `alerts` (resolved ↑, time ↓), kept for the simulator's data. Indexes take a few minutes to build — **Firestore → Indexes** shows *Enabled* when done |
| `functions/` | `simulateReadings` — runs every minute, writes one reading per panel every `interval_seconds` |

## 4. Switch the simulator on
**Firestore → Data → Start collection** `config` → document ID `simulator`:

| Field | Type | Value |
|---|---|---|
| `enabled` | boolean | `true` |
| `interval_seconds` | number | `30` (10–60; `60` halves the cost again — see section 6) |
| `event_chance` | number | `0.05` (chance of a random event per panel per reading; `0` = only the events you send — `delivery-notes.md`) |
| `stop_at` | timestamp | the end of the class day, e.g. 18 Oct 2026 18:00 (UTC+8) |

Within a minute the function creates `devices/PNL-01..03` (each with its own `enabled: true` — the
admin's switch, not this one) and starts writing `readings`. Check:
- **Firestore → Data:** `readings` grows by 3 every 30 seconds.
- **Functions → simulateReadings → Logs:** `Tick 1/2: 3 devices, 0 command(s).`
- Browser: `https://firestore.googleapis.com/v1/projects/<PROJECT_ID>/databases/(default)/documents/devices`
  returns three documents.

**To stop:** set `enabled` to `false` (takes effect within a minute). Past `stop_at`, the function sets
`enabled` to `false` itself. **Day 2 morning:** set `enabled: true` and a new `stop_at`.

## 5. Give FlutterFlow access (for Day 2)
FlutterFlow connects to a Firebase project only if its service account can manage it.
1. console.cloud.google.com → select the project → **IAM & Admin → IAM → Grant access**.
2. **New principal:** `firebase@flutterflow.io` → **Role:** *Editor* → **Save**.
3. Test it yourself: a blank FlutterFlow project → **Settings → Firebase** → enter the project ID →
   **Connect**. If it asks for your Google account to be a member of the project, also add the
   participants' Google accounts as **Viewer** (Firebase console → **Project settings → Users and
   permissions**) — collect their emails at registration just in case.

## 6. Cost and quota

The free allowance is **20,000 writes and 50,000 reads a day**, reset at midnight US Pacific time
(**3 pm Malaysia** until early November, **4 pm** after).

| Per hour, 20 people, 30 s interval | Writes | Reads |
|---|---|---|
| Simulator (3 readings + 3 panel updates per tick, plus alerts) | ~750 | ~550 |
| Bubble — dashboard every 60 s, plus Refresh presses (not affected by the interval) | a few | ~4,500 |
| FlutterFlow — live lists: each panel update = one read **per open app** | a few | ~500 per open app: ~10,000 with one app each, 20,000–30,000 with two or three (phone, Test Mode and web app each count) |

- **Writes** stay far inside the allowance: ~6,000 for an 8-hour day.
- **Day 1 reads** (Bubble): ~20,000. Inside the allowance.
- **Day 2 reads** (FlutterFlow live, 14:00–17:00) are the only line that can pass 50,000 — when
  people keep two or three copies of the app open. The 3 pm reset splits the afternoon in two.
- **Watch it:** **Firestore → Usage** shows today's reads. Past ~35,000 before the reset, set
  `interval_seconds` to `60` (live lists still update, once a minute) and ask the room to close
  Test Mode tabs they aren't using.
- **Passing the allowance doesn't stop anything** on Blaze — the extra reads cost a few US cents per
  100,000. The design is nowhere near Firestore's hard limits (1 write a second per document; the
  busiest document, each panel, gets one every 30 s).

## 7. After the course
1. `config/simulator` → `enabled: false`. The rules close on their own after 23 Oct, but the
   simulator ignores rules — to remove it completely:
   `firebase functions:delete simulateReadings --region asia-southeast1 --project panelwatch-class`.
2. Either delete the project (**Project settings → Delete project**) or keep it for the next run with
   the simulator off. Readings pile up (~360 an hour while on); delete the `readings` and `alerts`
   collections before the next class if you want a clean start.
3. Remove `firebase@flutterflow.io` and any participant accounts from IAM if you keep the project.

## Running the tests
```bash
cd trainer-only/firebase/functions && npm install && npm test
```
`sim.test.js` checks the rules (power, limits, status, events, summary); `tick.test.js` runs a whole
tick against an in-memory stand-in for Firestore (devices created, test events applied once, changed
limits used, a panel's `enabled` added once and never overwritten).
