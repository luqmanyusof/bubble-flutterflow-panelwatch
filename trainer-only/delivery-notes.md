# Trainer — delivery notes

## Before the course

### One week before — send to participants
- [ ] Create a **Bubble** account (Free plan is enough).
- [ ] Buy **FlutterFlow Basic** for the month of the course, and sign in once.
- [ ] Android users: check the phone allows installing apps from a file (company phones may not).
- [ ] Windows users without an Android phone: install **MuMu Player** from mumuplayer.com and check it
      starts (needs virtualisation on, may need admin rights).
- [ ] The Google account email they'll use (for FlutterFlow's Firebase access, if needed).
- [ ] Reminder: **no outside AI tools** are used in class.

### Three days before — Firebase
- [ ] Project set up as in `firebase-setup.md`, indexes *Enabled*, simulator tested, budget alert on.
- [ ] `firestore.rules` `open()` date set to the day after the course (now: end of 23 Oct 2026).
- [ ] `firebase@flutterflow.io` added as Editor.

### Dry run — check these yourself (they decide parts of the notes)
| Check | If it fails |
|---|---|
| **Bubble Agent binds API Connector data** (a repeating group of `Firestore - List devices`'s documents) | Participants bind by hand from the checklists in Topics 6–8; the Agent still lays out the pages |
| **Bubble handles the `:runQuery` response** (a top-level list) — `Readings` and `Open alerts` initialize with `document` fields | Initialize again after a test event so there's data; if Bubble rejects the list, tick *Manually enter API response* and paste a sample from the browser |
| **Which free chart plugin** works with API data in Bubble — pick one and name it in class (Topic 7.2) | Show the readings table only; the chart moves to "extra" |
| **Test Pilot on FlutterFlow Basic** | Use Prompt 20 (empty, loading and error states) — already in the notes as the fallback |
| **FlutterFlow connects to Firebase** with only `firebase@flutterflow.io` as Editor | Add participants' Google accounts as Viewer |
| **FlutterFlow's data viewer opens `readings`** under the new rules (Day 2, T3 *Try it*) | Show `readings` from the Firebase console on the projector instead — the rules only allow searches of 50 or fewer |
| **Generate with Designer** menu names in the current FlutterFlow version | Update the menu paths in `day2.md` |
| **Web publish** works and the app opens on an iPhone from the home screen | iPhone users run the app in Safari without adding it to the home screen, or in the laptop browser |
| **APK download** on Basic, and it installs in MuMu by drag-and-drop | Use the web app in the laptop browser |

## Timing

### Day 1 — Bubble
| Time | Topic |
|---|---|
| 09:00 | Welcome; the system (T1) |
| 09:30 | Bubble basics, practice app (T2) |
| 10:30 | Break |
| 10:45 | API Connector with the weather API (T3) |
| 11:30 | PanelWatch data and API (T4) — show the Firebase console on the projector |
| 12:00 | Create the admin app + Firestore calls (T5) — start the generation first (10–15 min), explain the API calls while it runs |
| 13:00 | Lunch |
| 14:00 | Dashboard with the Agent (T6) |
| 15:00 | Device page (T7) — **shared limits exercise** run by you |
| 15:45 | Break |
| 16:00 | Alerts page (T8) |
| 16:45 | Wrap-up; everyone closes their Bubble Preview tabs (the 60 s timer keeps reading); set `enabled: false` |

### Day 2 — FlutterFlow
| Time | Topic |
|---|---|
| 08:45 | (You) `config/simulator` → `enabled: true`, new `stop_at` |
| 09:00 | FlutterFlow basics, practice app (T1) |
| 10:15 | Run on every device (T2) — APK builds take minutes; start them before the break |
| 10:30 | Break |
| 10:45 | Connect Firebase, describe the collections (T3) |
| 11:15 | Design with AI: four pages (T4) |
| 12:00 | Components with AI (T5) |
| 13:00 | Lunch |
| 14:00 | Live panel list (T6), detail page (T7) |
| 15:00 | Alerts and acknowledge (T8) |
| 15:30 | Break |
| 15:45 | Tests with AI (T9), proper app (T10) |
| 16:15 | Capstone demos (T11) |
| 17:00 | Close; set `enabled: false` |

## Running the shared exercises
- **Limits change (Day 1, T7.3):** one volunteer on the projector lowers `PNL-02` `max_temperature` to
  `33`. Everyone presses **Refresh** — `PNL-02` turns **Warning** and alerts appear. Then set it back to
  `45` together. Check in the Firebase console that all six limits are back to the defaults:
  45 / 85 / 207 / 253 / 20 / 4.5.
- **Test events:** ask the room to send one each, by name, rather than all at once — or nominate a
  "control room" person per table.
- **Alerts:** with a shared list, someone always resolves "your" alert first. Say so up front; it's the
  point of a control room. Send a fresh event if someone needs one to test.

## When things go wrong
| Symptom | Likely cause | Fix |
|---|---|---|
| No new readings | Simulator off or past `stop_at` | Console → `config/simulator` → `enabled: true`, later `stop_at` |
| `FAILED_PRECONDITION … requires an index` on a correct call | Index still building, or someone changed the sort field | Firestore → Indexes; compare the body with `firebase-api.md` |
| `PERMISSION_DENIED` on one call | The call does something the rules don't allow: PATCH without `updateMask`, a limit sent as text, a search without `limit` or over 50, an extra field in a test event | Compare the call with `firebase-api.md` 4.2 and the rules table in 4.4 |
| A panel lost its name / limits | Someone edited it in the Firebase console (the rules stop the API from doing this) | Delete `devices/PNL-0x` — the simulator recreates it with defaults within a minute |
| `PERMISSION_DENIED` for everyone | Rules date has passed | Edit the date, `firebase deploy --only firestore:rules --project <PROJECT_ID>` |
| Someone's FlutterFlow project deployed rules | They pressed Deploy in FlutterFlow | Redeploy: `firebase deploy --only firestore --project <PROJECT_ID>` |
| `429 / RESOURCE_EXHAUSTED` | Billing not on Blaze (Spark stops at the free allowance) | Check Billing is Blaze; set `interval_seconds` to `60` |
| Reads climbing fast (Firestore → Usage) | Many open FlutterFlow apps, or Bubble tabs left on the 60 s timer | `interval_seconds` → `60`; ask the room to close Test Mode and old Bubble Preview tabs |
| Bubble list doesn't change | No `X-Refresh`/`tick` | Topic 6.1 |
| APK won't install | Phone blocks unknown apps | Use MuMu or the web app |
| Too many old alerts | Random events over a long day | Set `event_chance` to `0` and use test events; resolve old ones from Bubble |

## After the course
- `enabled: false`; delete or keep the project (`firebase-setup.md` section 7).
- Remind participants that FlutterFlow Basic renews monthly — cancel if they don't need it.
