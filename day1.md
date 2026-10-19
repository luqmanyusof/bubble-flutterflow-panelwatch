# Day 1 — Bubble.io: the PanelWatch Admin System

> **Understand it by hand, then let the AI build it:** this morning you learn Bubble's building blocks
> and its API Connector in a small practice app. Then Bubble AI builds the PanelWatch admin system on
> top of the course's Firebase database, and you check its work.

**Use case for the whole course:** **PanelWatch** monitors three electrical panels — `PNL-01`,
`PNL-02` and `PNL-03`. Every 15 seconds a simulator inside **Firebase** writes five readings for each
panel — `temperature`, `humidity`, `voltage`, `current` and `vibration` — and works out power, status,
alerts and a health summary. The whole class shares the same data.

Today you build the **admin system** in **Bubble.io**: a dashboard of the panels, a page per panel
with its readings, chart and limits, and an alerts page. It works on a desktop and on a phone browser.
Tomorrow you build the supervisors' **mobile app** in FlutterFlow on the same data.

## Before you start
- [ ] You can sign in to **bubble.io** — the **Free** plan is all you need.
- [ ] You have this repo open, especially **`firebase-api.md`** and **`prompts.md`**.
- [ ] From the trainer: the **project ID** (e.g. `panelwatch-class`). Every Firebase step uses it.
- [ ] **No outside AI tools** — no ChatGPT, Claude or Gemini. Only the AI built into Bubble and
      FlutterFlow.

---

# Part A — Basics (practice app, by hand)

## Topic 1 — How PanelWatch fits together (concept)

**Goal:** see the whole system before building any part of it.

```
                         Firebase (run by the trainer)
   ┌─────────────────────────────────────────────────────────────────────┐
   │  Simulator (Cloud Function)  ──writes every 15 s──►  Firestore database │
   │  3 panels, rules, alerts                     devices · readings · alerts │
   └─────────────────────────────────────────────────────────────────────┘
            ▲ REST API (reads & writes)                ▲ built-in connection (live)
   Bubble admin system (today)                FlutterFlow mobile app (Day 2)
   desktop + phone browser                    Android APK · emulator · iPhone web app
```

An **IoT** (Internet of Things) system has four layers:

| Layer | In a real factory | In PanelWatch |
|---|---|---|
| **Device** | A sensor board (e.g. ESP32 + SHT31 + PZEM-004T) that also applies simple rules | The **simulator** in Firebase — 3 panels; it calculates power, status, alerts and a summary |
| **Data** | A cloud database and its API | **Firebase Firestore** — see `firebase-api.md` |
| **Admin** | Web pages for engineers: devices, limits, alerts | **Bubble.io** — today |
| **Supervisor app** | A phone app on the factory floor | **FlutterFlow** — Day 2 |

**Why these tools?**

| | **Bubble.io** | **FlutterFlow** |
|---|---|---|
| Best at | Web pages full of logic and forms | Polished mobile screens |
| How it reaches the data | **API Connector** — calls Firestore's REST API | **Built-in Firebase connection** — live lists |
| Built-in AI (the only AI we use) | AI app generator + **Bubble Agent** (500 credits a month on Free) | **Generate with Designer** — screens and components from a prompt |

An **API** (Application Programming Interface) is a door another program can use. A **REST API** uses
web addresses and the HTTP (Hypertext Transfer Protocol) methods **GET** (read), **POST** (send) and
**PATCH** (change part of something).

**Checkpoint ✅** Say where a reading of `temperature = 62` goes, and which two apps show it.

---

## Topic 2 — Bubble's building blocks, by hand (practice app)

**Goal:** build a tiny to-do app yourself, so you recognise every part when the AI builds PanelWatch.

### 2.1 — Create the practice app
1. On **bubble.io**, click **Create an app** → name it `practice-bubble-<yourname>` → **Web app** →
   **Start from scratch**. Skip any tour.
2. The editor's tabs, down the left side:

| Tab | What lives there |
|---|---|
| **Design** | Pages and elements (text, inputs, buttons, repeating groups) |
| **Workflow** | Logic: *When* something happens → *do* these actions |
| **Data** | Bubble's own database: data types, option sets, privacy rules |
| **Styles** | Reusable looks |
| **Plugins** | Add-ons — including the **API Connector** (Topic 3) |
| **Settings** | App-wide settings |

