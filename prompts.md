# PanelWatch — Prompt Library

Every AI prompt used in the course, in the order you use them. Copy a prompt as it is, then **write
down below it what you changed** and why — that's your prompt library to take home.

> **AI used in this course:** Bubble AI (app generator) and the Bubble **Agent** on Day 1;
> FlutterFlow **Generate with Designer** and **Test Pilot** on Day 2. No ChatGPT, Claude, Gemini or
> FlutterFlow's AI Agent Panel.

**Tips that apply to every prompt**
- Say **what the data is called** and where it comes from — the AI can't see Firebase.
- Say **what not to build** (log-in, sample databases, extra pages).
- Ask for **one thing at a time**, check it, then ask for the next.
- The AI's version is a first draft. You check it against the notes' checklist.

---

# Day 1 — Bubble admin

## Prompt 1 — Admin layout (Bubble AI app generator, Topic 5.1)
```text
Build an admin web app called "PanelWatch Admin" for engineers who monitor three electrical panels
in a factory (PNL-01, PNL-02, PNL-03). It must work on a desktop and on a phone.

Pages:
1. "index" - a dashboard: a title bar with the app name and links to Dashboard and Alerts, then a
   grid of panel cards.
2. "device" - one panel's details: header, status badge, latest values, a health summary box,
   a readings table, a chart area, a limits form and a "Send test event" box.
3. "alerts" - a list of open alerts with a Resolve button on each.

Style: clean and professional, dark blue header, light grey background, white cards with rounded
corners. Status colours: Normal green, Warning amber, Critical red.

The data comes from an external API that I will connect myself. Do not create log-in or sign-up
pages, and do not add sample data.
```
**My changes:**

---

## Prompt 2 — Dashboard (Agent, Topic 6)
```text
On the page "index", build the panel grid.

Use a repeating group whose data source is "Get data from an external API" -> "Firestore - List
devices"'s documents. Do not use a Bubble data type.

Each cell is a white card showing, from Current cell's fields:
- code (stringValue) in bold and name (stringValue) below it
- a status badge from status (stringValue): green if "Normal", amber if "Warning", red if "Critical"
- latest_temperature °C, latest_humidity %, latest_voltage V, latest_current A,
  latest_vibration mm/s and latest_power W (each a doubleValue, 1 decimal place)
- "Last reading: " followed by last_reading_text (stringValue), in small grey text

Layout: the repeating group is a Row that wraps; each card has a minimum width of 300 px and a
maximum width of 420 px, so a desktop shows 3 cards per row and a phone shows 1.
Add a "Refresh" button at the top right of the grid.
```
**My changes:**

---

## Prompt 3 — Device page (Agent, Topic 7)
```text
On the page "device", the panel code comes from the page URL parameter "code" (for example
device?code=PNL-01). Do not use a Bubble data type - all data comes from the API Connector.

1. A group whose type is "Firestore - Get device" and data source is "Get data from an external
   API" -> "Firestore - Get device" with code = Get code from page URL. Inside it, from the group's
   fields: code and name as the header, a status badge (green Normal, amber Warning, red Critical),
   the six latest values with units, and the summary (stringValue) in a highlighted box titled
   "Health summary".
2. Below it, a repeating group of "Firestore - Readings" with code = Get code from page URL,
   filtered so only items whose document name is not empty are shown. Columns: time_text,
   temperature, humidity, voltage, current, vibration, power. A row's background is light red when
   out_of_limits (booleanValue) is yes.
3. A placeholder area titled "Temperature trend" above the table, for a chart I will add.
4. A "Limits" section with six decimal inputs labelled Max temperature (°C), Max humidity (%),
   Min voltage (V), Max voltage (V), Max current (A) and Max vibration (mm/s), each starting with
   the group's current value, and a "Save limits" button. Leave the button's workflow empty.
5. A "Send test event" section with a dropdown of overheating, voltage-drop, current-spike and
   high-vibration, an input "Your name", and a "Send test event" button. Leave the workflow empty.
6. A "Refresh" button next to the header and a "Back to dashboard" link.

On a phone, stack all sections in one column; make the table scroll sideways instead of shrinking.
```
**My changes:**

---

## Prompt 4 — Alerts page (Agent, Topic 8)
```text
On the page "alerts", build a list of open alerts. Do not use a Bubble data type.

At the top: a title "Open alerts", an input "Your name" and a "Refresh" button.

A repeating group of "Get data from an external API" -> "Firestore - Open alerts", filtered so only
items whose document name is not empty are shown. Each cell is a card with, from Current cell's
document fields: device_code (bold), parameter, value and limit ("62.1 / limit 45"), a level badge
(amber for Warning, red for Critical) and time_text. Each card has a "Resolve" button; leave its
workflow empty.

When the filtered list is empty, show the text "No open alerts" with a green check instead.
Cards stack in one column on a phone and two columns on a desktop.
```
**My changes:**

---

