# Day 1 — Bubble.io: the PanelWatch Admin System

> **Understand it by hand, then let the AI build it:** this morning you learn Bubble's building blocks
> and its API Connector in a small practice app. Then Bubble AI builds the PanelWatch admin system on
> top of the course's Firebase database, and you check its work.

**Use case for the whole course:** **PanelWatch** monitors three electrical panels — `PNL-01`,
`PNL-02` and `PNL-03`. Every 30 seconds a simulator inside **Firebase** writes five readings for each
panel — `temperature`, `humidity`, `voltage`, `current` and `vibration` — and works out power, status,
alerts and a health summary. The whole class shares the same data.

Today you build the **admin system** in **Bubble.io**: a dashboard of the panels, a page per panel
with its readings, chart and limits, and an alerts page. It works on a desktop and on a phone browser.
Tomorrow you build the supervisors' **mobile app** in FlutterFlow on the same data.

## Before you start
- [ ] You can sign in to **bubble.io** — the **Free** plan is all you need.
- [ ] You have this repo open, especially **`firebase-api.md`**.
- [ ] The Firebase **project ID** is `panelwatch-class` — already filled in to every link below.
- [ ] **No outside AI tools** — no ChatGPT, Claude or Gemini. Only the AI built into Bubble and
      FlutterFlow.

---

# Part A — Basics (practice app, by hand)

## Topic 1 — How PanelWatch fits together (concept)

**Goal:** see the whole system before building any part of it.

```
                         Firebase (run by the trainer)
   ┌─────────────────────────────────────────────────────────────────────┐
   │  Simulator (Cloud Function)  ──writes every 30 s──►  Firestore database │
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
1. On **bubble.io**, click **Create new project** → **Web app** → **Create a blank app** → **Get
   started** → name it `practice-bubble-<yourname>`. Skip any tour.
2. The editor's tabs, down the left side:

| Tab | What lives there |
|---|---|
| **Design** | Pages and elements (text, inputs, buttons, repeating groups) |
| **Workflow** | Logic: *When* something happens → *do* these actions |
| **Data** | Bubble's own database: data types, option sets, privacy rules |
| **Styles** | Reusable looks |
| **Plugins** | Add-ons — including the **API Connector** (Topic 3) |
| **Settings** | App-wide settings |

Click any element and its settings open on the right, in three tabs: **Visual** (content, data,
look), **Interaction** (workflows, visibility) and **Conditional** (changes when something is true).

You build in the **Development** version (at `…/version-test`). That's all we need.

### 2.2 — A data type
**Data → Data types → New type** `Task`, with fields `title` (text) and `done` (yes/no). On `done`, set
**Default value** to **no** — without it, new tasks have an empty `done`.
Bubble adds `Created Date`, `Modified Date`, `Created By` and a unique ID itself.

### 2.3 — A page, an input and a workflow
1. **Design →** on `index`, drag in an **Input** (name it `Input Title`) and a **Button** **Add**.
2. Click the button → **Add workflow** → **Data (Things) → Create a new thing** → type `Task`,
   `title = Input Title's value`.
3. Second action: **Element actions → Reset relevant inputs** — it clears the box, so you can see the
   click worked (without it, people click again and add duplicates).
4. Click the event *When Button Add is clicked* → **Only when** `Input Title's value is not empty` — no
   blank tasks.