You build in the **Development** version (at `…/version-test`). That's all we need.

### 2.2 — A data type
**Data → Data types → New type** `Task`, with fields `title` (text) and `done` (yes/no, default *no*).
Bubble adds `Created Date`, `Modified Date`, `Created By` and a unique ID itself.

### 2.3 — A page, an input and a workflow
1. **Design →** on `index`, drag in an **Input** (name it `Input Title`) and a **Button** **Add**.
2. Click the button → **Add workflow** → **Data (Things) → Create a new thing** → type `Task`,
   `title = Input Title's value`.
3. Second action: **Element actions → Reset relevant inputs**.

### 2.4 — A repeating group (a list)
1. Drag in a **Repeating group**: Type of content **Task**, Data source `Do a search for Tasks`.
2. In the first cell, a **Text** showing `Current cell's Task's title` and a **Checkbox**.
3. Checkbox workflow: *When* it changes → **Make changes to a thing** → `Current cell's Task`,
   `done = This Checkbox is checked`.

### 2.5 — A conditional
Select the cell's Text → **Conditional** tab → *When* `Current cell's Task's done is yes` → grey,
strikethrough.

### 2.6 — Responsive layout (desktop *and* phone)
- A **Group** set to **Column** stacks children vertically; **Row** puts them side by side.
- **Min width / Max width** stop things getting too narrow or too wide.

1. Put the input and button in a Group set to **Row**; give the page a **Max width** of `800`, centred.
2. Click **Responsive** (top of the editor) and drag the width down to **390** (a phone).
3. **Break it on purpose:** give the input a fixed width of `600` px → at 390 the page scrolls
   sideways. Change it to **min width 150, max width ∞** → it shrinks to fit.

**Try it** — **Preview**: add three tasks, tick one; it turns grey. Resize the browser — the layout
holds.

**Checkpoint ✅** By hand: a data type, a workflow, a list, a conditional and a responsive row.

---

## Topic 3 — The API Connector, by hand (practice app)

**Goal:** make Bubble read data from another system — exactly how PanelWatch will read Firebase.

1. **Plugins → Add plugins →** search `API Connector` (by Bubble) → **Install**.
2. **Add another API** → API Name `Weather`, Authentication **None or self-handled**.
3. **Add another call** → name `Current`, **Use as: Data**, Data type **JSON**, method **GET**, URL:

```text
https://api.open-meteo.com/v1/forecast?latitude=3.14&longitude=101.69&current=temperature_2m,relative_humidity_2m
```

4. Click **Initialize call**. Bubble shows the response fields — `current temperature_2m`,
   `current relative_humidity_2m`. Click **Save**.
5. On `index`, add a **Group** with Type of content **Weather - Current**, Data source **Get data from
   an external API → Weather - Current**. Inside it, a Text:
   `Kuala Lumpur: [Parent group's Weather - Current's current temperature_2m] °C`.

**Try it**
1. **Preview** — the live Kuala Lumpur temperature appears.
2. **Break it on purpose:** change `latitude=3.14` to `latitude=abc` and click **Initialize call** —
   the API answers with an error (*400 Bad Request*). Bad input is rejected by the other system. Put it
   back.

| Piece | Meaning |
|---|---|
| **Use as: Data** | The call *reads* something you show on a page |
| **Use as: Action** | The call *does* something — used in workflows |
| **Initialize call** | Bubble calls once to learn the shape of the response |

**Checkpoint ✅** A Bubble page shows data that lives in another system.

---

## Topic 4 — PanelWatch's data and API (concept)

**Goal:** know what's in the Firebase database before connecting to it.

1. Read **`firebase-api.md`** sections 1–3: the three panels, the collections (`devices`, `readings`,
   `alerts`, `commands`), every field, and the rules.
2. The trainer shows the **Firebase console** on the projector — documents appearing every 15 seconds.
3. Open the list of panels in your browser — a plain **GET** (replace the project ID):

```text
https://firestore.googleapis.com/v1/projects/<PROJECT_ID>/databases/(default)/documents/devices
```

