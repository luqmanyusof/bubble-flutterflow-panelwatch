# Day 2 — FlutterFlow: the PanelWatch Mobile App

> **Understand it by hand, then let the AI design it:** this morning you learn FlutterFlow's building
> blocks in a small practice app. Then FlutterFlow's built-in AI designs most of the PanelWatch mobile
> app — screens, components and tests — and you connect it to the live Firebase data.
> **Carry-over:** yesterday's Bubble admin (`panelwatch-admin-<yourname>`) — keep its dashboard open next
> to the phone: both show the same panels. The Firebase project ID: `panelwatch-class`.

**Today's app:** supervisors on the factory floor see the three panels' status and latest readings,
and each panel's summary and chart — **live**, with no refresh button.

**Your FlutterFlow plan: Basic**

| What Basic gives you | How we use it today |
|---|---|
| **50 AI generations a month** | About 8–10 today: 3 screens, 3 components, a chart section, capstone extras |
| **APK download** | Install your own app on an Android phone or in an emulator (Topics 2 and 9) |
| **Web publishing** | iPhone users run the app as a web app from the home screen |

> **AI rule for this course:** only FlutterFlow's own AI — **Generate with Designer** for screens and
> components, and **Test Pilot** for tests. FlutterFlow's *AI Agent Panel* runs on your own Claude,
> Codex or Gemini account — that's outside AI, so we don't use it.

**How much of PanelWatch Mobile the AI builds:** every screen, every component, the chart section and
the tests — about 60% of the build. You do the parts AI can't do well: connecting Firebase and the
data bindings. The app only **reads** — it never writes to the database.

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

**Goal:** a new project connected to the course's Firebase, with the two collections described.

