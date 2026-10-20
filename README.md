# AI-Assisted App Development: Mastering Bubble.io & FlutterFlow

**Course project: PanelWatch**, an IoT monitoring system for a factory's electrical panels.

| | |
|---|---|
| **Length** | 2 days |
| **Level** | Beginners to no-code; no programming needed |
| **Language** | English |
| **You build** | A **Bubble admin web app** (desktop and phone) and a **FlutterFlow mobile app** (Android, iPhone, emulator), both on one live **Firebase** database |

## What PanelWatch is

```text
   Three panels (simulated in Firebase, a reading every 30 s)
                         |
                         v
                 +---------------+
                 |   Firebase    |   panels and their readings
                 |  (Firestore)  |
                 +---------------+
                   ^           ^
   REST API (read) |           |   built-in connection (live)
                   |           |
        +----------------+   +--------------------+
        |  Bubble admin  |   | FlutterFlow mobile |
        |  (Day 1)       |   | (Day 2)            |
        |  engineers:    |   | supervisors:       |
        |  dashboard,    |   | live panels,       |
        |  panel page,   |   | panel page,        |
        |  readings      |   | chart              |
        +----------------+   +--------------------+
```

The trainer runs the Firebase project. **You don't set anything up in Firebase** — the data and API
are explained in `firebase-api.md`. Everyone in the class shares the same three panels.

## How each day works
1. **Basics first, by hand,** in a small practice app — so you understand what the AI builds later.
2. **Then the real app, with the tool's own AI** doing the design work, and you checking it, fixing
   it and connecting the data.

| Day | Morning (by hand) | Afternoon (AI-led) |
|---|---|---|
| **1 — Bubble** | Bubble building blocks; the API Connector with a weather API; PanelWatch's data and API | Admin app laid out by **Bubble AI**, pages built with the **Agent**, one feature at a time: dashboard, device page (summary, readings, chart) |
| **2 — FlutterFlow** | FlutterFlow building blocks with a weather API; running an app on Android, in an emulator and on iPhone | Mobile app with **FlutterFlow AI** designing every screen and component and testing it with **Test Pilot**; live data and chart; capstone demo |

## What you need

| Tool | Plan | Notes |
|---|---|---|
| **Bubble.io** | **Free** | AI app generator, Agent (500 AI credits a month) and the API Connector all work on Free |
| **FlutterFlow** | **Basic** (paid, monthly) | 50 AI generations a month, APK download and web publishing |
| **A laptop** | Chrome or Edge | Windows or Mac |
| **A phone** | Android or iPhone | Android installs the APK; iPhone runs the web app |
| **MuMu Player** | Free (Windows) | Only if you have no Android phone — runs the APK on your laptop |

**AI rule:** only the AI built into Bubble and FlutterFlow. **No outside AI** — no ChatGPT, Claude,
Gemini, Copilot, or FlutterFlow's AI Agent Panel (it runs on outside AI accounts).

## Files

| File | What it is |
|---|---|
| `README.md` | This overview |
| `firebase-api.md` | The database: collections, fields, rules, and the REST calls Bubble uses |
| `day1.md` | Day 1 — Bubble basics, then the PanelWatch admin. Its AI prompts are in the topics that use them, each with why it's written that way |
| `day2.md` | Day 2 — FlutterFlow basics, then PanelWatch Mobile, with its AI prompts the same way |
| `trainer-only/` | Trainer files: Firebase setup, the simulator's code, delivery notes. Not needed by participants |

## Ground rules for a shared database
- Everyone **reads** the same three panels; your apps never write to the database. When a panel
  turns Critical, every app in the room shows it.
- The data is **simulated** and there's no sign-in — anyone with the project ID can read it, within
  the rules in `firebase-api.md` 4.4. Never put real names, phone numbers or company data in it.
- Never deploy Firestore rules or indexes from FlutterFlow.