4. Reload after 15 seconds — the `latest_…` values have changed.

Notice how every value is wrapped with its type — `"stringValue"`, `"doubleValue"`,
`"booleanValue"`, `"timestampValue"`. Bubble shows those names in its expressions.

**Checkpoint ✅** You can name the four collections and say which program writes each one.

---

# Part B — The PanelWatch admin, built with Bubble AI

## Topic 5 — Create the admin app and connect it to Firebase

**Goal:** a new Bubble app, its layout generated by AI, and seven calls to Firestore set up by hand —
the bridge everything else is built on.

### 5.1 — Generate the layout with Bubble AI
1. Bubble dashboard → **Create an app** → `panelwatch-admin-<yourname>`.
2. Choose to **generate with AI** (Bubble AI) and paste **Prompt 1 — Admin layout**. *(Generating an
   app uses no AI credits.)* It builds the pages and layout.

> **Catch the AI:** the generator creates its own **data types** (e.g. `Device`, `Alert`) in Bubble's
> database. PanelWatch doesn't use them — the data lives in Firebase. Leave them; you'll point every
> page at the API calls below instead.

### 5.2 — The Firestore API, by hand
The Agent must not guess API details, so you set this up yourself.
1. **Plugins → Add plugins → API Connector → Install.**
2. **Add another API** → name `Firestore`, Authentication **None or self-handled**.
   **Shared headers:** `Content-Type` = `application/json`.
3. Add these calls. Every URL starts with
   `https://firestore.googleapis.com/v1/projects/<PROJECT_ID>/databases/(default)/documents`. Copy the
   bodies from `firebase-api.md` 4.2 and replace the example values with the Bubble parameters shown.

| Call name | Use as | Method | URL ending | Body | Parameters (test values) |
|---|---|---|---|---|---|
| `List devices` | Data | GET | `/devices` | — | — |
| `Get device` | Data | GET | `/devices/[code]` | — | `code` = `PNL-01` |
| `Readings` | Data | POST | `:runQuery` | A, with `"stringValue": "<code>"` | `code` = `PNL-01` |
| `Open alerts` | Data | POST | `:runQuery` | B | — |
| `Resolve alert` | **Action** | PATCH | `/alerts/[id]?updateMask.fieldPaths=resolved&updateMask.fieldPaths=acknowledged_by` | C, with `"stringValue": "<name>"` | `id`, `name` |
| `Update limits` | **Action** | PATCH | see Topic 7.3 | D (all six limits) | `code` + six limits |
| `Send test event` | **Action** | POST | `/commands` | E, with `<code>`, `<event>`, `<name>` | `code` = `PNL-03`, `event` = `voltage-drop`, `name` = your name |

4. **Untick Private** on every parameter (the pages set them). **Initialize call** each Data call now;
   leave `Resolve alert` and `Update limits` until Topics 7–8, when you have real values.
5. Initialize `Send test event` once — it really sends one, so `PNL-03` turns amber at its next
   reading.

| Piece | Meaning |
|---|---|
| `[code]` in the URL | A parameter inside the address |
| `<code>` in the body | A parameter inside the JSON body |
| `:runQuery` | Firestore's search: filter, sort, limit |
| `updateMask.fieldPaths=…` | "Change only these fields" — see the warning below |

> **Never** send a PATCH to Firebase without `updateMask`. Without it, Firestore **replaces the whole
> document** with only the fields you sent — resolving one alert would erase its panel, value and time,
> and the whole class shares that data.

**Try it**
1. **Initialize** `List devices` → three documents, each with `fields code stringValue`,
   `fields status stringValue`, …
2. **Initialize** `Open alerts`. If there are none, you get **one result with only `readTime`** —
   Firestore's way of saying "nothing found". You'll filter it out in Topic 8.
3. **Break it on purpose:** in `Readings`, change the sort field `"time"` to `"humidity"` and
   initialize → **`FAILED_PRECONDITION: The query requires an index`**. Sorted searches need an index,
   and the trainer created only the ones PanelWatch uses. Put it back.

**Checkpoint ✅** `List devices`, `Get device`, `Readings` and `Open alerts` return real Firebase
data, and your test event reached the simulator.

