# BLOCK CLUB 1.1 — Game Night Edition

**Status:** Feature branch / review candidate. Not deployed or merged. The existing release hold remains in effect.

## What's new

- **Pass-and-play:** Two to four total players, with one to four named human seats and optional AI seats. A non-AI game requires at least two human players; solo play still needs at least one computer opponent.
- **Private handoff:** Before another human acts, the board and balances are hidden until that person taps Ready. Applies to turn changes, human auctions, human trade decisions, and a resumed/imported game. This is a shared-device privacy cue, not authentication or a security boundary against someone with developer tools.
- **Human trades:** A receiving human explicitly accepts or declines the existing one-deed-per-side + cash proposal. The originating human gets a fresh handoff afterward. AI trade appraisal and all existing property, rent, auction, jail, building, and bankruptcy rules are retained.
- **Game length:** Select 6, 12, 20, or 30 rounds (highest net worth wins), or classic bankruptcy play. The legacy 12-round default is unchanged.
- **Portable saves:** Export a `.json` file locally and import it on another browser or device. An import validates the game and asks before replacing current progress. The original local autosave key `blockclub.game.v1` and numeric `version:1` state schema are retained. Files and saves are local only; there is no cloud sync or account.
- **Motion:** Optional landing/score animations and dice feedback, plus a toggle. Respects the system reduced-motion setting; choosing Off disables CSS animations/transitions. No new JS/CSS runtime dependencies.

## Play / build

```bash
npm test
npm run verify:release
python3 build.py
python3 tests/mobile_embed.py
python3 tests/game_night_ui.py
```

Open `play.html` in a local-HTML-capable browser; all gameplay, styling, and logic are embedded. The hosted-PWA source remains separate and requires an independently approved manual release before any publication. On Android, some browsers will not directly open `file://` HTML files; this is a browser restriction, not a required network dependency for the game.

## Safety and acceptance

- Do not merge/deploy or change the GitHub Pages release environment without separate approval.
- Do not host this game on Zeus or Lucy, or reuse held Felix infrastructure.
- Preserve the entire original state format under `blockclub.game.v1`; reject malformed imports without erasing current state.
- CI engine, static release, standalone browser smoke, and real-device Android PWA/install/offline tests are distinct acceptance signals.
- A manual Android test is still required for home screen installation and airplane-mode resume, as well as accessibility and actual pass-and-play with multiple people.

## Portable save format

The file contains `{"format":"blockclub-save","saveVersion":1,"game":{...},"settings":{"sound":true,"motion":true}}`. Import validates structure and player ownership before replacing autosave. A JSON save is not an authenticated record, is editable by its holder, and should not be trusted for competitive leaderboards. Saved games are not synced across domains unless imported manually.