# Day 2 — FlutterFlow mobile app

Use these in **Generate with Designer** (Page Selector → add a page, or Components → add a component).
Each generation uses one of your 50 monthly AI generations — **read the prompt through before you
send it**.

## Prompt 5 — DeviceList page (Topic 4)
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
**My changes:**

## Prompt 6 — DeviceDetail page (Topic 4)
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
**My changes:**

## Prompt 7 — AlertList page (Topic 4)
```text
A mobile screen titled "Open alerts" for the "PanelWatch" app. Use the project theme colours only.

A vertical list of alert cards, newest first. Each card has a coloured strip on the left (amber for
Warning, red for Critical), the panel code "PNL-02" in bold, the problem like "temperature 62.1 /
limit 45", the time "18/10 14:07:10" in grey, a level badge, and an outlined "Acknowledge" button
on the right.

When there are no alerts, the screen shows a large green check icon and "No open alerts".
No filters, no search bar.
```
**My changes:**

## Prompt 8 — About page (Topic 4)
```text
A mobile "About" screen for "PanelWatch". Use the project theme colours only.

1. The app name and one sentence: "PanelWatch shows live readings and alerts from the factory's
   electrical panels."
2. A simple diagram made of three boxes joined by arrows: "Panels (simulator)" -> "Firebase" ->
   two boxes side by side, "Bubble admin" and "This app".
3. A text field labelled "Your name" with the hint "Used when you acknowledge an alert".
4. At the bottom in small grey text: "Built in the AI-Assisted App Development course".
```
**My changes:**

## Prompt 9 — StatusBadge component (Topic 5)
```text
A small rounded pill badge component showing one word such as "Normal", "Warning" or "Critical",
white bold text, 12 px horizontal padding, fully rounded corners. Green background by default.
```
**My changes:**

## Prompt 10 — MetricTile component (Topic 5)
```text
A small square tile component for one reading: a grey label on top ("Temperature"), a large bold
number in the middle ("31.2"), and the unit next to the number in smaller text ("°C"). White card,
rounded corners, light shadow. It should fit two per row on a phone.
```
**My changes:**

## Prompt 11 — DeviceCard component (Topic 5)
```text
A card component for one electrical panel: the code "PNL-01" in bold and the name "Main Panel
Level 1" below it on the left, a status pill on the right, then a row of four compact values -
temperature °C, voltage V, current A, power W - each with a small grey label, and "Last reading
14:05:33" in small grey text at the bottom. Full width, rounded corners, light shadow, 16 px padding.
```
**My changes:**

## Prompt 12 — AlertCard component (Topic 5)
```text
A card component for one alert: a coloured strip on the left edge, the panel code "PNL-02" in bold,
the line "temperature 62.1 / limit 45", the time "18/10 14:07:10" in small grey text, a level pill
("Critical"), and an outlined "Acknowledge" button on the right. Full width, rounded corners.
```
**My changes:**

## Prompt 13 — AcknowledgeSheet component (Topic 5)
```text
A bottom sheet component for acknowledging an alert: a drag handle at the top, the title
"Acknowledge alert", one line of grey text "This closes the alert for everyone.", a text field
"Your name", and two buttons side by side - "Cancel" (outlined) and "Confirm" (filled).
```
**My changes:**

## Prompt 14 — Chart section (Topic 7, only if the page needs one)
```text
A card section titled "Temperature - last 20 readings" with a small grey caption "Updates every
15 seconds", containing a line chart 220 px high with a smooth line in the primary colour, light
horizontal grid lines and no labels on the horizontal axis.
```
**My changes:**

## Prompt 15 — Tests (Test Pilot, Topic 9)
Add these one at a time. The data is live and shared, so the exact numbers will differ — test what
must always be true.
```text
1. Open the app. The first screen shows three panels: PNL-01, PNL-02 and PNL-03.
2. Each panel card shows a status of Normal, Warning or Critical.
3. Tap PNL-02. A screen titled PNL-02 opens and shows a health summary and a temperature chart.
4. On the PNL-02 screen, tap the back arrow. The panel list is shown again.
5. Tap Alerts in the bottom navigation bar. Either alert cards or the text "No open alerts" are shown.
6. Tap About in the bottom navigation bar. The screen shows the text "Your name".
```
**My changes:**

## Prompt 16 — Empty, loading and error states (Topic 9 fallback)
```text
Three small state components for a mobile app, using the project theme:
1. "EmptyAlerts": a large green check icon and the text "No open alerts".
2. "LoadingCards": three grey placeholder cards with a shimmer effect, the size of a panel card.
3. "OfflineMessage": a cloud-off icon, "Can't reach the server", and a "Try again" button.
```
**My changes:**

---

## Capstone improvement (Topic 11) — write your own
Use the same shape as the prompts above: **what it is**, **where it goes**, **what it shows**, and
**what not to add**.
```text

```
**What the AI got wrong, and how I caught it:**