---

## Topic 6 — The dashboard, built with the Agent (desktop and phone)

**Goal:** a fresh grid of the three panels: 3 cards per row on a desktop, 1 per row on a phone.

1. Paste **Prompt 2 — Dashboard** into the **Agent** (right side of the editor).
2. **Check — and fix by hand if needed** (the Agent may not bind external API data correctly):

| ✔ | Must be there |
|---|---|
| ☐ | Repeating group: data source **Get data from an external API → Firestore - List devices**`'s documents` |
| ☐ | Texts from `Current cell's … fields`: `code stringValue`, `name stringValue`, `latest_temperature doubleValue` °C, humidity %, voltage V, current A, vibration mm/s, power W, `last_reading_text stringValue` |
| ☐ | Status badge colour by **Conditional**: `… status stringValue is Critical` → red; `is Warning` → amber; else green |
| ☐ | Layout: a **Row** that **wraps**, cards with **min width 300 / max width 420** — 3 per row at 1440 px, 1 per row at 390 px |

### 6.1 — Keep it fresh
API data in Bubble doesn't refresh by itself. Make the dashboard fetch again every **60 seconds**:
1. On the page, add a custom state `tick` (number, default 0).
2. **Workflow → General → Do every 60 seconds** → **Set state** `tick = page's tick + 1`.
3. Add a **Refresh** button that does the same **Set state**.
4. In **Plugins → Firestore → List devices**, add a header `X-Refresh` = `<tick>` (untick Private),
   re-initialize, and on the repeating group's data source set `tick = page's tick`.

When `tick` changes, Bubble sees a "new" request and fetches again. Firestore ignores the extra header.

> **Reads cost:** every fetch reads each document it returns, and the whole class shares the project's
> allowance. Every 60 seconds on the dashboard is plenty for an admin; elsewhere, use a **Refresh**
> button.

**Try it**
1. **Responsive** at 1440 and 390 px — the cards rearrange.
2. Leave **Preview** open: the values change every minute (or press **Refresh**). When an event
   happens, a card turns amber or red.

**Save to your prompt library:** Prompt 2 and anything you added to fix the Agent's version.

**Checkpoint ✅** A fresh, responsive dashboard of the three panels.

---

## Topic 7 — The device page: readings, chart, summary, limits and test events

**Goal:** click a card → the panel's last 20 readings, a chart, its health summary, its limits, and a
button that sends a test event.

### 7.1 — The page
1. Paste **Prompt 3 — Device page** into the **Agent**. It builds a page `device` that receives the
   panel code in the URL (`…/device?code=PNL-01`).
2. On the dashboard card: **Go to page → device**, *Send more parameters to the page*:
   `code = Current cell's … fields code stringValue`.

### 7.2 — Check the bindings
| ✔ | Must be there |
|---|---|
| ☐ | A group of type **Firestore - Get device**, data source **Get data from an external API → Firestore - Get device**, `code = Get code from page URL` |
| ☐ | Latest values, status and **`summary stringValue`** shown from that group |
| ☐ | A repeating group of **Firestore - Readings** (`code = Get code from page URL`), `:filtered` to remove the empty result (`… document name is not empty`), showing `time_text`, the five readings and power; red rows *When* `… out_of_limits booleanValue is yes` |
| ☐ | A **chart** (the free chart plugin the trainer names) of `temperature doubleValue` from the same list, `:sorted by … time_unix doubleValue` ascending so time runs left to right |
| ☐ | A **Refresh** button (`X-Refresh` header on `Get device` and `Readings`, as in 6.1) — no timer: the readings list is the most expensive call |

### 7.3 — The limits form (by hand)
1. **Plugins → Firestore →** finish the call `Update limits`: **PATCH**
   `/devices/[code]?updateMask.fieldPaths=max_temperature&updateMask.fieldPaths=max_humidity&updateMask.fieldPaths=min_voltage&updateMask.fieldPaths=max_voltage&updateMask.fieldPaths=max_current&updateMask.fieldPaths=max_vibration`,
   body:

