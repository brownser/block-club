# BLOCK CLUB — QA evidence

## Game Night Edition 1.1.0 — 2026-11-17

- 37/37 Node engine, multiplayer, save-validation and service-worker simulation tests passed on the isolated Mac Studio checkout.
- 3/3 generated release-artifact tests passed: ten allowlisted static assets, CSP and PWA metadata.
- 6/6 new headless Chrome Game Night UI checks passed: two human players and no AI, private handoffs, cross-context JSON save portability, human trade consent and return handoff, motion toggle, and horizontal-fit checks at 320/390/412/1280 px.
- 8/8 original isolated Chromium mobile tests passed in the separate test environment; 1.0.1 rules and storage compatibility remain regression targets.
- Generated single-file `play.html` checked at 107,777 bytes; SHA-256 `a2c8f98e333d8ff3efa91e0aabf653fdc96b20868c8db98e13b7bf529db96864` in both isolated build environments. The HTML file is not committed or included in the hosted bundle.
- Browser UI verification uses a controlled embedded standalone page with simulated localStorage because sandbox file/localhost navigation can be restricted. This is not a real Android or HTTP/PWA test.
- **Still unverified:** Android direct-file browsing, real-device shared-phone interactions and persistence, home-screen installation, airplane-mode reopening, and live HTTPS security headers. Release and merge are not authorized by these tests.

---

## Existing 1.0.1 QA evidence (November 8, 2026)

## Completed in this isolated workspace

- 15/15 Node rules-engine tests passed: 40-square board, starting funds, Go, rent, rail/utility rent, sets/building, mortgage/redemption, doubles/jail, auctions, debt, trade acceptance and invalid-trade rejection, quick-win logic, nine simulated full games.
- 5/5 service-worker simulation tests passed: nested subdirectory precache, cache scoping, offline navigation fallback, offline JS cache, bypass of unrelated requests.
- 3/3 release static tests passed: exact public file whitelist, CSP/scripts/static dependency policy, PWA manifest/PNG icons.
- 8/8 Chromium UI checks passed using standalone HTML embedded in a page: 320×700, 390×844, 412×915 and 1280×850, no page JS errors or horizontal overflow, game start, simulated storage restore on a fresh app load, portfolio dialog, full property-for-property cash trade through the actual UI, corrupted settings isolation.
- Original trade form bug corrected: UI now supplies engine keys `giveTile` and `takeTile`. Added regression tests for the engine and the interactive UI. The stale dialog cleanup path was corrected.
- Original engine save schema (version 1) preserved; application/package release now 1.0.1.

## Not yet verified — do not mark launch complete

- **Real network-hosted PWA**: This test environment's Chromium is managed with a URLBlocklist, so local HTTP navigation returned `ERR_BLOCKED_BY_ADMINISTRATOR`. A real service worker install, HTTP offline restart and browser-enforced CSP could not be verified in this environment. The `tests/pwa_launch.py` test is included for an unrestricted environment; the Node service-worker simulation is not a substitute for it.
- **Real Android device**: Chrome/Samsung Internet PWA install prompt, launcher icon, standalone window, device airplane-mode restart and physical-device persistence have not been tested.
- **Actual GitHub Pages site and headers**: No repository, GitHub Actions workflow run or deployment was created. Public URL and live HTTP response behavior do not yet exist.
- **Long-session manual QA**: full 12-round human-interactive gameplay on physical Android, device sleep/resume, touch accessibility and upgrade rollback remain to be tested.

**Release decision:** RC1 candidate prepared, publish HOLD pending explicit approval and post-publish acceptance tests.