1. **Create New → Create Blank** → `PanelWatch Mobile`.
2. **Settings and Integrations → Project Setup → Firebase** → enter the **project ID** `panelwatch-class`
   → **Connect**. If FlutterFlow asks, click **Generate Config Files**. (The trainer has already given
   FlutterFlow access to the project — you don't do anything in Firebase.)
3. **Firestore** (left navigation) → **+** → **Create Collection** for `devices` and `readings`
   (`firebase-api.md` section 2), with its fields and types:

| Collection | Fields (FlutterFlow type) |
|---|---|
| `devices` | `code`, `name`, `location`, `status`, `summary`, `last_reading_text` (**String**); `max_temperature`, `max_humidity`, `min_voltage`, `max_voltage`, `max_current`, `max_vibration`, `latest_temperature`, `latest_humidity`, `latest_voltage`, `latest_current`, `latest_vibration`, `latest_power` (**Double**); `last_reading_at` (**DateTime**) |
| `readings` | `device_code`, `time_text` (**String**); `temperature`, `humidity`, `voltage`, `current`, `vibration`, `power`, `time_unix` (**Double**); `out_of_limits` (**Boolean**); `time` (**DateTime**) |

   Names must match exactly — FlutterFlow reads the fields by name.

> **Never** press **Deploy** for Firestore **rules** or **indexes** (Firestore → Settings). The project
> is shared: a deploy from your project replaces the rules for the whole class.

**Try it** — Firestore → the data viewer / content manager: you see the three `devices` documents, and
`readings` growing every 30 seconds.

**Checkpoint ✅** Firebase connected; two collections described with the right field names and types.

---

## Topic 4 — Design the whole app with AI

**Goal:** all three screens, generated by FlutterFlow's AI with one consistent look.

1. **Theme first (by hand, 2 minutes):** **Theme Settings → Colors** → primary dark blue, background
   light grey. Every generated screen then uses the project theme.
2. **Page Selector → add a page → Generate with Designer (AI)** for each page, with its prompt below:

| Prompt | Page name | What it is |
|---|---|---|
| 6 | `DeviceList` | The three panels — the home page |
| 7 | `DeviceDetail` | One panel: summary, chart, latest values, limits |
| 8 | `About` | What PanelWatch is and the system diagram |

3. **Navigation bar (by hand):** on `DeviceList` and `About`, turn on **Show on Nav Bar**
   with icons and labels *Panels* and *About*. Set `DeviceList` as the **Initial Page**
   (**Settings → App Details**).

> **Each generation uses one of your 50 monthly AI generations** — read the prompt through before you
> send it. Every prompt is here with a table explaining why it's written that way; the four rules from
> Day 1 still apply (name the data, say what not to build, one thing at a time, check the draft).

**Two lines in every Day 2 prompt**

| Part of the prompt | Why |
|---|---|
| *"Use the project theme colours only"* | You set the theme in step 1. Without this, each screen picks its own colours and the app looks stitched together |
| Sample text like *"PNL-01"*, *"31.2"*, *"14:05:33"* | The designer can't see Firebase. Realistic sample text gives realistic sizes; you replace it with live data in Topics 6–7 |

**Prompt 6 — DeviceList page**
```text
A mobile home screen for "PanelWatch", an app for factory supervisors who monitor three electrical
panels. Use the project theme colours only.

Top: an app bar with the title "PanelWatch" and a small subtitle "3 panels - live".
Body: a vertical list of three panel cards. Each card shows a panel code like "PNL-01" in bold, a
name like "Main Panel Level 1", a coloured status badge on the right ("Normal" green, "Warning"
amber, "Critical" red), a row of four small values - temperature °C, voltage V, current A, power W -
and "Last reading 14:05:33" in small grey text at the bottom.

No search bar, no log-in, no floating action button.
```

| Part of the prompt | Why |
|---|---|
| *"for factory supervisors"* | Who uses it: someone walking the floor who needs status at a glance, not forms |
| *"subtitle "3 panels - live""* | Tells the user the list updates itself — there's no refresh button |
| *"a row of four small values"* | Only four of the six readings fit a phone card. The detail page shows all six |
| *"No search bar, no log-in, no floating action button"* | Designers add these by habit. Three panels need none of them |

**Prompt 7 — DeviceDetail page**
```text
A mobile detail screen for one electrical panel in the "PanelWatch" app. Use the project theme
colours only.

App bar with a back arrow and the panel code "PNL-01" as the title.
Body, scrolling, in this order:
1. A header card: the panel name, its location in grey, and a large status badge.
2. A "Health summary" card with two or three lines of text.
3. A grid of six small value tiles, two per row: Temperature °C, Humidity %, Voltage V, Current A,
   Vibration mm/s, Power W.
4. A card titled "Temperature - last 20 readings" with space for a line chart, 220 px high.
5. A "Limits" card listing six read-only rows: Max temperature, Max humidity, Min voltage,
   Max voltage, Max current, Max vibration, each with its value on the right.

No edit buttons - this screen only shows information.
```

| Part of the prompt | Why |
|---|---|
| *"a back arrow and the panel code … as the title"* | The way back to the list, and which panel you're looking at |
| *"in this order: 1–5"* | The reading order — status and summary first, details last |
| *"last 20 readings … 220 px high"* | Matches the readings query (limit 20) in Topic 7, and keeps a fixed space for the chart |
| *"read-only rows"*, *"No edit buttons"* | Limits are changed in the Bubble admin only. The phone shows; the admin edits |

**Prompt 8 — About page**
```text
A mobile "About" screen for "PanelWatch". Use the project theme colours only.

1. The app name and one sentence: "PanelWatch shows live readings from the factory's electrical
   panels."
2. A simple diagram made of three boxes joined by arrows: "Panels (simulator)" -> "Firebase" ->
   two boxes side by side, "Bubble admin" and "This app".
3. At the bottom in small grey text: "Built in the AI-Assisted App Development course".
```

| Part of the prompt | Why |
|---|---|
| *"one sentence: "…""* | The exact text. Left to itself, the AI writes a paragraph of marketing |
| *"three boxes joined by arrows: … -> … ->"* | "A diagram" alone could be anything. Box by box, the AI draws what you mean |

**Catch the AI**
- **Sample data** ("Device A", "25 °C") — fine; you connect live data in Topics 6–7.
- **Extra features** you didn't ask for (search bars, log-in, settings) — delete them.
- **Fixed sizes** that overflow on a small phone — use the Topic 1.2 rules: Expanded, or a max width.
- **Its own colours** instead of the theme — ask again with "use the project theme only".

**Checkpoint ✅** Four consistent pages and a nav bar.

---

## Topic 5 — A component kit with AI

**Goal:** reusable pieces the AI designs once and you use everywhere.

1. **Components → add a component → Generate with Designer (AI)** for each, with its prompt below:

| Prompt | Component | Used on |
|---|---|---|
| 9 | `StatusBadge` | Everywhere a status appears |
| 10 | `MetricTile` | Latest values on the list and detail pages |
| 11 | `DeviceCard` | Each panel on `DeviceList` |

2. **Turn hard-coded text into parameters (by hand):** the AI writes fixed text like "PNL-01" and
   "31.2". Open each component → **Component Parameters** → add parameters, then bind the texts to them:

| Component | Parameters |
|---|---|
| `StatusBadge` | `status` (String) |
| `MetricTile` | `label`, `unit` (String), `value` (Double) |
| `DeviceCard` | `code`, `name`, `status`, `lastReading` (String); `temperature`, `voltage`, `current`, `power` (Double) |

3. **StatusBadge colour (by hand):** its background → **Conditional Value**: `status` equals
   `Critical` → red, `Warning` → amber, else green. Use `StatusBadge` inside `DeviceCard`.

**Prompt 9 — StatusBadge**
```text
A small rounded pill badge component showing one word such as "Normal", "Warning" or "Critical",
white bold text, 12 px horizontal padding, fully rounded corners. Green background by default.
```

**Prompt 10 — MetricTile**
```text
A small square tile component for one reading: a grey label on top ("Temperature"), a large bold
number in the middle ("31.2"), and the unit next to the number in smaller text ("°C"). White card,
rounded corners, light shadow. It should fit two per row on a phone.
```

**Prompt 11 — DeviceCard**
```text
A card component for one electrical panel: the code "PNL-01" in bold and the name "Main Panel
Level 1" below it on the left, a status pill on the right, then a row of four compact values -
temperature °C, voltage V, current A, power W - each with a small grey label, and "Last reading
14:05:33" in small grey text at the bottom. Full width, rounded corners, light shadow, 16 px padding.
```

**Why the component prompts are written this way**

| Part of the prompt | Why |
|---|---|
| *"… component"* in every prompt | A reusable piece, not a page — designed once, used on every screen |
| Exact sizes (*"12 px horizontal padding"*, *"16 px padding"*, *"fully rounded"*) | The same numbers in every component, so cards and badges line up |
| Sample text (*"Normal"*, *"31.2"*, *"PNL-02"*) | Realistic sizes. In step 2 you turn each one into a parameter |
| StatusBadge: *"Green background by default"* | One colour from the AI; you add Warning and Critical by hand in step 3 — a rule the AI could get wrong |
| MetricTile: *"fit two per row on a phone"* | States the result: six tiles = three tidy rows |

**Catch the AI**
- **Every card a different size** — set the same padding and corner radius in the component, not on the
  page.

**Checkpoint ✅** Three components with parameters; `StatusBadge` changes colour with its `status`.

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
1. **Test mode** — three panels with real values. **Don't touch anything** for 30 seconds: the numbers
   change by themselves.
2. Wait for a random **event** (or ask the trainer to send one): within 30 seconds that card turns
   **Warning** or **Critical** on the phone — no refresh. Your Bubble dashboard shows it only after
   its next refresh.
3. **Break it on purpose:** turn **Single Time Query** **on** → the values freeze. Turn it off again.

> **Why this is cheaper than Bubble's refresh:** a live query reads the three documents once, then only
> the documents that change.

**Checkpoint ✅** A live list of three panels; a status change shows on the phone without refreshing.

---

## Topic 7 — The panel detail page

**Goal:** tap a panel → its summary, latest values, a chart of the last 20 temperatures, and its limits.

1. On `DeviceDetail`, bind the header, `StatusBadge` and the summary card to the page parameter
   `device` (`code`, `name`, `status`, `summary`).
2. Fill a row of `MetricTile`s from `device`: temperature °C, humidity %, voltage V, current A,
   vibration mm/s, power W.
3. **Chart section with AI:** if the page has no good chart area, **Generate with Designer** with
   **Prompt 12** (below) and paste it in.
4. **Readings query (by hand):** on the chart's parent → **Backend Query → Query Collection →
   `readings`**: filter `device_code` **equal to** `device.code`; order by `time` **descending**;
   limit **20**. (The trainer created the index for exactly this query.)
5. **The chart (by hand):** the **Line Chart** → data from the query: **X axis** `time_unix`, **Y axis**
   `temperature`. Hide the X-axis labels (they're milliseconds).
6. **Limits:** a small table of `max_temperature`, `max_humidity`, `min_voltage`, `max_voltage`,
   `max_current`, `max_vibration` from `device` — read-only on the phone (they're changed in the Bubble
   admin).

**Prompt 12 — Chart section** (only if the page needs one)
```text
A card section titled "Temperature - last 20 readings" with a small grey caption "Updates every
30 seconds", containing a line chart 220 px high with a smooth line in the primary colour, light
horizontal grid lines and no labels on the horizontal axis.
```

| Part of the prompt | Why |
|---|---|
| *"Updates every 30 seconds"* | Tells the user why the line moves — the simulator's interval |
| *"220 px high"* | The same space Prompt 7 left for the chart |
| *"no labels on the horizontal axis"* | The X axis is `time_unix` in milliseconds — its labels would be unreadable |
| *"in the primary colour"* | The theme colour, like every other screen |

**Try it**
1. Tap `PNL-03`: its own chart and summary. Back; `PNL-01`: different data.
2. Leave the page open: a new point joins the chart every 30 seconds.
3. **Break it on purpose:** change the order field from `time` to `humidity` → the query fails with a
   message that an **index is needed** — the same lesson as yesterday's `FAILED_PRECONDITION`. Put it
   back. (Don't create the index yourself — the project is shared.)

**Checkpoint ✅** Each panel's page shows its live summary, chart and limits.

---

## Topic 8 — Test the app with AI

**Goal:** plain-English tests that FlutterFlow's AI runs for you.

1. Open **Test Pilot** and add the tests from **Prompt 13** (below), one at a time.
2. **Run** them. Test Pilot builds the app, taps through it and shows screenshots for each step.
3. Fix anything that fails, and run again.

**Prompt 13 — Tests** (Test Pilot)
```text
1. Open the app. The first screen shows three panels: PNL-01, PNL-02 and PNL-03.
2. Each panel card shows a status of Normal, Warning or Critical.
3. Tap PNL-02. A screen titled PNL-02 opens and shows a health summary and a temperature chart.
4. On the PNL-02 screen, tap the back arrow. The panel list is shown again.
5. Tap About in the bottom navigation bar. The screen shows the text "Firebase".
```
**Why it's written this way** — the data is live and shared, so the numbers always differ. Each test
checks only what must **always** be true.

| Part of the prompt | Why |
|---|---|
| One test per line | Test Pilot runs each one separately, so a failure points at one thing |
| *"three panels: PNL-01, PNL-02 and PNL-03"* | Panel codes never change; their values do. Test the codes |
| *"a status of Normal, Warning or Critical"* | Any of the three is correct with live data |
| Written as a person would act (*"Tap PNL-02"*, *"tap the back arrow"*) | Test Pilot works like a user: plain actions, then what you should see |

**Catch the AI**
- A test that **passes for the wrong reason** — look at the screenshots, not just the green tick.

> **If Test Pilot isn't available on your plan:** use your AI generations instead for **Prompt 14**:
> "No readings yet" for the chart, a loading shimmer for the panel list, and a "Can't reach the
> server" message. Put each on the right page with conditional visibility.

**Prompt 14 — Empty, loading and error states** (fallback)
```text
Three small state components for a mobile app, using the project theme:
1. "NoReadings": a chart icon and the text "No readings yet".
2. "LoadingCards": three grey placeholder cards with a shimmer effect, the size of a panel card.
3. "OfflineMessage": a cloud-off icon, "Can't reach the server", and a "Try again" button.
```

| Part of the prompt | Why |
|---|---|
| Names in quotes (*"NoReadings"* …) | The names you'll look for in the component list |
| *"the size of a panel card"* | The page doesn't jump when the real cards replace the placeholders |
| *"a "Try again" button"* | An error message needs a way out |

**Checkpoint ✅** A passing set of AI-run tests (or AI-designed empty, loading and error states).

---

## Topic 9 — Make it a proper mobile app

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
| **Security** | Firebase without sign-in must get sign-in and per-user rules before any real data |
| Privacy policy URL | Required by both stores |
| **Android:** Google Play Console account (one-time fee) | FlutterFlow can deploy from the editor |
| **iPhone:** Apple Developer Program (yearly fee) | Apple reviews every release |

**Checkpoint ✅** PanelWatch runs from an icon on your phone (or in MuMu).

---

## Topic 10 — Capstone & presentations

**Your requirement** — show the whole system working live:
1. **Bubble admin** (laptop) and **PanelWatch Mobile** (phone — Android APK, emulator or iPhone web app)
   open side by side.
2. The trainer sends an event to a panel. Within 30 seconds the phone shows it **Warning** or
   **Critical** without being touched; press **Refresh** in Bubble and it shows the same.
3. Open that panel on both: the same summary, and the same newest reading at the top.
4. **One improvement built with FlutterFlow AI** — e.g. a power trend card (**Generate with Designer**),
   a read-only limits card, a dark theme, or an "Offline" banner when `last_reading_at` is
   older than a minute.

**Present for 5 minutes:** the live flow, your improvement and the prompt behind it, and one thing the
AI got wrong and how you caught it.

**Your capstone prompt** — use the same shape as the prompts above: **what it is**, **where it goes**,
**what it shows**, and **what not to add**.
```text

```
**What the AI got wrong, and how I caught it:**

**Checkpoint ✅** Firebase → phone and Bubble, the same data, live, in front of the class.

---

## End of Day 2 — what you should have
- `Practice FF`, built by hand, running on your device.
- `PanelWatch Mobile` connected to the course Firebase, with:
  - three AI-designed pages (`DeviceList`, `DeviceDetail`, `About`) and a nav bar;
  - three AI-designed components with parameters;
  - live queries for panels and readings; a temperature chart;
  - AI-run tests (or AI-designed empty, loading and error states);
  - an icon and splash, installed from your own APK or as an iPhone web app.
- Your capstone prompt, and a note of what the AI got wrong.

**Security recap**
- Without sign-in, rules can only limit **what** is read or changed, not **who** does it. Real apps add
  **sign-in** to the security rules — the next step after this course.
- You never deployed rules or indexes to the shared project.

**Extra, if you finish early**
- Add `recent_temperatures` (**List < Double >**) to `devices` and show a mini chart on each `DeviceCard`.
- Add a limits **warning line** on the chart.