```json
{ "fields": {
  "max_temperature": { "doubleValue": <max_temperature> }, "max_humidity": { "doubleValue": <max_humidity> },
  "min_voltage": { "doubleValue": <min_voltage> },         "max_voltage": { "doubleValue": <max_voltage> },
  "max_current": { "doubleValue": <max_current> },         "max_vibration": { "doubleValue": <max_vibration> }
} }
```

   Numbers go **without** quotes. Initialize with the current values (`PNL-01`, 45, 85, 207, 253, 20,
   4.5) — this rewrites them unchanged.
2. On the page, six **Inputs** (content format *decimal*) whose initial content is the current limit,
   and a button **Save limits** → **Plugins → Firestore - Update limits** with
   `code = Get code from page URL` and each input's value.

> **Shared exercise:** every app in the room reads these limits. **Don't change them on your own.** In
> class, the trainer runs the live change: one person lowers `PNL-02`'s `max_temperature` to `33` on
> the projector, everyone presses **Refresh** and watches `PNL-02` go to **Warning**, then it's set back
> to `45`.

### 7.4 — Send a test event (by hand)
1. A **Dropdown** `Event` with choices `overheating`, `voltage-drop`, `current-spike`,
   `high-vibration`, and an **Input** `Your name`.
2. A button **Send test event** → **Plugins → Firestore - Send test event** with
   `code = Get code from page URL`, `event = Dropdown Event's value`, `name = Input Your name's value`.
   Disable the button when `Your name` is empty.

**Try it**
1. Send `overheating` to `PNL-01`. Wait 15 seconds, press **Refresh**: status **Critical**, the latest
   reading over 60 °C, and the summary says *Shut down the load and inspect now.* — on everyone's
   screen.
2. **Think it through (don't try it):** what would happen if `Update limits` had no `updateMask`?
   (Answer in `firebase-api.md` 4.4.)

**Save to your prompt library:** Prompt 3 plus your fixes.

**Checkpoint ✅** The device page shows readings, a chart, the summary and the limits, and a test
event changes the panel within 15 seconds.

---

## Topic 8 — The alerts page

**Goal:** engineers see open alerts and resolve them.

1. Paste **Prompt 4 — Alerts page** into the **Agent**: a page `alerts` with a repeating group of
   **Firestore - Open alerts**, coloured by `level stringValue`, a **Resolve** button per alert, a
   **Your name** input at the top, and a **Refresh** button.
2. The **Resolve** workflow (check or build by hand):
   - **Plugins → Firestore - Resolve alert** with
     `id = Current cell's … document name:split by (/):last item`, `name = Input Your name's value`.
   - Then **Set state** `tick = tick + 1` so the list refreshes at once.
3. Now **initialize** `Resolve alert` in the API Connector with a real alert ID (copy one from the list).

**Try it**
1. Resolve one alert — it disappears, for you and for everyone else after their next refresh. Open
   `…/documents/alerts/<that ID>` in the browser: `resolved` is `true`, `acknowledged_by` is your name.
2. **Break it on purpose:** pass the *whole* `document name` as `id` (remove `:split by`) → **404 / not
   found**: the API wants just the ID at the end of the address. Put the split back.
3. Remove the `:filtered` on an empty list → one blank card. Put it back.

**Checkpoint ✅** Open alerts listed; **Resolve** closes one in Firebase.

---

## End of Day 1 — what you should have
- A practice app `practice-bubble-<yourname>` built by hand: data type, workflow, list, conditional,
  responsive row, and an **API Connector** call to a weather API.
- `panelwatch-admin-<yourname>`, laid out by Bubble AI and finished with the Agent, with a **Firestore**
  API (7 calls) and three pages: a responsive **dashboard**, a **device page** (readings, chart,
  summary, limits, test events) and an **alerts page** (resolve).

**Security recap**
- The Firebase project is in **test mode**: anyone with the project ID can read and write. That's why it
  holds only simulated data, and why we never put real names, phone numbers or company data in it.
- PATCH always has an `updateMask`.

**Extra, if you finish early**
- Ask the Agent for an **open alerts count** badge on the dashboard.
- Add a **power** chart under the temperature chart.

**Tomorrow (Day 2):** the supervisors' mobile app in FlutterFlow — designed mostly with AI, on the same
Firebase data, and live without any refresh button.
