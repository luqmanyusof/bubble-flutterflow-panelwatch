# Day 2 — FlutterFlow: the PanelWatch Mobile App

> **Understand it by hand, then let the AI design it:** this morning you learn FlutterFlow's building
> blocks in a small practice app. Then FlutterFlow's built-in AI designs most of the PanelWatch mobile
> app — screens, components and tests — and you connect it to the live Firebase data.
> **Carry-over:** yesterday's Bubble admin (`panelwatch-admin-<yourname>`) — you'll use its **Send test
> event** and **alerts** pages to drive today's app. The project ID from the trainer.

**Today's app:** supervisors on the factory floor see the three panels' status and latest readings,
each panel's summary and chart, and the open alerts — **live**, with no refresh button — and
acknowledge alerts from the phone.

**Your FlutterFlow plan: Basic**

| What Basic gives you | How we use it today |
|---|---|
| **50 AI generations a month** | About 10–12 today: 4 screens, 5 components, a chart section, a bottom sheet, capstone extras |
| **APK download** | Install your own app on an Android phone or in an emulator (Topics 2 and 10) |
| **Web publishing** | iPhone users run the app as a web app from the home screen |

> **AI rule for this course:** only FlutterFlow's own AI — **Generate with Designer** for screens and
> components, and **Test Pilot** for tests. FlutterFlow's *AI Agent Panel* runs on your own Claude,
> Codex or Gemini account — that's outside AI, so we don't use it.

**How much of PanelWatch Mobile the AI builds:** every screen, every component, the chart section, the
acknowledge sheet and the tests — about 60% of the build. You do the parts AI can't do well: connecting
Firebase, the data bindings and the one write back to the database.

## Before you start
- [ ] You can sign in to **flutterflow.io** on the **Basic** plan.
- [ ] Your Bubble admin from Day 1 opens in a browser tab.
- [ ] Your phone is on the internet. **Android users:** you're allowed to install an app from a file
      (some company phones block it — then use the web app route).

---

# Part A — FlutterFlow basics (practice app, by hand)

## Topic 1 — FlutterFlow's building blocks, by hand (practice app)

**Goal:** build a small two-page weather app yourself, so you recognise every part when the AI builds
PanelWatch.

### 1.1 — Create the practice project
1. FlutterFlow dashboard → **Create New** → **Create Blank** → name `Practice FF`. Skip Firebase and
   Supabase setup.
2. The editor:

| Area | What it's for |
|---|---|
| **Widget palette** (left) | Building blocks: Text, Button, Container, Column, Row, ListView… |
| **Widget tree** (left) | The structure — what is inside what |
| **Canvas** (centre) | The phone screen you're designing |
| **Properties panel** (right) | Settings, styling, **Actions**, **Backend Query** |
| **API Calls** (left navigation) | Calls to other systems |
| **Test / Run** (top right) | Run the app in the browser |

### 1.2 — Layout: the three rules
FlutterFlow builds **Flutter** apps. Flutter layout follows three rules:
1. A **parent tells its children how much space they may use**.
2. **Children choose their size** within that.
3. **The parent decides where they go**.

| Widget | Use it for |
|---|---|
| **Column** / **Row** | Stack children vertically / side by side |
| **Container** | Padding, colour, rounded corners, a fixed size |
| **Expanded** | "Take the remaining space" inside a Row or Column |
| **ListView** | A scrolling list |

Build this on the home page, by hand:
1. A **Column** containing: a **Text** `Kuala Lumpur Weather` (Title style); a **Container** (rounded
   corners, light blue) holding a **Row** with two **Text** widgets: `Temperature: -- °C` and
   `Humidity: -- %`; and a **Button** `Reload`.
2. **Break it on purpose:** change `Temperature: -- °C` to a long sentence. The Row overflows —
   yellow-and-black stripes and **RenderFlex overflowed**. Fix it: right-click the Text →
   **Wrap Widget → Expanded**. Put the text back.

### 1.3 — An API call (by hand)
1. **API Calls → + Add → Create API Call** → name `getWeather`, method **GET**, URL:

```text
https://api.open-meteo.com/v1/forecast?latitude=3.14&longitude=101.69&current=temperature_2m,relative_humidity_2m
```

2. **Response & Test → Test API Call.** Under **JSON Paths** add `$.current.temperature_2m` →
   `temperature` and `$.current.relative_humidity_2m` → `humidity`. **Save.**
