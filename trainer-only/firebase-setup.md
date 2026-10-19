# Trainer — Firebase setup for PanelWatch

Do this **at least 3 days before the course**, then do the dry run in `delivery-notes.md`. About an
hour the first time. Participants never touch Firebase.

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
npm test                      # 12 tests must pass
cd ..
firebase deploy --only firestore,functions --project <PROJECT_ID>
```
- **Always pass `--project <PROJECT_ID>`.** A bare `firebase deploy` uses the CLI's active project,
  which may be a different one.
- First deploy: the CLI enables Cloud Functions, Cloud Build, Artifact Registry and Cloud Scheduler.
  If it asks for an **Artifact Registry clean-up policy**, accept the default (1 day).
- **Before deploying, edit the date in `firestore.rules`** (`timestamp.date(2026, 12, 31)`) to a few
  days after the course. After that date the database refuses all participant reads and writes.
- **What gets deployed:**

| File | What it does |
|---|---|
| `firestore.rules` | Test mode for every collection, except `config` — participants can read it but can't write it |
| `firestore.indexes.json` | Two indexes: `readings` (device_code ↑, time ↓) and `alerts` (resolved ↑, time ↓). Indexes take a few minutes to build — **Firestore → Indexes** shows *Enabled* when done |
| `functions/` | `simulateReadings` — runs every minute, writes one reading per panel every `interval_seconds` |

## 4. Switch the simulator on
**Firestore → Data → Start collection** `config` → document ID `simulator`:

| Field | Type | Value |
|---|---|---|
| `enabled` | boolean | `true` |
| `interval_seconds` | number | `15` (10–60; 20 or 30 halves the cost) |
| `event_chance` | number | `0.05` (chance of a random event per panel per reading; `0` = only test events) |
| `stop_at` | timestamp | the end of the class day, e.g. 18 Oct 2026 18:00 (UTC+8) |

Within a minute the function creates `devices/PNL-01..03` and starts writing `readings`. Check:
- **Firestore → Data:** `readings` grows by 3 every 15 seconds.
- **Functions → simulateReadings → Logs:** `Tick 1/4: 3 devices, 0 command(s).`
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

| Per hour (15 s interval) | Writes | Reads |
|---|---|---|
| Simulator | ~1,440 (3 readings + 3 device updates every 15 s, plus alerts) | ~1,000 |
| Bubble — 20 people, dashboard every 60 s | — | ~3,600 |
| FlutterFlow — 20 people, live panel list | — | up to ~14,400 (every change to a panel = one read per open app) |

The free allowance is **20,000 writes and 50,000 reads a day**, reset at midnight US Pacific time
(**3 pm Malaysia** until early November, **4 pm** after). Day 2 can pass the free reads; on Blaze the
extra costs well under RM 1 for the day. If you are worried, set `interval_seconds` to 30.

## 7. After the course
1. `config/simulator` → `enabled: false`.
2. Either delete the project (**Project settings → Delete project**) or keep it for the next run with
   the simulator off. Readings pile up (~11,000 a day while on); delete the `readings` and `alerts`
   collections before the next class if you want a clean start.
3. Remove `firebase@flutterflow.io` and any participant accounts from IAM if you keep the project.

## Running the tests
```bash
cd trainer-only/firebase/functions && npm install && npm test
```
`sim.test.js` checks the rules (power, limits, status, events, summary); `tick.test.js` runs a whole
tick against an in-memory stand-in for Firestore (devices created, test events applied once, changed
limits used).
