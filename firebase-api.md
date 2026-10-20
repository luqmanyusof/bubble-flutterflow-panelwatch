# PanelWatch — Firebase Data & API Reference

*Everything you need to know about the database behind PanelWatch. You don't set anything up in
Firebase — the trainer runs the project. Your apps only read from it.*

**Firebase** is Google's app platform. PanelWatch uses two parts of it:
- **Cloud Firestore** — a cloud database that stores data as **documents** grouped into
  **collections**, readable over the internet.
- **Cloud Functions** — code that runs inside Firebase. PanelWatch has one: the **simulator**, which
  plays the part of three electrical panels.

| | |
|---|---|
| **Project ID** | `panelwatch-class` |
| **Shared by** | the whole class — everyone sees the same three panels and readings |
| **Writes** | only the simulator (and the trainer, from the Firebase console) |
| **Reads** | Bubble admin (REST API), FlutterFlow (built-in Firebase connection) |
| **Security** | **no sign-in** — anyone who knows the project ID can read it, so the rules refuse bulk reads and deletes (section 4.4). Open until the end of 23 Oct 2026. Simulated data only — never real names, phone numbers or company data |

---

## 1. The simulator

While the trainer has it switched on, the simulator writes **one reading for each panel every 30
seconds**. Like a smart device (an "edge device"), it also applies the rules in section 3 — so every
reading arrives with its power, status and a health summary already worked out.

| Panel | Name | Location |
|---|---|---|
| `PNL-01` | Main Panel Level 1 | Factory A, Shah Alam |
| `PNL-02` | CNC Machine Panel | Factory A, Shah Alam |
| `PNL-03` | Office Panel | Block B, Shah Alam |

Now and then a panel has a random **event** — `overheating`, `voltage-drop`, `current-spike` or
`high-vibration` — and its status turns **Warning** or **Critical**. The trainer can also send one for
a demo; it happens within 30 seconds, and the whole class sees it.

---

## 2. Collections and fields

Your apps use two collections: `devices` and `readings`.

### 2.1 `devices` — one document per panel
**Document ID = the panel code** (e.g. `devices/PNL-01`).

| Field | Type | Example |
|---|---|---|
| `code` | string | `PNL-01` |
| `name` | string | `Main Panel Level 1` |
| `location` | string | `Factory A, Shah Alam` |
| `max_temperature` | number | `45` (°C) |
| `max_humidity` | number | `85` (%RH) |
| `min_voltage` | number | `207` (V) |
| `max_voltage` | number | `253` (V) |
| `max_current` | number | `20` (A) |
| `max_vibration` | number | `4.5` (mm/s) |
| `latest_temperature`, `latest_humidity`, `latest_voltage`, `latest_current`, `latest_vibration`, `latest_power` | number | `31.2` … — updated every reading |
| `last_reading_at` | timestamp | `2026-10-18T06:05:33.000Z` |
| `last_reading_text` | string | `18/10 14:05:33` (Malaysia time — easy to display) |
| `status` | string | `Normal` · `Warning` · `Critical` |
| `summary` | string | `Status: Normal. Last 10 readings: average temperature 30.4 °C, highest 31.6 °C (limit 45). Power now 1856 W. No action needed.` |
| `recent_temperatures` | array of numbers | the last 10 temperatures — used for the summary |

The six `max_…` / `min_…` fields are the panel's **limits**. The simulator sets them; only the
trainer changes them.

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

### 2.3 Also in the database — not used by your apps
The simulator also keeps `alerts`, `commands` (events the trainer sends) and `config` (its on/off
switch). You don't need them in this course.

---

## 3. The rules (applied by the simulator)

| Rule | Logic |
|---|---|
| Power | `power = voltage × current` |
| Out of limits | any of: `temperature > max_temperature`, `humidity > max_humidity`, `voltage < min_voltage`, `voltage > max_voltage`, `current > max_current`, `vibration > max_vibration` |
| Status | **Critical** if `temperature ≥ 60` or `vibration ≥ 7.1`; else **Warning** if out of limits; else **Normal** |
| Summary | from the last 10 readings: average and highest temperature, current power, and an action (Critical → *Shut down the load and inspect now.*; Warning → *Check ventilation and connections.*; Normal → *No action needed.*) |

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
    "out_of_limits":   { "booleanValue": false },
    "time":            { "timestampValue": "2026-10-18T06:05:33.000Z" }
  }
}
```

| Firestore type | JSON wrapper |
|---|---|
| string | `stringValue` |
| number | `doubleValue` — PanelWatch always stores numbers as doubles |
| boolean | `booleanValue` |
| timestamp | `timestampValue` |
| array | `arrayValue` → `values` → a list of wrapped values |

### 4.2 The calls

| # | What | Method & path (after the base URL) | Body |
|---|---|---|---|
| 1 | List the panels | `GET /devices` | — |
| 2 | Get one panel | `GET /devices/PNL-01` | — |
| 3 | Last 20 readings of a panel | `POST :runQuery` | below |

`:runQuery` has **no slash** before it: `…/documents:runQuery`. It's a POST because you **send** the
search; it still only reads.

**Body — last 20 readings of one panel**
```json
{ "structuredQuery": {
    "from": [ { "collectionId": "readings" } ],
    "where": { "fieldFilter": { "field": { "fieldPath": "device_code" }, "op": "EQUAL", "value": { "stringValue": "PNL-01" } } },
    "orderBy": [ { "field": { "fieldPath": "time" }, "direction": "DESCENDING" } ],
    "limit": 20
} }
```

### 4.3 What comes back
- **GET a list** (`/devices`) returns `{ "documents": [ { "name": "…", "fields": { … } }, … ] }`.
- **GET one** returns one document: `{ "name": "projects/…/documents/devices/PNL-01", "fields": { … } }`.
- **runQuery** returns a **list**, one item per document:
  `[ { "document": { "name": "…", "fields": { … } }, "readTime": "…" }, … ]`.
  If nothing matches (e.g. a panel code that doesn't exist), the list has **one item with only
  `readTime`** and no `document` — filter it out.

### 4.4 Rules worth remembering
- **Searches are capped.** A search for more than **50** documents — or with no `limit` — returns
  **`PERMISSION_DENIED`**. So does any delete. It stops anyone downloading the whole history.
- **Sorted searches need an index.** The readings search filters on one field and sorts on another;
  the trainer created that index. Any new combination fails with **`FAILED_PRECONDITION: The query
  requires an index`**.
- **Numbers are doubles.** Read them from `doubleValue`.

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
- **Everything is shared.** Everyone reads the same three panels — when one turns **Critical**, every
  app in the room shows it.
- **Refresh sensibly in Bubble:** every 60 seconds at most on the dashboard, a **Refresh** button
  elsewhere. Every fetch costs one read per document returned.
- **Close what you're not using.** Every open copy of your app reads on its own — a Bubble Preview tab
  on its 60-second timer, a FlutterFlow Test Mode tab, the app on your phone. Keep one live copy open.
- If calls fail with **429 / RESOURCE_EXHAUSTED**, tell the trainer.
