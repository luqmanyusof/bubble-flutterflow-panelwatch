# PanelWatch — Firebase Data & API Reference

*Everything you need to know about the database behind PanelWatch. You don't set anything up in
Firebase — the trainer runs the project. You only read and write data through it.*

**Firebase** is Google's app platform. PanelWatch uses two parts of it:
- **Cloud Firestore** — a cloud database that stores data as **documents** grouped into
  **collections**, readable and writable over the internet.
- **Cloud Functions** — code that runs inside Firebase. PanelWatch has one: the **simulator**, which
  plays the part of three electrical panels.

| | |
|---|---|
| **Project ID** | `panelwatch-class` |
| **Shared by** | the whole class — everyone sees the same three panels, readings and alerts |
| **Writes** | the simulator (readings, alerts, latest values); Bubble admin (limits, resolving alerts, test events); FlutterFlow (acknowledging alerts) |
| **Reads** | Bubble admin (REST API), FlutterFlow (built-in Firebase connection) |
| **Security** | **no sign-in** — anyone who knows the project ID can use it, so the rules allow only what the course does (section 4.4). Open until the end of 23 Oct 2026. Simulated data only — never real names, phone numbers or company data |

---

## 1. The simulator

While the trainer has it switched on, the simulator writes **one reading for each panel every 30
seconds**. Like a smart device (an "edge device"), it also applies the rules in section 3 — so every
reading arrives with its power, status, alerts and a health summary already worked out.

| Panel | Name | Location |
|---|---|---|
| `PNL-01` | Main Panel Level 1 | Factory A, Shah Alam |
| `PNL-02` | CNC Machine Panel | Factory A, Shah Alam |
| `PNL-03` | Office Panel | Block B, Shah Alam |

Now and then a panel has a random **event**: `overheating`, `voltage-drop`, `current-spike` or
`high-vibration`. You can also **request** one (section 2.4) — it happens within 30 seconds, and the
whole class sees it.

---

## 2. Collections and fields

### 2.1 `devices` — one document per panel
**Document ID = the panel code** (e.g. `devices/PNL-01`).

| Field | Type | Example | Written by |
|---|---|---|---|
| `code` | string | `PNL-01` | simulator (once) |
| `name` | string | `Main Panel Level 1` | simulator (once) |
| `location` | string | `Factory A, Shah Alam` | simulator (once) |
| `max_temperature` | number | `45` (°C) | **Bubble admin can change** |
| `max_humidity` | number | `85` (%RH) | Bubble admin |
| `min_voltage` | number | `207` (V) | Bubble admin |
| `max_voltage` | number | `253` (V) | Bubble admin |
| `max_current` | number | `20` (A) | Bubble admin |
| `max_vibration` | number | `4.5` (mm/s) | Bubble admin |
| `latest_temperature`, `latest_humidity`, `latest_voltage`, `latest_current`, `latest_vibration`, `latest_power` | number | `31.2` … | simulator, every reading |
| `last_reading_at` | timestamp | `2026-10-18T06:05:33.000Z` | simulator |
| `last_reading_text` | string | `18/10 14:05:33` (Malaysia time — easy to display) | simulator |
| `status` | string | `Normal` · `Warning` · `Critical` | simulator |
| `summary` | string | `Status: Normal. Last 10 readings: average temperature 30.4 °C, highest 31.6 °C (limit 45). Power now 1856 W. No action needed.` | simulator |
| `recent_temperatures` | array of numbers | the last 10 temperatures — used for the summary | simulator |

### 2.2 `readings` — one document per reading
**Document ID = generated automatically.**

| Field | Type | Example |
|---|---|---|
| `device_code` | string | `PNL-01` |
| `temperature` | number | `31.2` (°C) |
| `humidity` | number | `66.0` (%RH) |
| `voltage` | number | `231.5` (V) |
| `current` | number | `8.2` (A) |
| `vibration` | number | `1.9` (mm/s) |
| `power` | number | `1898.3` (W) — voltage × current |
| `out_of_limits` | boolean | `false` |
| `time` | timestamp | `2026-10-18T06:05:33.000Z` |
| `time_text` | string | `18/10 14:05:33` (Malaysia time) |
| `time_unix` | number | `1792303533000` — the same time in milliseconds, for chart X-axes |