3. Select the page's **Column** → **Backend Query → API Call → `getWeather`**.
4. Bind the two Texts: **Set from Variable** → `getWeather` response → JSON path `temperature` /
   `humidity`. Use **Combine Text** to add the labels (`Temperature: ` + value + ` °C`).
5. Button **Reload** → **Actions → Refresh Database Request**.

### 1.4 — State, a conditional and navigation
1. **Conditional colour:** the Container → **Fill Color → Conditional Value** → *if* `temperature > 32`
   → light orange, *else* light blue.
2. **Page state:** a page state `unit` (String, default `C`) and a small button `°F` that **Update Page
   State** → `unit = F`.
3. **Navigation:** a second page `About`. A button **About** → **Actions → Navigate To → About**; on
   `About`, a back button → **Navigate Back**.

**Try it** — **Test mode**: the real Kuala Lumpur temperature shows; the container turns orange when
it is hot; **About** opens and goes back.

**Checkpoint ✅** By hand: Column/Row/Expanded, an overflow fix, an API call, bound data, a
conditional, a page state and navigation.

---

## Topic 2 — Run your app on every device: Android, iPhone and desktop

**Goal:** get the practice app onto *your* device now, so the real app later is just a repeat.

| Route | Works on | How |
|---|---|---|
| **Test mode** | Your laptop's browser | **Test** button (top right) |
| **APK on an Android phone** | Android | Download the APK → install it on the phone |
| **APK in an emulator** | Windows laptop, via **MuMu Player** | Drag the APK onto the emulator |
| **Web app + Add to Home Screen** | **iPhone** (Safari), Android, any desktop | Publish once, open the link, add to home screen |
| Native iPhone app (App Store / TestFlight) | iPhone | Needs an Apple Developer account and Apple's review — not in class |

### 2.1 — Android: download and install your APK
1. **Settings → App Details → Package Name**, e.g. `my.locx.practice.aisyah`.
2. **Download APK** (top toolbar, in the download / build options). The build takes a few minutes; you
   get a `.apk` (Android Package) file.
3. Send it to your phone (USB cable, Google Drive, or email to yourself), open it, allow **Install
   unknown apps** when Android asks → **Install**.

### 2.2 — No Android phone: MuMu Player on Windows
MuMu Player is a free Android emulator that installs your APK without a Google account.
1. Download it only from the official site, **mumuplayer.com**, and install. It needs about 4 GB of
   RAM and *virtualisation* turned on — the installer tells you if it isn't.
2. Start MuMu Player. Skip the Google sign-in — it's only for the Play Store.
3. **Drag your `.apk` file onto the MuMu window.** It installs and appears on MuMu's home screen.

> **Office laptops:** installing an emulator may need admin rights. If it's blocked, use your phone or
> the web app.

### 2.3 — iPhone (and anyone else): the web app
1. **Settings and Integrations → Project Setup → Platforms** → turn on **Web**.
2. **Settings and Integrations → Web Publishing** → **Site URL** e.g. `practice-ff-aisyah` →
   **Publish**. In a few minutes it's live at `https://practice-ff-aisyah.flutterflow.app`.
3. **iPhone:** open the link in **Safari** → **Share** → **Add to Home Screen**. It opens full screen,
   like an installed app.

**Checkpoint ✅** The practice app runs on your Android phone, in MuMu, or from your iPhone's home
screen.

---

# Part B — PanelWatch Mobile, built mostly with FlutterFlow AI

## Topic 3 — Connect to Firebase and describe the data (by hand)

**Goal:** a new project connected to the course's Firebase, with the three collections described.