### 2.4 — A repeating group (a list)
1. Drag in a **Repeating group**: Type of content **Task**, Data source `Do a search for Tasks`,
   **Container layout** **Row** (so each cell's items sit side by side).
2. In the first cell, a **Checkbox** and, to its right, a **Text** showing `Current cell's Task's title`.
3. Checkbox workflow: *When* it changes → **Make changes to a thing** → `Current cell's Task`,
   `done = This Checkbox is checked`.

### 2.5 — A conditional
Select the cell's Text → **Conditional** tab → *When* `Current cell's Task's done is yes` → **Font
color** grey.

### 2.6 — Responsive layout (desktop *and* phone)
- A **Group** set to **Column** stacks children vertically; **Row** puts them side by side.
- **Min width / Max width** stop things getting too narrow or too wide.

1. Put the input and button in a Group set to **Row**; give the page a **Max width** of `800`, centred.
2. Click **Responsive** (top of the editor) and drag the width down to **390** (a phone).
3. **Break it on purpose:** give the input a fixed width of `600` px → at 390 the page scrolls
   sideways. Change it to **min width 150, max width ∞** → it shrinks to fit.

**Try it** — **Preview**: add three tasks, tick one; it turns grey. Resize the browser — the layout
holds. **Data → App data → All Tasks** shows exactly what you added. Blank or duplicate rows mean
step 2.3's condition or reset is missing; delete them there.

**Checkpoint ✅** By hand: a data type, a workflow, a list, a conditional and a responsive row.

---

## Topic 3 — The API Connector, by hand (practice app)

**Goal:** make Bubble read data from another system — exactly how PanelWatch will read Firebase.

1. Open **API Connector** — the **{ }** icon in the left sidebar.
2. **The collection** (one per API): click **+ New** if the list is empty, then the **▸** before
   **COLLECTION: …** at the top → name `Weather`, Authentication **None or self-handled**.
3. **The call** — its draft *API Call*, top to bottom: click the name next to **API Call:** → `Current`;
   **Method** *GET*; paste the URL into the box next to it; **RESPONSE → Use as** *Data*, **Data type**
   *JSON*.

```text
https://api.open-meteo.com/v1/forecast?latitude=3.14&longitude=101.69&current=temperature_2m,relative_humidity_2m
```

4. Click **Initialize** (at the bottom). Bubble shows the response fields — `current temperature_2m`,
   `current relative_humidity_2m`. Click **Save**.
5. A page of its own: **Design** → the page dropdown (top left, showing `index`) → **Add a new page**
   → name `weather`, **Clone from** blank → **Create**.
6. On `weather`, add a **Group**. Its **Visual** tab → **Type of content** `Weather - Current`, **Data
   source** **Get data from an external API → Weather - Current**. Set this first — until the group has
   a type, *Parent group's…* isn't offered inside it.
7. Inside the group, a **Text** → **Visual** tab → click at the end of the text in its content box,
   type `Kuala Lumpur: `, click **Insert dynamic data** → **Parent group's Weather - Current → current
   temperature_2m**, then type ` °C`.

**Try it**
1. **Preview** the `weather` page (`…/version-test/weather`) — the live Kuala Lumpur temperature
   appears.
2. **Break it on purpose:** change `latitude=3.14` to `latitude=abc` and click **Initialize** —
   the API answers with an error (*400 Bad Request*). Bad input is rejected by the other system. Put it
   back.

| Piece | Meaning |
|---|---|
| **Use as: Data** | The call *reads* something you show on a page |
| **Use as: Action** | The call *does* something — used in workflows |
| **Initialize** | Bubble calls once to learn the shape of the response |

**Checkpoint ✅** A Bubble page shows data that lives in another system.

---

## Topic 4 — PanelWatch's data and API (concept)

**Goal:** know what's in the Firebase database before connecting to it.

1. Read **`firebase-api.md`** sections 1–3: the three panels, the collections (`devices`, `readings`,
   `alerts`, `commands`), every field, and the rules.
2. The trainer shows the **Firebase console** on the projector — documents appearing every 30 seconds.
3. Open the list of panels in your browser — a plain **GET**:

```text
https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/devices
```

4. Reload after 30 seconds — the `latest_…` values have changed.

Notice how every value is wrapped with its type — `"stringValue"`, `"doubleValue"`,
`"booleanValue"`, `"timestampValue"`. Bubble shows those names in its expressions.

**Checkpoint ✅** You can name the four collections and say which program writes each one.

---

# Part B — The PanelWatch admin, built with Bubble AI

**How the prompts work.** The admin is built in **stages, one prompt each**: base layout → style → one
feature at a time. The AI builds what you **see**; after each prompt you check it and build what it
**does** (the workflows) by hand — so everyone's app works the same way, even when the AI's layouts
differ. Every prompt is in the notes where you use it, with a table explaining why it's written that
way. Copy it as it is first; if you change it, note what and why — on Day 2 you present one prompt and
what the AI got wrong. Four rules behind every prompt:
- Say **what the data is called** and where it comes from — the AI can't see Firebase.
- Say **what not to build** (log-in, sample data, extra pages).
- Ask for **one thing at a time**, check it, then ask for the next.
- The AI's version is a first draft. You check it against the notes' checklist.

## Topic 5 — Create the admin app and connect it to Firebase

**Goal:** a new Bubble app, its layout generated by AI, and seven calls to Firestore set up by hand —
the bridge everything else is built on.

### 5.1 — The base layout with Bubble AI
1. Bubble dashboard → **Create new project** → **Web app** → **Create with AI** → **Get started**.
2. On **What will you build?**, paste **Prompt 1** (below) into *Describe your app idea* → **Enter**.
   Ignore the suggestion chips. If asked for a name, `panelwatch-admin-<yourname>`.
   *(Generating an app uses no AI credits.)*
3. Bubble AI shows a **Plan** first — **Features** and **Scenarios**. Check both: three pages, nothing
   else — no log-in, sign-up, payments, charts or data. Remove anything extra by typing in *Refine
   your app idea*. You don't need to answer its "refine anything?" question.
4. Click **Generate** (top right). It takes **10–15 minutes** — read 5.3 while you wait. The top bar
   comes out as a **reusable element**, so styling it once changes all three pages.

**Where each prompt goes:** Prompt 1 on this planning screen only. After generation the editor opens:
Prompts 2–8 go in the **Agent** tab of the right-hand pane (next to *Properties*), **one at a time** —
paste, wait until the Agent says it's done, check, do the by-hand steps, then the next prompt.

**Prompt 1 — Base layout** (Bubble AI app generator)
```text
Build the base layout of an admin web app called "PanelWatch Admin" for engineers who monitor three
electrical panels in a factory (PNL-01, PNL-02, PNL-03). It must work on a desktop and on a phone.

Three pages. Each has the same top bar - the app name on the left, and links "Dashboard" (to index)
and "Alerts" (to alerts) on the right - and below it an empty main area with only a page title:
1. "index" - title "Panel overview"
2. "device" - title "Panel details"
3. "alerts" - title "Open alerts"

Layout only. Do not create workflows, custom states, popups, recurring events, data types or sample
data, and no log-in or sign-up pages. I will add the style, the content, the data and the logic
myself, one step at a time.
```
**Why it's written this way** — the app is built in stages: **base layout → style → one feature at a
time**. This prompt is only the first stage.

| Part of the prompt | Why |
|---|---|
| *"an admin web app … for engineers who monitor three electrical panels in a factory"* | Says **who** uses it and **what for**, so the AI's wording fits an engineers' tool — even for a bare layout |
| *"It must work on a desktop and on a phone"* | Without this, generators often build a fixed desktop page. Fixing that later is harder than asking now |
| *"the same top bar … links "Dashboard" (to index) and "Alerts" (to alerts)"* | One navigation on every page. A link only needs its destination page — no workflow |
| *"index" / "device" / "alerts"* | **Exact page names**, because every later prompt uses them. `index` is Bubble's home page — the dashboard belongs there |
| *"an empty main area with only a page title"* | Everyone in the room gets the **same nearly empty pages**. Each feature is added later by its own prompt, so your app keeps matching the notes |
| *"Layout only. Do not create workflows, custom states, popups, recurring events"* | Left alone, the generator **guesses the logic** — loading popups, timers, error handlers — differently for every person, and it clashes with the logic you build by hand |
| *"data types or sample data"* | The AI can't see Firebase. Its own database and fake rows would get mixed up with the real data |
| *"no log-in or sign-up pages"* | Generators add sign-in by default. PanelWatch has none |
| *"I will add … myself, one step at a time"* | Tells the AI the plan, so it keeps this step small |

> **Catch the AI** — open each page and **Workflow**:
> - Each page should have only the top bar and its title. Delete anything else it added.
> - **Workflow** tab: delete **every** workflow on every page, and any popup in the Elements Tree. A
>   loading popup the AI added never closes — there's no data yet.
> - **Data** tab: if it created data types (e.g. `Device`), leave them; nothing will use them.

### 5.2 — Style with the Agent
1. Open the **Agent** (right side of the editor) and paste **Prompt 2**. *(The Agent uses AI credits —
   500 a month on Free; this prompt took about 30. The count is at the bottom of the Agent pane.)*
2. Check: **Styles** tab → three colour variables `Normal`, `Warning`, `Critical`; every page still has
   only its top bar and title.

**Prompt 2 — Style** (Agent)
```text
Apply one style to all three pages: a dark blue top bar with white text, a light grey page
background, and for content, white cards with rounded corners and a light shadow.
Create three colour variables for statuses: "Normal" green, "Warning" amber, "Critical" red.
Change styles and colours only - do not add, move or remove elements, and do not add workflows.
```
**Why it's written this way**

| Part of the prompt | Why |
|---|---|
| A prompt just for style | Looks are one stage, content is another. You can see exactly what this prompt changed |
| *"dark blue top bar … light grey … white cards with rounded corners"* | Concrete colours and shapes. "Make it nice" gives a different result every time |
| *"three colour variables … "Normal" green, "Warning" amber, "Critical" red"* | Named once, reused by every later prompt. The names are the **exact status words** the simulator writes (`firebase-api.md` 3) |
| *"Change styles and colours only - do not add, move or remove elements"* | Keeps the step small and checkable; the layout from 5.1 stays the same for everyone |

### 5.3 — The Firestore API, by hand
The Agent must not guess API details, so you set this up yourself.
1. Open **API Connector** (the **{ }** icon) — each app has its own, so the practice app's calls aren't
   here.
2. **The collection** (one per API): the left list already has *New Collection*. Click the **▸** before
   **COLLECTION: New Collection** at the top to open its settings → name `Firestore`, Authentication
   **None or self-handled**, shared header `Content-Type` = `application/json`.
3. **The calls:** *New Collection* already holds one draft call, *API Call* — it becomes call 1. For
   each further call, click **+** next to `Firestore` in the left list. Then, top to bottom:
   - **API Call:** click the name → type the call name from the table below.
   - **Method** dropdown (GET, POST, PATCH) and the **URL** box next to it — paste the URL.
   - Leave **Attempt to make the call from the browser** unticked.
   - POST and PATCH calls: **Body type** *JSON*, then paste the body into **Body**.
   - **Parameters:** Bubble adds one for each `[code]` in the URL, and one under **Body parameters**
     for each `<code>` in the body. Type its test **Value** and untick **Private** (the pages set
     them). **An empty test value initializes the wrong shape** — e.g. `Readings` with no `code` finds
     nothing and Bubble learns only `readTime`.
   - **RESPONSE → Use as** *Data* or *Action* (table below), **Data type** *JSON*.
   - **Initialize** (at the bottom) — Bubble calls the API once and learns the fields.

| # | Call name | Use as | Method | URL | Parameters (test values) |
|---|---|---|---|---|---|
| 1 | `List devices` | Data | GET | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/devices` | — |
| 2 | `Get device` | Data | GET | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/devices/[code]` | `code` = `PNL-01` |
| 3 | `Readings` | Data | POST | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents:runQuery` | `code` = `PNL-01` |
| 4 | `Open alerts` | Data | POST | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents:runQuery` | — |
| 5 | `Resolve alert` | **Action** | PATCH | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/alerts/[id]?updateMask.fieldPaths=resolved&updateMask.fieldPaths=acknowledged_by` | `id`, `name` — initialized in Topic 8 |
| 6 | `Update limits` | **Action** | PATCH | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/devices/[code]?updateMask.fieldPaths=max_temperature&updateMask.fieldPaths=max_humidity&updateMask.fieldPaths=min_voltage&updateMask.fieldPaths=max_voltage&updateMask.fieldPaths=max_current&updateMask.fieldPaths=max_vibration` | `code` + six limits — initialized in Topic 7.3 |
| 7 | `Send test event` | **Action** | POST | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/commands` | `code` = `PNL-03`, `event` = `voltage-drop`, `name` = your name |

**Bodies** for the POST and PATCH calls:

**Call 3 — `Readings`** — the last 20 readings of one panel
```json
{ "structuredQuery": {
    "from": [ { "collectionId": "readings" } ],
    "where": { "fieldFilter": { "field": { "fieldPath": "device_code" }, "op": "EQUAL", "value": { "stringValue": "<code>" } } },
    "orderBy": [ { "field": { "fieldPath": "time" }, "direction": "DESCENDING" } ],
    "limit": 20
} }
```

**Call 4 — `Open alerts`** — open alerts, newest first
```json
{ "structuredQuery": {
    "from": [ { "collectionId": "alerts" } ],
    "where": { "fieldFilter": { "field": { "fieldPath": "resolved" }, "op": "EQUAL", "value": { "booleanValue": false } } },
    "orderBy": [ { "field": { "fieldPath": "time" }, "direction": "DESCENDING" } ],
    "limit": 30
} }
```

**Call 5 — `Resolve alert`**
```json
{ "fields": { "resolved": { "booleanValue": true }, "acknowledged_by": { "stringValue": "<name>" } } }
```

**Call 6 — `Update limits`** — numbers go **without** quotes
```json
{ "fields": {
  "max_temperature": { "doubleValue": <max_temperature> }, "max_humidity": { "doubleValue": <max_humidity> },
  "min_voltage": { "doubleValue": <min_voltage> },         "max_voltage": { "doubleValue": <max_voltage> },
  "max_current": { "doubleValue": <max_current> },         "max_vibration": { "doubleValue": <max_vibration> }
} }
```

**Call 7 — `Send test event`**
```json
{ "fields": {
    "device_code":  { "stringValue": "<code>" },
    "event":        { "stringValue": "<event>" },
    "done":         { "booleanValue": false },
    "requested_by": { "stringValue": "<name>" }
} }
```

4. **Initialize** calls 1–4 now; leave 5 and 6 until Topics 8 and 7.3, when you have real values.
5. Initialize call 7, `Send test event`, once — it really sends one, so `PNL-03` turns amber at its
   next reading.

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

**Prompt 3 — Dashboard** (Agent)
```text
On the page "index", under the title, build the panel grid.

Use a repeating group whose data source is "Get data from an external API" -> "Firestore - List
devices"'s documents. Do not use a Bubble data type.

Each cell is a card showing, from Current cell's fields:
- code (stringValue) in bold and name (stringValue) below it
- a status badge from status (stringValue), coloured with the Normal, Warning or Critical colour
- latest_temperature °C, latest_humidity %, latest_voltage V, latest_current A,
  latest_vibration mm/s and latest_power W (each a doubleValue, 1 decimal place)
- "Last reading: " followed by last_reading_text (stringValue), in small grey text

Layout: the repeating group is a Row that wraps; each card has a minimum width of 300 px and a
maximum width of 420 px, so a desktop shows 3 cards per row and a phone shows 1.
Add a "Refresh" button at the top right of the grid.

Build the elements only - no workflows, custom states, popups or recurring events.
```
**Why it's written this way**

| Part of the prompt | Why |
|---|---|
| *"On the page "index", under the title"* | Names the page and the place, so the Agent adds to your base layout instead of starting a new page |
| *"Get data from an external API" -> "Firestore - List devices"'s documents"* | Bubble's exact wording for the data source, and the call name you created in 5.3. The Agent can't guess API names |
| *"Do not use a Bubble data type"* | Otherwise the Agent may create a `Device` type and bind the grid to it — an empty list |
| *"code (stringValue)", "latest_temperature … doubleValue"* | Each field **with its type wrapper**, exactly as Bubble lists them after **Initialize** (Topic 4). The Agent finds the right field first time |
| *"coloured with the Normal, Warning or Critical colour"* | Uses the colour variables from Prompt 2, so every page shows status the same way |
| *"1 decimal place"* | Readable numbers: `31.2`, not `31.2000001` |
| *"min 300 px, max 420 px, so a desktop shows 3 … a phone shows 1"* | Gives the numbers **and** the result you expect — you can check the Agent's work against it |
| *"Add a "Refresh" button"* | API data in Bubble doesn't update by itself. You wire the refresh by hand in 6.1 |
| *"Build the elements only - no workflows …"* | The same last line in every Agent prompt. The Agent builds what you see; you build what it **does**, the same way as everyone else |

1. Paste **Prompt 3** into the **Agent**.
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
4. In **API Connector → Firestore → List devices**, **Add header** `X-Refresh` = `<tick>` (untick Private),
   re-initialize, and on the repeating group's data source set `tick = page's tick`.

When `tick` changes, Bubble sees a "new" request and fetches again. Firestore ignores the extra header.

> **Reads cost:** every fetch reads each document it returns, and the whole class shares the project's
> allowance. Every 60 seconds on the dashboard is plenty for an admin; elsewhere, use a **Refresh**
> button.

**Try it**
1. **Responsive** at 1440 and 390 px — the cards rearrange.
2. Leave **Preview** open: the values change every minute (or press **Refresh**). When an event
   happens, a card turns amber or red.

**Checkpoint ✅** A fresh, responsive dashboard of the three panels.

---

## Topic 7 — The device page: readings, chart, summary, limits and test events

**Goal:** click a card → the panel's last 20 readings, a chart, its health summary, its limits, and a
button that sends a test event. Four features, one prompt each — check each one before the next.

### 7.1 — The panel and its summary

**Prompt 4 — Panel header and summary** (Agent)
```text
On the page "device", under the title, show one panel. The panel code comes from the page URL
parameter "code" (for example device?code=PNL-01). Do not use a Bubble data type.

Add a group whose type is "Firestore - Get device" and data source is "Get data from an external
API" -> "Firestore - Get device" with code = Get code from page URL. Inside it, from the group's
fields: code and name as the header, a status badge coloured with the Normal, Warning or Critical
colour, the six latest values with units (1 decimal place), and the summary (stringValue) in a
highlighted card titled "Health summary". Add a "Refresh" button next to the header and a
"Back to dashboard" link.

Build the elements only - no workflows, custom states, popups or recurring events.
```
**Why it's written this way**

| Part of the prompt | Why |
|---|---|
| *"the page URL parameter "code" (for example device?code=PNL-01)"* | One page serves all three panels. The example shows the exact address the dashboard will open |
| *"a group whose type is "Firestore - Get device" … code = Get code from page URL"* | One group fetches the panel **once**; everything inside reads it as *Parent group's…* — the pattern from Topic 3. Prompts 6 and 7 add to this group |
| *"the summary (stringValue) in a highlighted card"* | The simulator already writes the summary — Bubble only shows it |
| *"a "Back to dashboard" link"* | A link, not a button — navigation without a workflow |

1. Paste **Prompt 4** into the **Agent**.
2. **Check:**

| ✔ | Must be there |
|---|---|
| ☐ | A group of type **Firestore - Get device**, data source **Get data from an external API → Firestore - Get device**, `code = Get code from page URL` |
| ☐ | Code, name, status badge, six latest values and **`summary stringValue`** shown from that group |

3. **Link the dashboard to this page (by hand):** on the dashboard card → **Go to page → device**, *Send
   more parameters to the page*: `code = Current cell's … fields code stringValue`.
4. **Refresh (by hand):** add the `X-Refresh` header to `Get device` and a `tick` state, as in 6.1 —
   the **Refresh** button sets `tick`. No timer here.

### 7.2 — Readings and the chart

**Prompt 5 — Readings** (Agent)
```text
On the page "device", below the "Health summary" card, add a "Readings" section:
1. An area titled "Temperature trend", 300 px high, with space for a chart I will add.
2. Below it, a repeating group of "Firestore - Readings" with code = Get code from page URL,
   filtered so only items whose document name is not empty are shown. Columns: time_text,
   temperature, humidity, voltage, current, vibration, power. A row's background is light red when
   out_of_limits (booleanValue) is yes.
On a phone, make the table scroll sideways instead of shrinking.

Build the elements only - no workflows, custom states, popups or recurring events.
```
**Why it's written this way**

| Part of the prompt | Why |
|---|---|
| *"only items whose document name is not empty"* | When nothing matches, `:runQuery` returns one empty item with only `readTime` (`firebase-api.md` 4.3). This hides it |
| *"light red when out_of_limits (booleanValue) is yes"* | Uses a field the simulator already works out — Bubble doesn't repeat the rules |
| *"with space for a chart I will add"* | The chart is set up by hand (step 3), so the Agent only keeps the space |
| *"scroll sideways instead of shrinking"* | Seven columns can't fit a 390 px phone; squeezed, they're unreadable |

1. Paste **Prompt 5** into the **Agent**.
2. **Check:**

| ✔ | Must be there |
|---|---|
| ☐ | A repeating group of **Firestore - Readings** (`code = Get code from page URL`), `:filtered` to remove the empty result (`… document name is not empty`), showing `time_text`, the five readings and power; red rows *When* `… out_of_limits booleanValue is yes` |
| ☐ | The **Refresh** button also refreshes the readings: `X-Refresh` header on `Readings` too — no timer: the readings list is the most expensive call |

3. **The chart (by hand):** in *Temperature trend*, a **chart** (the free chart plugin the trainer
   names) of `temperature doubleValue` from the same list, `:sorted by … time_unix doubleValue`
   ascending so time runs left to right.

### 7.3 — The limits form

**Prompt 6 — Limits form** (Agent)
```text
On the page "device", inside the panel group, below the readings, add a "Limits" section: six
decimal inputs labelled Max temperature (°C), Max humidity (%), Min voltage (V), Max voltage (V),
Max current (A) and Max vibration (mm/s), each starting with the group's current value
(max_temperature doubleValue, max_humidity doubleValue and so on), and a "Save limits" button.

Build the elements only - no workflows, custom states, popups or recurring events.
```
**Why it's written this way**

| Part of the prompt | Why |
|---|---|
| *"inside the panel group"* | The inputs read the current limits as *Parent group's…* — only possible inside the group from Prompt 4 |
| *"each starting with the group's current value"* | The form shows today's limits, so **Save** without changes rewrites the same values |
| *"decimal inputs"* | Only numbers can be typed — the database rules refuse a limit sent as text |
| No workflow for **Save limits** | Writes to Firebase are the risky part (`updateMask`!). You build this one by hand, below |

1. Paste **Prompt 6** into the **Agent**. Check: six inputs (content format *decimal*), each showing its
   current limit, and a **Save limits** button.
2. **API Connector → Firestore → `Update limits`** (call 6 in 5.3) → **Initialize** with the current
   values (`PNL-01`, 45, 85, 207, 253, 20, 4.5) — this rewrites them unchanged.
3. **The workflow (by hand):** **Save limits** → **Plugins → Firestore - Update limits** with
   `code = Get code from page URL` and each input's value.

> **Shared exercise:** every app in the room reads these limits. **Don't change them on your own.** In
> class, the trainer runs the live change: one person lowers `PNL-02`'s `max_temperature` to `33` on
> the projector, everyone presses **Refresh** and watches `PNL-02` go to **Warning**, then it's set back
> to `45`.

### 7.4 — Send a test event

**Prompt 7 — Test event box** (Agent)
```text
On the page "device", below the limits, add a "Send test event" section: a dropdown "Event" with the
choices overheating, voltage-drop, current-spike and high-vibration, an input "Your name", and a
"Send test event" button.

Build the elements only - no workflows, custom states, popups or recurring events.
```
**Why it's written this way**

| Part of the prompt | Why |
|---|---|
| *"overheating, voltage-drop, current-spike and high-vibration"* | The only event names the simulator — and the database rules — accept. A dropdown means nobody can mistype one |
| *"an input "Your name""* | Saved with the event as `requested_by`, so the room can see who sent it |

1. Paste **Prompt 7** into the **Agent**. Check: the dropdown has exactly the four events.
2. **The workflow (by hand):** **Send test event** → **Plugins → Firestore - Send test event** with
   `code = Get code from page URL`, `event = Dropdown Event's value`, `name = Input Your name's value`.
   Disable the button when `Your name` is empty.

**Try it**
1. Send `overheating` to `PNL-01`. Wait 30 seconds, press **Refresh**: status **Critical**, the latest
   reading over 60 °C, and the summary says *Shut down the load and inspect now.* — on everyone's
   screen.
2. **Think it through (don't try it):** what would happen if `Update limits` had no `updateMask`?
   (Answer in `firebase-api.md` 4.4.)

**Checkpoint ✅** The device page shows readings, a chart, the summary and the limits, and a test
event changes the panel within 30 seconds.

---

## Topic 8 — The alerts page

**Goal:** engineers see open alerts and resolve them.

**Prompt 8 — Alerts page** (Agent)
```text
On the page "alerts", under the title, build a list of open alerts. Do not use a Bubble data type.

At the top: an input "Your name" and a "Refresh" button.

A repeating group of "Get data from an external API" -> "Firestore - Open alerts", filtered so only
items whose document name is not empty are shown. Each cell is a card with, from Current cell's
document fields: device_code (bold), parameter, value and limit ("62.1 / limit 45"), a level badge
coloured with the Warning or Critical colour, time_text, and a "Resolve" button.

When the filtered list is empty, show the text "No open alerts" with a check in the Normal colour
instead. Cards stack in one column on a phone and two columns on a desktop.

Build the elements only - no workflows, custom states, popups or recurring events.
```
**Why it's written this way**

| Part of the prompt | Why |
|---|---|
| *"an input "Your name""* | **Resolve** writes `acknowledged_by` — the name comes from this input |
| *"only items whose document name is not empty"* | With no open alerts, `:runQuery` returns one empty item — same filter as Prompt 5 |
| *"("62.1 / limit 45")"* | An example of the finished text is clearer than describing the format |
| *"coloured with the Warning or Critical colour"* | An alert is only ever one of these two levels — the colour variables from Prompt 2 |
| *"When the filtered list is empty, show "No open alerts""* | An empty page looks broken. An empty state says "all clear" |
| *"one column on a phone and two columns on a desktop"* | The responsive result, stated up front, so you can check it |

1. Paste **Prompt 8** into the **Agent**. Check: a repeating group of **Firestore - Open alerts**
   (filtered), cards coloured by `level stringValue`, a **Resolve** button per alert, and the
   **Your name** input and **Refresh** button at the top.
2. The **Resolve** workflow (by hand):
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
- `panelwatch-admin-<yourname>`, built in stages — base layout by Bubble AI, style and each feature
  by the Agent, every workflow by hand — with a **Firestore** API (7 calls) and three pages: a responsive **dashboard**, a **device page** (readings, chart,
  summary, limits, test events) and an **alerts page** (resolve).

**Security recap**
- The Firebase project has **no sign-in**: anyone with the project ID can call it. Its rules allow
  only what the course does (`firebase-api.md` 4.4), it holds only simulated data, and we never put
  real names, phone numbers or company data in it.
- PATCH always has an `updateMask`.

**Extra, if you finish early**
- Ask the Agent for an **open alerts count** badge on the dashboard.
- Add a **power** chart under the temperature chart.

**Tomorrow (Day 2):** the supervisors' mobile app in FlutterFlow — designed mostly with AI, on the same
Firebase data, and live without any refresh button.