### 2.3 `alerts` — one document per broken limit
**Document ID = generated automatically.**

| Field | Type | Example |
|---|---|---|
| `device_code` | string | `PNL-02` |
| `parameter` | string | `temperature` · `humidity` · `voltage (low)` · `voltage (high)` · `current` · `vibration` |
| `value` | number | `62.1` |
| `limit` | number | `45` |
| `level` | string | `Warning` · `Critical` |
| `resolved` | boolean | `false` until someone resolves or acknowledges it |
| `acknowledged_by` | string | `""`, then e.g. `Aisyah` |
| `time` | timestamp | `2026-10-18T06:07:10.000Z` |
| `time_text` | string | `18/10 14:07:10` |

### 2.4 `commands` — test events requested from the admin
**Document ID = generated automatically.** The simulator applies each one at its next reading and sets
`done` to `true`.

| Field | Type | Example |
|---|---|---|
| `device_code` | string | `PNL-02` |
| `event` | string | `overheating` · `voltage-drop` · `current-spike` · `high-vibration` |
| `done` | boolean | `false` when you send it |
| `requested_by` | string | `Aisyah` |

### 2.5 `config` — the simulator's switch (trainer only)
`config/simulator` holds `enabled`, `interval_seconds`, `event_chance` and `stop_at`. You can read it,
but only the trainer can change it.

---

## 3. The rules (applied by the simulator)

| Rule | Logic |
|---|---|
| Power | `power = voltage × current` |
| Out of limits | any of: `temperature > max_temperature`, `humidity > max_humidity`, `voltage < min_voltage`, `voltage > max_voltage`, `current > max_current`, `vibration > max_vibration` |
| Status | **Critical** if `temperature ≥ 60` or `vibration ≥ 7.1`; else **Warning** if out of limits; else **Normal** |
| Alerts | one `alerts` document for each broken limit, `level` = Critical or Warning as above |
| Summary | from the last 10 readings: average and highest temperature, current power, and an action (Critical → *Shut down the load and inspect now.*; Warning → *Check ventilation and connections.*; Normal → *No action needed.*) |
| Limits | read from the `devices` document at every reading — a limit changed in Bubble applies within 30 seconds |

---

## 4. The REST API (used by Bubble)

**Base URL** for every call:

```text
https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents
```

### 4.1 How Firestore writes values
The REST API wraps every value with its type. Reading `fields.max_temperature.doubleValue` gives you
the number.

```json
{
  "fields": {
    "code":            { "stringValue": "PNL-01" },
    "max_temperature": { "doubleValue": 45 },
    "resolved":        { "booleanValue": false },
    "time":            { "timestampValue": "2026-10-18T06:05:33.000Z" }
  }
}
```

| Firestore type | JSON wrapper |
|---|---|
| string | `stringValue` |
| number | `doubleValue` — PanelWatch always stores numbers as doubles. (A whole number typed in the Firebase console may come back as `integerValue`.) |
| boolean | `booleanValue` |
| timestamp | `timestampValue` |
| array | `arrayValue` → `values` → a list of wrapped values |

### 4.2 The calls

| # | What | Method & path (after the base URL) | Body |
|---|---|---|---|
| 1 | List the panels | `GET /devices` | — |
| 2 | Get one panel | `GET /devices/PNL-01` | — |
| 3 | Last 20 readings of a panel | `POST :runQuery` | A |
| 4 | Open alerts, newest first | `POST :runQuery` | B |
| 5 | Resolve an alert | `PATCH /alerts/<ALERT_ID>?updateMask.fieldPaths=resolved&updateMask.fieldPaths=acknowledged_by` | C |
| 6 | Change a panel's limits | `PATCH /devices/PNL-01?updateMask.fieldPaths=max_temperature&updateMask.fieldPaths=max_vibration` (one `fieldPaths` for each field you change) | D |
| 7 | Request a test event | `POST /commands` | E |

`:runQuery` has **no slash** before it: `…/documents:runQuery`.

**Body A — last 20 readings of one panel**
```json
{ "structuredQuery": {
    "from": [ { "collectionId": "readings" } ],
    "where": { "fieldFilter": { "field": { "fieldPath": "device_code" }, "op": "EQUAL", "value": { "stringValue": "PNL-01" } } },
    "orderBy": [ { "field": { "fieldPath": "time" }, "direction": "DESCENDING" } ],
    "limit": 20
} }
```

