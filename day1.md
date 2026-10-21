# Day 1 — Bubble.io: the PanelWatch Admin System

> **Understand it by hand, then let the AI build it:** this morning you learn Bubble's building blocks
> and its API Connector in a small practice app. Then Bubble AI builds the PanelWatch admin system on
> top of the course's Firebase database, and you check its work.

**Use case for the whole course:** **PanelWatch** monitors three electrical panels — `PNL-01`,
`PNL-02` and `PNL-03`. Every 30 seconds a simulator inside **Firebase** writes five readings for each
panel — `temperature`, `humidity`, `voltage`, `current` and `vibration` — and works out power, status
and a health summary. The whole class shares the same data.

Today you build the **admin system** in **Bubble.io**: a dashboard of the panels and a page per panel
with its summary, readings history and an **Enable / Disable** switch. It works on a desktop and on a
phone browser. Tomorrow you build the supervisors' **mobile app** in FlutterFlow on the same data: the
**client** that shows only what the admin has enabled.

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
   │  3 panels, rules, status                          devices · readings │
   └─────────────────────────────────────────────────────────────────────┘
            ▲ REST API (reads + enable)                ▲ built-in connection (live)
   Bubble admin system (today)                FlutterFlow mobile app (Day 2)
   desktop + phone browser                    Android APK · iPhone/laptop web app
```

An **IoT** (Internet of Things) system has four layers:

| Layer | In a real factory | In PanelWatch |
|---|---|---|
| **Device** | A sensor board (e.g. ESP32 + SHT31 + PZEM-004T) that also applies simple rules | The **simulator** in Firebase — 3 panels; it calculates power, status and a summary |
| **Data** | A cloud database and its API | **Firebase Firestore** — see `firebase-api.md` |
| **Admin** | Web pages for engineers: devices and their readings | **Bubble.io** — today |
| **Supervisor app** | A phone app on the factory floor | **FlutterFlow** — Day 2 |

**Why these tools?**

| | **Bubble.io** | **FlutterFlow** |
|---|---|---|
| Best at | Web pages full of logic and forms | Polished mobile screens |
| How it reaches the data | **API Connector** — calls Firestore's REST API | **Built-in Firebase connection** — live lists |
| Built-in AI (the only AI we use) | AI app generator + **Bubble Agent** (500 credits a month on Free) | **Generate with Designer** — screens and components from a prompt |

An **API** (Application Programming Interface) is a door another program can use. A **REST API** uses
web addresses and the HTTP (Hypertext Transfer Protocol) methods **GET** (read), **POST** (send
something — in PanelWatch, a search) and **PATCH** (change part of a record — in PanelWatch, a panel's
`enabled` switch).

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
Bubble adds the built-in fields `Creator`, `Modified Date`, `Created Date` and `Slug` itself.

![The Task data type](images/day1/2-2-data-type.png)

### 2.3 — A page, an input and a workflow
1. **Design →** on `index`, drag in an **Input** (name it `Input Title`) and a **Button** **Add**.
2. Click the button → **Add workflow** → **Data (Things) → Create a new thing** → type `Task`,
   `title = Input Title's value`.
3. Second action: **Element actions → Reset relevant inputs** — it clears the box, so you can see the
   click worked (without it, people click again and add duplicates).
4. Click the event *When Button Add is clicked* → **Only when** `Input Title's value is not empty` — no
   blank tasks.

> **One workflow, two steps.** Add step 2 with the **+** under step 1. Pressing **Add workflow** again
> makes a *second* workflow on the same button — both run on every click.

