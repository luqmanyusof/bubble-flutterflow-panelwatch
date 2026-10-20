# PanelWatch — Firebase Data & API Reference

*Everything you need to know about the database behind PanelWatch. You don't set anything up in
Firebase — the trainer runs the project. Your apps read from it; the Bubble admin also switches panels
on and off.*

**Firebase** is Google's app platform. PanelWatch uses two parts of it:
- **Cloud Firestore** — a cloud database that stores data as **documents** grouped into
  **collections**, readable over the internet.
- **Cloud Functions** — code that runs inside Firebase. PanelWatch has one: the **simulator**, which
  plays the part of three electrical panels.

| | |
|---|---|
| **Project ID** | `panelwatch-class` |
| **Shared by** | the whole class — everyone sees the same three panels and readings |
| **Writes** | the simulator; the Bubble admin, only a panel's `enabled` switch; the trainer, from the Firebase console |
| **Reads** | Bubble admin and FlutterFlow mobile — both over the REST API (section 4) |
| **Security** | **no sign-in** — anyone who knows the project ID can read it, so the rules refuse bulk reads, deletes and every change except `enabled` (section 4.4). Open until the end of 23 Oct 2026. Simulated data only — never real names, phone numbers or company data |

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
| `enabled` | boolean | `true` — the admin's switch. `false` = the client app hides this panel's readings |
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

`enabled` belongs to the admin. The simulator sets it to `true` once, for a new panel, and never
changes it after that. A disabled panel **still gets readings** — the admin sees everything; only the
client app hides them.

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
| 4 | Enable or disable a panel | `PATCH /devices/PNL-01?updateMask.fieldPaths=enabled` | below |

`:runQuery` has **no slash** before it: `…/documents:runQuery`. It's a POST because you **send** the
search; it still only reads. Call 4 is the only one that **writes**.

**Body — last 20 readings of one panel**
```json
{ "structuredQuery": {
    "from": [ { "collectionId": "readings" } ],
    "where": { "fieldFilter": { "field": { "fieldPath": "device_code" }, "op": "EQUAL", "value": { "stringValue": "PNL-01" } } },
    "orderBy": [ { "field": { "fieldPath": "time" }, "direction": "DESCENDING" } ],
    "limit": 20
} }
```

**Body — enable or disable** (`true` or `false`, without quotes)
```json
{ "fields": { "enabled": { "booleanValue": false } } }
```
`updateMask.fieldPaths=enabled` makes the PATCH change that one field. Without it, PATCH would replace
the whole panel with this body — the rules refuse that.

### 4.3 What comes back
- **GET a list** (`/devices`) returns `{ "documents": [ { "name": "…", "fields": { … } }, … ] }`.
- **GET one** returns one document: `{ "name": "projects/…/documents/devices/PNL-01", "fields": { … } }`.
- **runQuery** returns a **list**, one item per document:
  `[ { "document": { "name": "…", "fields": { … } }, "readTime": "…" }, … ]`.
  If nothing matches (e.g. a panel code that doesn't exist), the list has **one item with only
  `readTime`** and no `document` — filter it out.
- **PATCH** returns the whole panel after the change, like GET one.

### 4.4 Rules worth remembering
- **Searches are capped.** A search for more than **50** documents — or with no `limit` — returns
  **`PERMISSION_DENIED`**. So does any delete. It stops anyone downloading the whole history.
- **One change is allowed:** a panel's `enabled`, to `true` or `false`. Any other field, text instead
  of `true`/`false`, or a PATCH without `updateMask` returns **`PERMISSION_DENIED`**.
- **Sorted searches need an index.** The readings search filters on one field and sorts on another;
  the trainer created that index. Any new combination fails with **`FAILED_PRECONDITION: The query
  requires an index`**.
- **Numbers are doubles.** Read them from `doubleValue`.

---

## 5. In FlutterFlow (Day 2)
FlutterFlow uses the **same REST calls** as Bubble (section 4.2), set up under **API Calls**. Two
differences:
- Turn off **Use Proxy for Test** and **Use Proxy for Run/Test Mode** on every call (Advanced
  Settings). FlutterFlow's proxy can't reach Firestore and returns 404.
- FlutterFlow picks values out with **JSON paths**, e.g. `$.documents` (the panel list) or
  `$.fields.code.stringValue` (one panel's code). `$[:]` means "every item" of the `:runQuery` list.

The app refreshes its calls every 30 seconds, so it is not instant: a change shows up within 30
seconds, like Bubble's dashboard.

---

## 6. Sharing one database with the whole class
- **The switch is shared too.** When anyone disables a panel, every phone in the room hides its
  readings. Test with one panel, and switch it back on straight after.
- **Everything is shared.** Everyone reads the same three panels — when one turns **Critical**, every
  app in the room shows it.
- **Refresh sensibly in Bubble:** every 60 seconds at most on the dashboard, a **Refresh** button
  elsewhere. Every fetch costs one read per document returned.
- **Close what you're not using.** Every open copy of your app reads on its own — a Bubble Preview tab
  on its 60-second timer, a FlutterFlow Test Mode tab, the app on your phone. Keep one live copy open.
- If calls fail with **429 / RESOURCE_EXHAUSTED**, tell the trainer.