**Body B — open alerts, newest first**
```json
{ "structuredQuery": {
    "from": [ { "collectionId": "alerts" } ],
    "where": { "fieldFilter": { "field": { "fieldPath": "resolved" }, "op": "EQUAL", "value": { "booleanValue": false } } },
    "orderBy": [ { "field": { "fieldPath": "time" }, "direction": "DESCENDING" } ],
    "limit": 30
} }
```

**Body C — resolve an alert**
```json
{ "fields": { "resolved": { "booleanValue": true }, "acknowledged_by": { "stringValue": "Aisyah" } } }
```

**Body D — change limits**
```json
{ "fields": { "max_temperature": { "doubleValue": 50 }, "max_vibration": { "doubleValue": 5 } } }
```

**Body E — request a test event**
```json
{ "fields": {
    "device_code":  { "stringValue": "PNL-02" },
    "event":        { "stringValue": "overheating" },
    "done":         { "booleanValue": false },
    "requested_by": { "stringValue": "Aisyah" }
} }
```

### 4.3 What comes back
- **GET a list** (`/devices`) returns `{ "documents": [ { "name": "…", "fields": { … } }, … ] }`.
- **GET one** returns one document: `{ "name": "projects/…/documents/devices/PNL-01", "fields": { … } }`.
- **runQuery** returns a **list**, one item per document:
  `[ { "document": { "name": "…", "fields": { … } }, "readTime": "…" }, … ]`.
  If nothing matches (e.g. no open alerts), the list has **one item with only `readTime`** and no
  `document` — filter it out.
- The **document ID** is the last part of `name`: `…/alerts/Xk29Lq` → `Xk29Lq`. You need it to
  resolve an alert.

### 4.4 Rules worth remembering
- **Always send `updateMask` with PATCH.** Without it, Firestore **replaces the whole document** with
  only the fields you sent — "change one limit" would wipe the panel's name, latest values and every
  other limit, for the whole class. (In PanelWatch the rules refuse such a PATCH with
  `PERMISSION_DENIED` — in a project without rules, it would go through.)
- **What the rules allow** — anything else returns **`PERMISSION_DENIED`**:

| Collection | Read | Write |
|---|---|---|
| `devices` | yes | only the six limits, as numbers |
| `readings` | one document, or a search with `limit` 50 or less | no |
| `alerts` | one document, or a search with `limit` 50 or less | only `resolved` and `acknowledged_by` |
| `commands` | no | create a test event (exactly the four fields in Body E) |
| `config` | yes | no |

- **Sorted searches need an index.** Bodies A and B filter on one field and sort on another; the
  trainer created those two indexes. Any new combination fails with **`FAILED_PRECONDITION: The query
  requires an index`**.
- **Numbers are doubles.** Write numbers as `doubleValue`, read them from `doubleValue`.

---

## 5. In FlutterFlow (Day 2)
FlutterFlow doesn't use the REST API — it connects to Firestore directly, and its lists are **live**:
they update by themselves within a second of the simulator writing. You describe the same collections
and fields in FlutterFlow's Firestore panel. Types map as: string → **String**, number → **Double**,
boolean → **Boolean**, timestamp → **DateTime**, array of numbers → **List < Double >**.

> **Never** use FlutterFlow's buttons to **deploy Firestore rules or indexes**. The project is shared —
> a deploy from your project replaces the rules for everyone.

---

## 6. Sharing one database with the whole class
- **Everything is shared.** When you resolve an alert, it disappears for everyone. When you change a
  limit, every app sees it. That's how a real control room works — so agree before you change things.
- **Change limits only in the guided exercise** (Day 1, Topic 7), and put them back afterwards.
- **Test events:** one request is enough — they arrive within 30 seconds.
- **Refresh sensibly in Bubble:** every 60 seconds at most on the dashboard, a **Refresh** button
  elsewhere. Every fetch costs one read per document returned.
- **Close what you're not using.** Every open copy of your app reads on its own — a Bubble Preview tab
  on its 60-second timer, a FlutterFlow Test Mode tab, the app on your phone. Keep one live copy open.
- If calls fail with **429 / RESOURCE_EXHAUSTED**, tell the trainer.