![The Add button's workflow (here the input is named tbx_title and the button btn_add)](images/day1/2-3-add-workflow.png)

### 2.4 — A repeating group (a list)
1. Drag in a **Repeating group**: Type of content **Task**, Data source **Do a search for → Task** (it
   then reads *Search for Tasks*),
   **Container layout** **Row** (so each cell's items sit side by side).
2. In the first cell, a **Checkbox** and, to its right, a **Text** showing `Current cell's Task's title`.
3. Select the Checkbox → **Interaction** → **Add workflow** (*Checkbox … is clicked*) → **Data (Things)
   → Make changes to a thing** → Thing to change `Current cell's Task` → **Fields**: `done = This
   Checkbox is checked`.

![The repeating group of Tasks](images/day1/2-4-repeating-group.png)

![The checkbox workflow](images/day1/2-4-checkbox-workflow.png)

### 2.5 — A conditional
Select the cell's Text → **Conditional** tab → **+** → **When** `Current cell's Task's done is yes` →
**Change another property** → **Font color** grey.

![The grey conditional](images/day1/2-5-conditional.png)

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
2. **The collection** (one per API): **+ New** creates one with a draft call inside. Rename it with
   the **⋯** next to it → **Rename** → `Weather`. The **▸** before **COLLECTION: …** at the top shows
   **Authentication** — leave it **None or self-handled**.
3. **The call** — use that draft *API Call* (don't add a second one), top to bottom: click the name next to **API Call:** → `Current`;
   **Method** *GET*; paste the URL into the box next to it; **RESPONSE → Use as** *Data*, **Data type**
   *JSON*.

```text
https://api.open-meteo.com/v1/forecast?latitude=3.14&longitude=101.69&current=temperature_2m,relative_humidity_2m
```

4. Click **Initialize** (at the bottom). Bubble shows the response fields — `current temperature_2m`,
   `current relative_humidity_2m`. Click **Save**.

   ![The weather call, initialized](images/day1/3-weather-call.png)
5. A page of its own: **Design** → the page dropdown (top left, showing `index`) → **Add a new page**
   → name `weather`, **Clone from** blank → **Create**.
6. On `weather`, add a **Group**. Its **Visual** tab → **Type of content** `Weather - Current`, **Data
   source** **Get data from an external API → Weather - Current**. Set this first — until the group has
   a type, *Parent group's…* isn't offered inside it.

   ![The weather group's type and data source (this call was named Weather - Current, so the source reads Weather - Weather - Current)](images/day1/3-weather-group.png)
7. Inside the group, a **Text** → **Visual** tab → click at the end of the text in its content box,
   type `Kuala Lumpur: `, click **Insert dynamic data** → **Parent group's Weather - Current → current
   temperature_2m**, then type ` °C`.

**Try it**
1. **Preview** the `weather` page (`…/version-test/weather`) — the live Kuala Lumpur temperature
   appears.

   ![The weather page in Preview](images/day1/3-weather-preview.png)
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

1. Read **`firebase-api.md`** sections 1–3: the three panels, the two collections you use (`devices`
   and `readings`), every field, and the rules.
2. The trainer shows the **Firebase console** on the projector — documents appearing every 30 seconds.
3. Open the list of panels in your browser — a plain **GET**:

```text
https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/devices
```

4. Reload after 30 seconds — the `latest_…` values have changed.

![The devices list in the browser](images/day1/4-devices-json.png)

Notice how every value is wrapped with its type — `"stringValue"`, `"doubleValue"`,
`"booleanValue"`, `"timestampValue"`. Bubble shows those names in its expressions.

**Checkpoint ✅** You can name the two collections you use, and say which program writes each one.

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

**Goal:** a new Bubble app, its layout generated by AI, and three calls to Firestore set up by hand —
the bridge everything else is built on. (A fourth, the one that writes, comes in 7.3.)

### 5.1 — The base layout with Bubble AI
1. Bubble dashboard → **Create new project** → **Web app** → **Create with AI** → **Get started**.

   ![Create a new project](images/day1/5-1-create-project.png)
2. On **What will you build?**, paste **Prompt 1** (below) into *Describe your app idea* → **Enter**.
   Ignore the suggestion chips. If asked for a name, `panelwatch-admin-<yourname>`.

   ![What will you build?](images/day1/5-1-what-will-you-build.png)
   *(Generating an app uses no AI credits.)*
3. Bubble AI shows a **Plan** first — **Features** and **Scenarios**. Check both: two pages, nothing
   else — no log-in, sign-up, payments, charts or data. Remove anything extra by typing in *Refine
   your app idea*. You don't need to answer its "refine anything?" question.

   ![The Plan for the base layout](images/day1/5-1-plan.png)
4. Click **Generate** (top right). It takes **10–15 minutes** — read 5.3 while you wait. The top bar
   comes out as a **reusable element**, so styling it once changes both pages.

**Where each prompt goes:** Prompt 1 on this planning screen only. After generation the editor opens:
Prompts 2–5 go in the **Agent** tab of the right-hand pane (next to *Properties*), **one at a time** —
paste, wait until the Agent says it's done, check, do the by-hand steps, then the next prompt.

> **AI credits:** the Agent has 500 a month on Free, and Prompts 2–5 used about 270 in the trainer's
> dry run. Don't re-send a prompt to "try again" — fix small things by hand. Prompt 5 has a by-hand
> alternative if you run low.

**Prompt 1 — Base layout** (Bubble AI app generator)
```text
Build the base layout of an admin web app called "PanelWatch Admin" for engineers who monitor three
electrical panels in a factory (PNL-01, PNL-02, PNL-03). It must work on a desktop and on a phone.

Two pages. Each has the same top bar - the app name on the left and a "Dashboard" link (to index)
on the right - and below it an empty main area with only a page title:
1. "index" - title "Panel overview"
2. "device" - title "Panel details"

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
| *"the same top bar … a "Dashboard" link (to index)"* | One navigation on both pages. A link only needs its destination page — no workflow |
| *"index" / "device"* | **Exact page names**, because every later prompt uses them. `index` is Bubble's home page — the dashboard belongs there |
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
2. Check: **Styles** tab → three colour variables `Normal`, `Warning`, `Critical`; both pages still have
   only their top bar and title.

   ![The Agent's style changes](images/day1/5-2-style-result.png)

**Prompt 2 — Style** (Agent)
```text
Apply one style to both pages: a dark blue top bar with white text, a light grey page
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
2. **The collection** (one per API): the left list already has *New Collection*. Its **⋯** →
   **Rename** → `Firestore`. The **▸** before **COLLECTION: …** at the top shows **Authentication** —
   leave it **None or self-handled**. No shared headers are needed.

   ![Rename a collection from its menu](images/day1/5-3-collection-menu.png)
3. **The calls:** *New Collection* already holds one draft call, *API Call* — it becomes call 1. For
   each further call, click **+** next to `Firestore` in the left list. Then, top to bottom:
   - **API Call:** click the name → type the call name from the table below.
   - **Method** dropdown (GET or POST) and the **URL** box next to it — paste the URL.
   - Leave **Attempt to make the call from the browser** unticked.
   - The POST call (`Readings`): **Body type** *JSON*, then paste the body into **Body**.
   - **Parameters:** Bubble adds a row under **URL parameters** for each `[code]` in the URL, and under
     **Body parameters** for each `<code>` in the body — **Key**, **Value**, **Private**, **Allow
     blank**. Type the test **Value** and **untick Private** (ticked, the page can't set it — every
     panel page would show the test panel). **An empty test value initializes the wrong shape** — e.g.
     `Readings` with no `code` finds nothing and Bubble learns only `readTime`.
   - **RESPONSE → Use as** *Data*, **Data type** *JSON*.
   - **Initialize** (at the bottom) — Bubble calls the API once and learns the fields. After any change
     the button turns red: **Re-initialize**.

   ![The collection settings and the Readings call](images/day1/5-3-readings-call.png)

| # | Call name | Use as | Method | URL | Parameters (test values) |
|---|---|---|---|---|---|
| 1 | `List devices` | Data | GET | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/devices` | — |
| 2 | `Get device` | Data | GET | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/devices/[code]` | `code` = `PNL-01` |
| 3 | `Readings` | Data | POST | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents:runQuery` | `code` = `PNL-01` |


**Body** for call 3 — the last 20 readings of one panel:
```json
{ "structuredQuery": {
    "from": [ { "collectionId": "readings" } ],
    "where": { "fieldFilter": { "field": { "fieldPath": "device_code" }, "op": "EQUAL", "value": { "stringValue": "<code>" } } },
    "orderBy": [ { "field": { "fieldPath": "time" }, "direction": "DESCENDING" } ],
    "limit": 20
} }
```

4. **Initialize** all three. Each one only **reads**. The admin's only write — switching a panel on or
   off — comes in 7.3.

| Piece | Meaning |
|---|---|
| `[code]` in the URL | A parameter inside the address |
| `<code>` in the body | A parameter inside the JSON body |
| `:runQuery` | Firestore's search: filter, sort, limit |

**Try it**
1. **Initialize** `List devices` → three documents, each with `fields code stringValue`,
   `fields status stringValue`, …
2. **Break it on purpose:** in `Readings`, set the test value of `code` to `PNL-99` and initialize →
   **one result with only `readTime`** — Firestore's way of saying "nothing found". You'll filter it
   out in Topic 7.2. Put `PNL-01` back.
3. **Break it on purpose:** in `Readings`, change the sort field `"time"` to `"humidity"` and
   initialize → **`FAILED_PRECONDITION: The query requires an index`**. Sorted searches need an index,
   and the trainer created only the ones PanelWatch uses. Put it back.

**Checkpoint ✅** `List devices`, `Get device` and `Readings` return real Firebase data.

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
2. **Check — and fix by hand if needed** (select each element; its settings open on the right):

| ✔ | Must be there |
|---|---|
| ☐ | The repeating group (e.g. *Devices panel grid*) → **Visual** → **Type of content** `List devices documents`, **Data source** `Firestore - List devices's documents` |
| ☐ | Each text shows a field from the cell, e.g. `Parent group's List devices documents's fields's latest_temperature's doubleValue :formatted as 1,028.6` — the canvas shows placeholders like *1,200*; real values appear only in **Preview** |
| ☐ | Status badge colour by **Conditional**: `… status stringValue is Critical` → Critical colour; `is Warning` → Warning colour; else Normal |
| ☐ | Layout: repeating group **Configure → Scroll direction** *wrap* (↩), **Min. column width** `300` — 3 per row at 1440 px, 1 per row at 390 px |
| ☐ | **Workflow** (left sidebar): no workflows on `index` — the Agent only built elements |

3. **Preview** (▷ top right): three cards with real values.

![The dashboard in Preview](images/day1/6-dashboard-preview.png)

### 6.1 — Keep it fresh (by hand)
API data in Bubble doesn't refresh by itself — and the **Refresh** button does nothing yet: the Agent
built it without a workflow. The trick: a page counter `tick`, sent to Firestore as an extra header.
When `tick` changes, Bubble sees a "new" request and fetches again. Firestore ignores the header.

1. **The counter** — a custom state on the page itself:
   1. Open the `index` page in the editor. In the left sidebar, click the **pencil** icon (**Design**).
      The **Builder** panel opens, with the **Elements Tree** at its top.
   2. In the Elements Tree, click the top line, **index** (the page, above *Layers*). The right-hand
      **Properties** panel now says **index**.
   3. At the top right of that panel, next to **⋯**, click the **Custom States** icon (four small
      squares).
   4. **+ New** → Type **number** → Name `tick`. The default value is already `0`. Close the box.

   ![Select the page, then its Custom States icon](images/day1/6-1-select-page.png)

   ![Custom States on the index page](images/day1/6-1-custom-state.png)

   > Clicking the page in the canvas usually selects a group instead. Use the Elements Tree.

2. **The header:** **API Connector** (**{ }**) → `Firestore` → **List devices** → **Add header** → Key
   `X-Refresh`, Value `0`, untick **Private** → **Re-initialize** (it turns red after any change).

   ![The X-Refresh header](images/day1/6-1-x-refresh-header.png)

3. **Feed it to the grid:**
   1. Back in **Design**, select the repeating group → **Visual** → **Data source**.
   2. Click the words `Firestore - List devices` (orange) to open the call's window. **Don't** click
      `'s documents` at the end — that offers to replace it.
   3. In the window, click **inside** the empty **(header) X-Refresh** box. Only then does a blue
      **⚡ Add** button appear, just left of the box. Click it.
   4. A list opens. Type `index` and choose **index** (it's under *Elements*). Then choose `'s tick`.
      The box reads `index's tick`.
   5. Close the window with **×**. The data source must still read `Firestore - List devices's
      documents`.

   ![Click inside the header box, then the blue Add](images/day1/6-1-header-add.png)

   ![X-Refresh fed from index's tick](images/day1/6-1-grid-x-refresh.png)

4. **The Refresh button:** select it → **Interaction** → **Add workflow** → search `Set state` → **Set
   state of an element** → Element `index` → **Custom States**: `tick` = `index's tick + 1`.

   ![The Refresh button's Set state action](images/day1/6-1-refresh-set-state.png)

5. **The timer:** **Workflow** (left sidebar) → **+ New** → search `every` → **Do every 5 seconds** →
   **Interval (seconds)** `60` → **+** under the event → the same **Set state** as step 4.

   ![Do every 60 seconds](images/day1/6-1-timer.png)

> **Building `index's tick + 1`:** click the value → type `index` → pick **index** → **'s tick** → **+**
> → type `1` → press **Enter**, then click a heading in the panel to close the list. Clicking inside
> the list instead adds a stray operator (e.g. `+ 1 *`) — click it and choose **(Clear selection)**.

> **Reads cost:** every fetch reads each document it returns, and the whole class shares the project's
> allowance. Every 60 seconds on the dashboard is plenty for an admin; elsewhere, use a **Refresh**
> button.

**Try it**
1. **Preview**: note *Last reading*, wait 30 seconds, press **Refresh** — the time and values change.
2. **Responsive** (top of the editor) at 1440 and 390 px — the cards rearrange.

**Checkpoint ✅** A fresh, responsive dashboard of the three panels.

---

## Topic 7 — The device page: summary, readings history and the switch

**Goal:** click a card → the panel's health summary, its last 20 readings, and a switch that decides
whether the mobile app may show the panel. Two features by prompt, one prompt each — check the first
before the second — then the switch by hand.

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
| *"a group whose type is "Firestore - Get device" … code = Get code from page URL"* | One group fetches the panel **once**; everything inside reads it as *Parent group's…* — the pattern from Topic 3 |
| *"the summary (stringValue) in a highlighted card"* | The simulator already writes the summary — Bubble only shows it |
| *"a "Back to dashboard" link"* | A link, not a button — navigation without a workflow |

1. Paste **Prompt 4** into the **Agent**.
2. **Check:**

| ✔ | Must be there |
|---|---|
| ☐ | A group of type **Firestore - Get device**, data source **Get data from an external API → Firestore - Get device**, `code = Get code from page URL` |
| ☐ | Code, name, status badge, six latest values and **`summary stringValue`** shown from that group |

3. **Link the dashboard to this page (by hand).** After Prompt 4 the cards **don't click yet**: the
   Agent built elements only, so nothing tells a card where to go.
   1. Open the `index` page. In the **Elements Tree**, expand the repeating group and select the
      **card**: the group that holds the code, name and values (the Agent may call it *Device card*).
      Clicking the card in the canvas picks a text inside it instead.
   2. **Interaction** → **Add workflow** (*This element is clicked*) → **Navigation** → **Go to page …**.
   3. **Destination** → `device`.
   4. **Parameters** → **+** → Key `code`. Click inside **Value** → the blue **⚡ Add** → **Current cell's
      List devices documents** → `'s fields` → `'s code` → `'s stringValue`.
   5. **Preview** → click a card. The address ends in `device?code=PNL-0…` and the panel's details show.

   ![The card's Go to page workflow with the code parameter](images/day1/7-1-card-go-to-page.png)
4. **Refresh (by hand):** select the **Refresh** button → **Interaction** → **Add workflow** →
   **Navigation** → **Refresh the page**. Reloading fetches the panel again — and, after 7.2, its
   readings. Simpler than 6.1's `tick`, and fine here: this page has no timer, and a reload is what a
   person pressing Refresh expects.

### 7.2 — Readings history (a table)

The panel's last 20 readings, newest first, as a table. **Two ways to build it — pick one:**
- **With the Agent (Prompt 5)** if you have **100 or more AI credits** left (the count is at the
  bottom of the Agent pane). The trainer's dry run had 231 of 500 left after Prompts 2–5.
- **By hand** if you're low on credits. It's the repeating group from Topic 2.4, with API data.

**A. With the Agent — Prompt 5**
```text
On the page "device", below the "Health summary" card, add a "Readings history" table: a header
row, then a repeating group of "Firestore - Readings" with code = Get code from page URL, filtered
so only items whose document name is not empty are shown. Five columns: Time (time_text
stringValue), Temperature °C, Voltage V, Current A and Power W (each a doubleValue).

Build the elements only - no workflows, custom states, popups or recurring events.
```
**Why it's written this way**

| Part of the prompt | Why |
|---|---|
| *"a header row, then a repeating group"* | A table is just a list with a heading row. Naming both stops the Agent guessing |
| *"only items whose document name is not empty"* | When nothing matches, `:runQuery` returns one empty item with only `readTime` (`firebase-api.md` 4.3). This hides it |
| *"Five columns"* | Five fit a 390 px phone without sideways scrolling. Humidity and vibration are already in the tiles above |
| No chart, no colours, no extra areas | A small prompt costs fewer credits and leaves less for the Agent to get wrong |

Paste **Prompt 5** into the **Agent**, then **Check:**

| ✔ | Must be there |
|---|---|
| ☐ | The repeating group: **Type of content** `Readings`, **Data source** `Firestore - Readings:filtered` |
| ☐ | Inside the data source: `(body) code` = `Get code from page URL`; the filter = `This Readings's document's name is not empty` |
| ☐ | Each cell shows `… Readings's document's fields's time_text's stringValue`, `… temperature's doubleValue`, and so on |

**B. By hand — no credits**
1. On the `device` page, drag a **Repeating group** (Containers) onto the page, below the *Health
   summary* card.
2. **Visual** → **Type of content** `Readings`.
3. **Data source** → **Get data from an external API** → **API provider** `Firestore - Readings` →
   **(body) code**: click inside the box → **⚡ Add** → **Get data from page URL** → Parameter name
   `code`, Type *text* (press **Tab** so it's saved).
4. **The filter:** click **Add** at the end of the data source → **:filtered** → **Constraints** **+** →
   **Advanced…** → `This Readings's document's name is not empty`. The data source now reads
   `Firestore - Readings:filtered`.

   ![The data source: code from the page URL, filtered](images/day1/7-2-readings-source.png)
5. **Configure:** **Columns** *Fixed number* `1`; **Rows** *Fit to content*.
6. **One row:** drag a **Text** into the first cell. Its **Text** → **Insert dynamic data** →
   `Current cell's Readings` → `'s document` → `'s fields` → `'s time_text` → `'s stringValue`. Type
   two spaces, then insert `… temperature's doubleValue` and type ` °C`. Do the same for voltage
   (` V`), current (` A`) and power (` W`). Every row repeats this text with its own reading.
7. **Heading:** a **Text** above the repeating group: `Time · Temperature · Voltage · Current · Power`.

> The simulator already rounds every value to one decimal place, so no number formatting is needed.

**Refresh:** the **Refresh** button from 7.1 reloads the page, so it fetches the readings again too.
No timer here: the readings search is the most expensive call.

![The readings history in Preview — this one from a longer, earlier prompt, with seven columns and
a red out-of-limits row (an *Extra*); yours has five](images/day1/7-2-readings-preview.png)

**Try it**
1. Open `PNL-01` from the dashboard: 20 rows, the newest at the top.
2. Wait 30 seconds and press **Refresh**: a new row at the top, and the latest values change.
3. Open `PNL-02`: different readings — the same table, fed by the page URL's `code`.

**Checkpoint ✅** The device page shows the summary and the last 20 readings, for whichever panel you
open.

### 7.3 — Enable or disable a panel (by hand)

The admin decides which panels the mobile app may show. Each panel has one field for this, `enabled`
(yes / no). Bubble writes it; tomorrow's FlutterFlow app reads it and hides a disabled panel's
readings. The simulator keeps writing readings either way, so the admin still sees everything.

> **Shared switch.** The whole class has the same three panels. When you disable one, every phone in
> the room hides it. Switch it back on when you've finished testing.

1. **The call:** **API Connector** (**{ }**) → **+** next to `Firestore` → name it `Set enabled`, then:

| # | Call name | Use as | Method | URL | Parameters (test values) |
|---|---|---|---|---|---|
| 4 | `Set enabled` | **Action** | PATCH | `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/devices/[code]?updateMask.fieldPaths=enabled` | `code` = `PNL-03`, `enabled` = `true` |

   **Body type** is already *JSON*. Paste the **Body**:
```json
{ "fields": { "enabled": { "booleanValue": <enabled> } } }
```
   - Untick **Private** on both parameters, as in 5.3.
   - The test value must be `true`: **Initialize** really sends the call, and `true` leaves the panel on.
   - **Use as** *Action* (under **RESPONSE**), then **Initialize**. Bubble shows the whole panel, with
     `enabled` among its fields.

   ![The Set enabled call](images/day1/7-3-set-enabled-call.png)

| Part of the call | Why |
|---|---|
| **PATCH** | Changes part of a record. GET reads; POST sends the readings search |
| **Use as: Action** | It *does* something, so it's used in a workflow — not as a data source (Topic 3) |
| `?updateMask.fieldPaths=enabled` | Only `enabled` changes. Without it, PATCH replaces the **whole panel** with this one field — the rules refuse that |
| `<enabled>` with **no quotes** | `true` and `false` are JSON yes/no values. In quotes they'd be text, and the rules refuse text |

   > `List devices` and `Get device` learned their fields before `enabled` existed? **Re-initialize**
   > them, so `enabled` appears in their lists too.

2. **The button:** on the `device` page, in the **Elements Tree** select the **Refresh** button next to
   the panel's header → **Ctrl+C**, **Ctrl+V**. A copy appears beside it.
   - **Visual** → **Text** `Disable panel`.
   - **Conditional** → **+ Add a conditional** → **When**: type the name of the panel group (the group
     of type *Firestore - Get device* — the Agent may call it *Firestore device panel*), choose it →
     `'s Get device` → `'s fields` → `'s enabled` → `'s booleanValue` → **is no**. **Then** → **Text**
     `Enable panel`.

   The button sits in a header group with no type, so *Parent group's…* doesn't reach the panel.
   Choose the panel group by name instead.

3. **The workflow:** button → **Interaction** → **Add workflow** → search `Set enabled` →
   **Firestore - Set enabled**. Its window opens with the **test values already filled in** — replace
   both:
   - **code:** click in the box, press **Backspace** until it's empty → the blue **⚡ Add** → **Get data
     from page URL** → Parameter name `code`, Type *text*. (Press **Tab** after typing the name, or it
     isn't saved.)
   - **enabled:** empty it the same way → **⚡ Add** → the panel group → `'s Get device` → `'s fields` →
     `'s enabled` → `'s booleanValue` → **is no** → **:formatted as…** → **Value if yes** `true`,
     **Value if no** `false`.

   ![The action's code and enabled](images/day1/7-3-set-enabled-action.png)

   - **Step 2:** **Workflow** (left sidebar) → the button's *… is clicked* workflow → **+** under
     Step 1 → **Refresh the page**.

   ![Set enabled, then Refresh the page](images/day1/7-3-workflow.png)

| Part of the workflow | Why |
|---|---|
| `… enabled's booleanValue is no` | **Flips** the switch: an enabled panel (yes) sends *no*, a disabled one sends *yes* |
| `:formatted as…` `true` / `false` | Bubble writes yes/no values as the words *yes* and *no*. JSON needs `true` and `false` |
| **Refresh the page** | Fetches the panel again, so the button shows its new label |

**Try it**
1. **Preview** `PNL-03` from the dashboard → **Disable panel**. The page reloads and the button says
   **Enable panel**.

   ![PNL-03 disabled](images/day1/7-3-preview-disabled.png)
2. Open
   `https://firestore.googleapis.com/v1/projects/panelwatch-class/databases/(default)/documents/devices/PNL-03`
   in the browser: `"enabled": { "booleanValue": false }`. The panel's readings still arrive every 30
   seconds.
3. Press **Enable panel** to switch it back on.

**Checkpoint ✅** One button turns a panel off and on, and Firebase shows the change.

---

## Topic 8 — Publish the admin (what the Free plan allows)

**Goal:** your admin running from a link on your phone and on a classmate's — and knowing what a
paid plan would add.

Every Bubble app has two versions:

| | **Development version** | **Live version** |
|---|---|---|
| Address | `https://<your-app>.bubbleapps.io/version-test/` | `https://<your-app>.bubbleapps.io/` (or your own domain) |
| On the Free plan | ✅ Opens for **anyone with the link** — no Bubble account needed | ❌ Shows *"This is the live version of a Bubble app!"* — the plan doesn't include it |
| What it's for | Building and testing. It changes the moment you edit | What users get. It changes only when you **deploy** |

So on Free, the development version **is** your published app. Once you've shared the link, every
edit shows up for everyone who has it — edit with care.

![The live address on the Free plan](images/day1/8-live-not-supported.png)

### 8.1 — Your app's link
1. **Preview** (▷, top right) opens the development version. Copy the address up to and including
   `version-test/` — e.g. `https://panelwatch-admin-aisyah.bubbleapps.io/version-test/`.
2. Open it in a **private / incognito** window: the dashboard loads without signing in to Bubble.
   That's what anyone you send it to will see.

### 8.2 — On your phone
1. Send yourself the link and open it on your phone: one card per row, as you set up in Topic 6.
2. **Add it to your home screen** — Android (Chrome): **⋮** → **Add to Home screen**. iPhone (Safari):
   **Share** → **Add to Home Screen**. It opens from an icon, like an app.
3. Tap a card, then **Disable panel** / **Enable panel** on `PNL-03` — the admin works from the phone
   too.

### 8.3 — Share it with a classmate
Swap links with your neighbour and open theirs: the same three panels, a different design — built
from the same prompts.

> **Anyone with the link can use your admin** — including **Disable panel**. On Free you can't lock it:
> password protection needs a paid plan (8.4). Don't post the link publicly.

### 8.4 — What the Free plan can't do
**Settings** (⚙ in the left sidebar) shows your plan and what each feature needs.

![The Free plan: development version only, 50K workload units](images/day1/8-free-plan.png)

| Feature | Where in Bubble | Plan |
|---|---|---|
| **Deploy to live** (the address without `version-test`) | **Upgrade to deploy** (top right) | Starter — $39 a month, 2-week free trial |
| **Password protection** for the whole app | Settings → **General** | Starter |
| Title, description and picture for **shared links**; SEO settings | Settings → **SEO and metatags** | Starter |
| **Your own domain** (e.g. `admin.yourcompany.com`) | Settings → **Domain and email** | Starter |
| More **workload units** (server work: every API call uses some) | Settings → **My plan** | Free 50,000 a month; Starter 175,000 |
| An app in the **App Store / Play Store** | Settings → **Native mobile** | Free to build, paid to publish |

![Upgrade to deploy](images/day1/8-upgrade-to-deploy.png)

- Pages marked *"Test this feature for free, then upgrade to deploy"* let you set a feature up now; it
  reaches the live version only after you upgrade and deploy.
- **Deploying** copies the development version to live. After that you keep editing in development,
  and users see your changes only when you deploy again.
- **Workload** isn't a worry for this course: a full Day 1 dry run used **26** of the 50,000 units.

### 8.5 — How deploying works (once you're on a paid plan)
From Bubble's manual — you can't try this on Free, so read it as the next step:
1. Build and test in the development version — Bubble now calls it the **Main** branch (still
   `version-test`).
2. Deploy **Main** to **Live**: open the version-control panel at the top of the editor (where
   **Upgrade to deploy** is now) and deploy. Write a short description of what changed — it's your
   release note.
3. Bubble saves an automatic **savepoint** at every deploy, so you can go back to it later.
4. Live gets the pages and workflows. Bubble's **own database** is separate for development and
   live, and deploying doesn't copy data. PanelWatch keeps its data in **Firebase**, so both
   versions show the same panels.
5. Keep editing in Main. Users see the changes only when you deploy again.

Sources: Bubble manual — [Version control](https://manual.bubble.io/help-guides/maintaining-an-application/version-control),
[Deployment & version control (legacy)](https://manual.bubble.io/core-resources/bubbles-interface/version-control-deployment/legacy).

**Checkpoint ✅** Your admin opens from a link on your phone, and you can say what a paid plan would add.

---

## Topic 9 — Self-practice: the Country app (on your own)

**Goal:** build a small app **without step-by-step notes**, reusing what you did today. Use your
practice app `practice-bubble-<yourname>` — not the PanelWatch admin.

**What you build**
- **Page `countries`** — a list of 3 or more countries (name, capital, currency).
- **Page `country`** — opens when you click a country. It shows the currency, **today's rate from
  MYR** (e.g. *1 MYR = 38.77 JPY*) and the **weather in its capital** now.

### 9.1 — The two APIs (free, no key, no sign-up)

| Call | Use as | URL | Test value | Field you need |
|---|---|---|---|---|
| `Rate` | Data | `https://hexarate.paikama.co/api/rates/latest/MYR?target=[currency]` | `currency` = `JPY` | `data mid` — 1 MYR in that currency |
| `CityWeather` | Data | `https://api.open-meteo.com/v1/forecast?latitude=[lat]&longitude=[lon]&current=temperature_2m,relative_humidity_2m` | `lat` = `35.69`, `lon` = `139.69` | `current temperature_2m`, `current relative_humidity_2m` |

Open the first URL in your browser with `JPY` in place of `[currency]` to see what comes back:

```json
{"status_code":200,"data":{"base":"MYR","target":"JPY","mid":38.7751,"unit":1,"timestamp":"…"}}
```

### 9.2 — The countries

| name | capital | currency | lat | lon |
|---|---|---|---|---|
| Japan | Tokyo | `JPY` | 35.69 | 139.69 |
| Singapore | Singapore | `SGD` | 1.29 | 103.85 |
| Thailand | Bangkok | `THB` | 13.75 | 100.50 |
| United Kingdom | London | `GBP` | 51.51 | -0.13 |

Want another? Its currency code is the 3-letter ISO code (`IDR`, `USD`, `AUD`…). Get its capital's
`lat`/`lon` from `https://geocoding-api.open-meteo.com/v1/search?name=Jakarta&count=1`.

### 9.3 — How to build it (the plan, not the clicks)
1. **The data** — a data type `Country` with the five fields above (text, text, text, number,
   number), then add the countries in **Data → App data → New entry**. *(Topic 2.2)*
2. **The calls** — a new API Connector collection with the two calls above, each with
   parameters in `[ ]`. *(Topic 3 for the call, Topic 5.3 for `[parameters]`)*
3. **The list page** — a repeating group of `Country`, data source *Do a search for Country*, one row
   per country. *(Topic 2.4)*
4. **The click** — the cell → **Go to page** `country`. *(Topic 7.1)* Either send the country itself
   (**Data to send** → *Current cell's Country*, with the `country` page's **Type of content**
   `Country`), or send parameters as in 7.1.
5. **The country page** — two groups, one per call, each with **Type of content** = that call and
   **Data source** = *Get data from an external API*, the parameters filled from the page's country
   (e.g. `currency` = *Current page's Country's currency*). Texts inside read *Parent group's …*.
   *(Topic 3 step 6, Topic 7.1)*
6. **Phone width** — check it at **390** in **Responsive**. *(Topic 2.6)*

### 9.4 — Tips
- **Untick Private** on every parameter, or the page can't set it — the classic *"why is it always
  Tokyo?"* bug. *(Topic 5.3)*
- **Initialize** after any change to a call; until then it shows red.
- **Set the group's Type of content first** — until then *Parent group's…* isn't offered.
- **Round the rate:** `… data mid :formatted as` → 4 decimals. `0.313038` reads better as `0.3130`.
- **Wrong currency code = error.** `XXX` or `jpy` in lower case returns an error, not a rate — type
  codes in capitals.
- **The rate is the mid-market rate**, updated through the day — not what a bank or money changer
  gives you.
- **Negative numbers are fine:** London's longitude is `-0.13`.
- Stuck on an expression? Look at how you did the same thing in the PanelWatch admin — it's the same
  pattern with different names.

**Stretch**
- *100 MYR = …* — multiply the rate in the expression (`… data mid * 100`).
- A flag: add a text field with the flag emoji (🇯🇵) and show it in the list.
- Colour the temperature red when it's above 30 °C (a **Conditional**, Topic 2.5).
- A **Back** button on the `country` page → **Go to page** `countries`.

**Checkpoint ✅** Click any country → its currency, today's rate from MYR and its capital's weather,
all from APIs, built by you without step-by-step notes.

---

## End of Day 1 — what you should have
- A practice app `practice-bubble-<yourname>` built by hand: data type, workflow, list, conditional,
  responsive row, and an **API Connector** call to a weather API.
- `panelwatch-admin-<yourname>`, built in stages — base layout by Bubble AI, style and each feature
  by the Agent, every workflow by hand — with a **Firestore** API (4 calls: 3 reads, 1 write) and two
  pages: a responsive **dashboard** and a **device page** (summary, readings history, Enable / Disable)
  — published as the development version, on your phone's home screen.
- *(Self-practice)* The **Country app** in your practice app: a list, a page per country, and two
  APIs with parameters — rate and weather.

**Security recap**
- The Firebase project has **no sign-in**: anyone with the project ID can call it. Its rules allow
  only what the course does (`firebase-api.md` 4.4), it holds only simulated data, and we never put
  real names, phone numbers or company data in it.
- The one write the rules allow is a panel's `enabled`, as `true` or `false` — nothing else on a panel
  can change. Without sign-in, the rules can't tell **who** sent it: anyone with the project ID could
  flip the switch. A real system adds sign-in, so only admins can.

**Extra, if you finish early**
- On the dashboard, fade disabled panels: select the **card** → **Conditional** → **When** `Current
  cell's … fields's enabled's booleanValue is no` → **Opacity** `40`.
- Ask the Agent for a **limits** card on the device page — the six `max_…`/`min_…` values, read-only.
- Readings table: colour a row light red **When** `Current cell's Readings's document's fields's
  out_of_limits's booleanValue is yes` (a **Conditional**, as in Topic 2.5).
- A temperature **chart** from a free chart plugin, fed by the same readings
  (`:sorted by … time_unix` ascending).

**Tomorrow (Day 2):** the supervisors' mobile app in FlutterFlow — designed mostly with AI, on the same
Firebase data, with fresh readings each time a page opens.