1. **Create New → Create Blank** → `PanelWatch Mobile`.
2. **Settings and Integrations → Project Setup → Firebase** → enter the **project ID** from the trainer
   → **Connect**. If FlutterFlow asks, click **Generate Config Files**. (The trainer has already given
   FlutterFlow access to the project — you don't do anything in Firebase.)
3. **Firestore** (left navigation) → **+** → **Create Collection** for each collection in
   `firebase-api.md` section 2, with its fields and types:

| Collection | Fields (FlutterFlow type) |
|---|---|
| `devices` | `code`, `name`, `location`, `status`, `summary`, `last_reading_text` (**String**); `max_temperature`, `max_humidity`, `min_voltage`, `max_voltage`, `max_current`, `max_vibration`, `latest_temperature`, `latest_humidity`, `latest_voltage`, `latest_current`, `latest_vibration`, `latest_power` (**Double**); `last_reading_at` (**DateTime**) |
| `readings` | `device_code`, `time_text` (**String**); `temperature`, `humidity`, `voltage`, `current`, `vibration`, `power`, `time_unix` (**Double**); `out_of_limits` (**Boolean**); `time` (**DateTime**) |
| `alerts` | `device_code`, `parameter`, `level`, `acknowledged_by`, `time_text` (**String**); `value`, `limit` (**Double**); `resolved` (**Boolean**); `time` (**DateTime**) |

   Names must match exactly — FlutterFlow reads the fields by name.

> **Never** press **Deploy** for Firestore **rules** or **indexes** (Firestore → Settings). The project
> is shared: a deploy from your project replaces the rules for the whole class.

**Try it** — Firestore → the data viewer / content manager: you see the three `devices` documents, and
`readings` growing every 15 seconds.

**Checkpoint ✅** Firebase connected; three collections described with the right field names and types.

---

## Topic 4 — Design the whole app with AI

**Goal:** all four screens, generated by FlutterFlow's AI with one consistent look.

1. **Theme first (by hand, 2 minutes):** **Theme Settings → Colors** → primary dark blue, background
   light grey. Every generated screen then uses the project theme.
2. **Page Selector → add a page → Generate with Designer (AI)** for each page:

| Prompt | Page name | What it is |
|---|---|---|
| 5 | `DeviceList` | The three panels — the home page |
| 6 | `DeviceDetail` | One panel: summary, chart, latest values, limits |
| 7 | `AlertList` | Open alerts with an **Acknowledge** button |
| 8 | `About` | What PanelWatch is, the system diagram, your name |

3. **Navigation bar (by hand):** on `DeviceList`, `AlertList` and `About`, turn on **Show on Nav Bar**
   with icons and labels *Panels*, *Alerts*, *About*. Set `DeviceList` as the **Initial Page**
   (**Settings → App Details**).

**Catch the AI**
- **Sample data** ("Device A", "25 °C") — fine; you connect live data in Topics 6–8.
- **Extra features** you didn't ask for (search bars, log-in, settings) — delete them.
- **Fixed sizes** that overflow on a small phone — use the Topic 1.2 rules: Expanded, or a max width.
- **Its own colours** instead of the theme — ask again with "use the project theme only".

**Save to your prompt library:** Prompts 5–8 as you finally used them.

**Checkpoint ✅** Four consistent pages and a nav bar.

---

## Topic 5 — A component kit with AI

**Goal:** reusable pieces the AI designs once and you use everywhere.

1. **Components → add a component → Generate with Designer (AI)** for each:

| Prompt | Component | Used on |
|---|---|---|
| 9 | `StatusBadge` | Everywhere a status or level appears |
| 10 | `MetricTile` | Latest values on the list and detail pages |
| 11 | `DeviceCard` | Each panel on `DeviceList` |
| 12 | `AlertCard` | Each alert on `AlertList` |
| 13 | `AcknowledgeSheet` | The bottom sheet for acknowledging an alert |

2. **Turn hard-coded text into parameters (by hand):** the AI writes fixed text like "PNL-01" and
   "31.2". Open each component → **Component Parameters** → add parameters, then bind the texts to them:

| Component | Parameters |
|---|---|
| `StatusBadge` | `status` (String) |
| `MetricTile` | `label`, `unit` (String), `value` (Double) |
| `DeviceCard` | `code`, `name`, `status`, `lastReading` (String); `temperature`, `voltage`, `current`, `power` (Double) |
| `AlertCard` | `code`, `parameter`, `level`, `timeText` (String); `value`, `limit` (Double); `onAcknowledge` (Action) |
| `AcknowledgeSheet` | `alertRef` (Document Reference → `alerts`) |

3. **StatusBadge colour (by hand):** its background → **Conditional Value**: `status` equals
   `Critical` → red, `Warning` → amber, else green. Use `StatusBadge` inside `DeviceCard` and
   `AlertCard`.

**Catch the AI**
- **Every card a different size** — set the same padding and corner radius in the component, not on the
  page.
- **A button that does nothing** in `AlertCard` — give it the `onAcknowledge` action parameter so the
  page decides what happens.

**Checkpoint ✅** Five components with parameters; `StatusBadge` changes colour with its `status`.

---

## Topic 6 — The live panel list

**Goal:** `DeviceList` shows the three panels, updating by itself.

1. On `DeviceList`, select the list (ListView or Column) → **Backend Query → Query Collection →
   `devices`**, **List of Documents**, order by `code` ascending. Leave **Single Time Query** **off** —
   that's what makes it live.
2. Replace the AI's sample cards with one `DeviceCard`, bound to the query's document:
   `code`, `name`, `status`, `latest_temperature`, `latest_voltage`, `latest_current`,
   `latest_power`, `last_reading_text`.
3. On the card: **Actions → On Tap → Navigate To → DeviceDetail**, passing the document
   (page parameter `device`, type **Document** → `devices`).

**Try it**
1. **Test mode** — three panels with real values. **Don't touch anything** for 15 seconds: the numbers
   change by themselves.
2. In your Bubble admin, **Send test event** → `high-vibration` to `PNL-02`. Within 15 seconds the
   card turns **Critical** on the phone — no refresh.
3. **Break it on purpose:** turn **Single Time Query** **on** → the values freeze. Turn it off again.

> **Why this is cheaper than Bubble's refresh:** a live query reads the three documents once, then only
> the documents that change.

**Checkpoint ✅** A live list of three panels; a test event shows on the phone without refreshing.

---

## Topic 7 — The panel detail page

**Goal:** tap a panel → its summary, latest values, a chart of the last 20 temperatures, and its limits.

1. On `DeviceDetail`, bind the header, `StatusBadge` and the summary card to the page parameter
   `device` (`code`, `name`, `status`, `summary`).
2. Fill a row of `MetricTile`s from `device`: temperature °C, humidity %, voltage V, current A,
   vibration mm/s, power W.
3. **Chart section with AI:** if the page has no good chart area, **Generate with Designer** with
   **Prompt 14 — Chart section** and paste it in.
4. **Readings query (by hand):** on the chart's parent → **Backend Query → Query Collection →
   `readings`**: filter `device_code` **equal to** `device.code`; order by `time` **descending**;
   limit **20**. (The trainer created the index for exactly this query.)
5. **The chart (by hand):** the **Line Chart** → data from the query: **X axis** `time_unix`, **Y axis**
   `temperature`. Hide the X-axis labels (they're milliseconds).
6. **Limits:** a small table of `max_temperature`, `max_humidity`, `min_voltage`, `max_voltage`,
   `max_current`, `max_vibration` from `device` — read-only on the phone (they're changed in the Bubble
   admin).

**Try it**
1. Tap `PNL-03`: its own chart and summary. Back; `PNL-01`: different data.
2. Leave the page open: a new point joins the chart every 15 seconds.
3. **Break it on purpose:** change the order field from `time` to `humidity` → the query fails with a
   message that an **index is needed** — the same lesson as yesterday's `FAILED_PRECONDITION`. Put it
   back. (Don't create the index yourself — the project is shared.)

**Checkpoint ✅** Each panel's page shows its live summary, chart and limits.

---

## Topic 8 — Alerts and acknowledging them from the phone

**Goal:** the open alerts, live, and an acknowledge action that writes back to Firebase.

1. **App State (by hand):** **App Values → App State** → `supervisorName` (String, **Persisted**). On
   `About`, a TextField *Your name* that sets it.
2. **Alerts query:** on `AlertList`'s list → **Query Collection → `alerts`**: filter `resolved`
   **equal to** `false`; order by `time` **descending**; limit **30**. Live (Single Time Query off).
3. Use `AlertCard` for each alert, bound to `device_code`, `parameter`, `value`, `limit`, `level`,
   `time_text`.
4. `AlertCard`'s `onAcknowledge` → **Show Bottom Sheet → `AcknowledgeSheet`**, passing
   `alertRef = this alert's reference`.
5. **The write (by hand),** in `AcknowledgeSheet`'s **Confirm** button:
   - **Backend/Database → Firestore → Update Document** → reference `alertRef` → set
     `resolved = true`, `acknowledged_by = the sheet's name field` (default: App State
     `supervisorName`).
   - **Dismiss** the sheet → **Show Snack Bar** *Alert acknowledged*.

**Try it**
1. Acknowledge an alert — it disappears from your phone **at once**, and from everyone's, because
   everyone's list is live.
2. Open your Bubble **alerts** page and press **Refresh** — it's gone there too. In the browser,
   `…/documents/alerts/<ID>` shows `resolved: true` and your name.
3. **Break it on purpose:** in Update Document, set the field `resolved` on the wrong reference (e.g.
   leave the reference empty) → FlutterFlow flags the action as incomplete before it even runs.

**Checkpoint ✅** Live alerts; acknowledging one on the phone closes it in Firebase and in Bubble.

---

## Topic 9 — Test the app with AI

**Goal:** plain-English tests that FlutterFlow's AI runs for you.

1. Open **Test Pilot** and add the tests from **Prompt 15 — Tests**, one per line, e.g. *"Open the app.
   The first screen shows three panels: PNL-01, PNL-02 and PNL-03."*
2. **Run** them. Test Pilot builds the app, taps through it and shows screenshots for each step.
3. Fix anything that fails, and run again.

**Catch the AI**
- A test that **passes for the wrong reason** — look at the screenshots, not just the green tick.
- A test that **acknowledges a real alert** — remember the data is shared; that's fine once, but say
  so to the room.

> **If Test Pilot isn't available on your plan:** use your AI generations instead for **Prompt 16 —
> Empty, loading and error states**: "No open alerts" with a check icon, a loading shimmer for the
> panel list, and a "Can't reach the server" message. Put each on the right page with conditional
> visibility.

**Checkpoint ✅** A passing set of AI-run tests (or AI-designed empty, loading and error states).

---

## Topic 10 — Make it a proper mobile app

**Goal:** PanelWatch installed on your device.

1. **Icon and splash:** **Settings → App Assets**.
2. **Package name:** **Settings → App Details**, e.g. `my.locx.panelwatch.aisyah`.
3. **Install it:** Android → **Download APK** and install (Topic 2.1); laptop → MuMu (2.2); iPhone →
   publish as a web app and **Add to Home Screen** (2.3).

**Store readiness checklist**

| Item | Notes |
|---|---|
| Package / bundle ID | Can't change after the first store release |
| Icon and splash | ✅ today |
| **Security** | Test-mode Firebase must become real rules + sign-in before any real data |
| Privacy policy URL | Required by both stores |
| **Android:** Google Play Console account (one-time fee) | FlutterFlow can deploy from the editor |
| **iPhone:** Apple Developer Program (yearly fee) | Apple reviews every release |

**Checkpoint ✅** PanelWatch runs from an icon on your phone (or in MuMu).

---

## Topic 11 — Capstone & presentations

**Your requirement** — show the whole system working live:
1. **Bubble admin** (laptop) and **PanelWatch Mobile** (phone — Android APK, emulator or iPhone web app)
   open side by side.
2. From Bubble, **Send test event** → `overheating` to a panel. Within 15 seconds the phone shows it
   **Critical**, with a new alert — without touching the phone.
3. **Acknowledge** that alert on the phone. Press **Refresh** on the Bubble alerts page — it's gone,
   with your name.
4. **One improvement built with FlutterFlow AI** — e.g. a power trend card (**Generate with Designer**),
   an open-alerts count on the nav bar, a dark theme, or an "Offline" banner when `last_reading_at` is
   older than a minute.

**Present for 5 minutes:** the live flow, your improvement and the prompt behind it, and one thing the
AI got wrong and how you caught it.

**Checkpoint ✅** Bubble → Firebase → phone → Firebase → Bubble, live, in front of the class.

---

## End of Day 2 — what you should have
- `Practice FF`, built by hand, running on your device.
- `PanelWatch Mobile` connected to the course Firebase, with:
  - four AI-designed pages (`DeviceList`, `DeviceDetail`, `AlertList`, `About`) and a nav bar;
  - five AI-designed components with parameters;
  - live queries for panels, readings and open alerts; a temperature chart; an acknowledge action;
  - AI-run tests (or AI-designed empty, loading and error states);
  - an icon and splash, installed from your own APK or as an iPhone web app.
- Your **prompt library** in `prompts.md`.

**Security recap**
- Test mode means anyone with the project ID can change the data. Real apps need Firebase **security
  rules** and **sign-in** — the next step after this course.
- You never deployed rules or indexes to the shared project.

**Extra, if you finish early**
- Add `recent_temperatures` (**List < Double >**) to `devices` and show a mini chart on each `DeviceCard`.
- Add a limits **warning line** on the chart.
