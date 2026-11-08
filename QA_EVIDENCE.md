# BLOCK CLUB 1.0.1 — QA evidence (November 8, 2026)

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
