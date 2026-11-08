# BLOCK CLUB 1.0.1 — controlled launch checklist

**Selected release route:** a newly created, isolated GitHub Pages project site, separate from Felix. **Status: HOLD — requires owner approval, repository setup, HTTPS live checks, and Android device acceptance.**

## Before any external operation

- [x] Confirm no Vercel architecture, dependency, or deployment.
- [x] Isolate from Zeus/Lucy/Felix production and all existing owner-held worktrees/sessions.
- [x] Build minimal website artifact and add a manual-only GitHub Pages workflow.
- [x] Run rules-engine tests, cache simulation, static site checks, and mobile Chromium UI checks.
- [ ] **Owner explicitly approves creation of a separate GitHub repository and publication of a publicly accessible website.**
- [ ] Choose approved GitHub account / exact repository name. Public repository or approved plan and visibility must be decided.
- [ ] Ensure sufficient GitHub Actions budget, repository access, Pages feature availability, and deployment permissions. Do not reuse a capped or held CI allocation without owner authorization.

## Publish only after approval

- [ ] Create the separately approved repository; commit contents of the `block-club` folder (not the generated `site/` files).
- [ ] Set Settings → Pages → Source: **GitHub Actions**.
- [ ] Restrict deployment environment `github-pages` to branch `main`, and add required reviewer if available.
- [ ] Run Actions → **BLOCK CLUB — manually approved GitHub Pages release** → manually dispatch with `approve_publication=true` on `main`.
- [ ] Record the actual GitHub Pages HTTPS URL, Actions run URL, commit SHA, and deployed asset integrity.
- [ ] Check the actual served Content-Type of `.mjs`, `.webmanifest`, and icons. Confirm HTTPS and absence of mixed content or third-party requests.
- [ ] Confirm site remains isolated from Felix, Zeus, Lucy, and all held production resources.

## Real Android acceptance — Chrome / Samsung Internet

- [ ] Open the confirmed HTTPS URL in Android Chrome while online. Home screen, all 40 spaces, scoreboard, modal and buttons render without horizontal overflow.
- [ ] Choose 1, 2 and 3 AI opponents in separate games; validate dice, purchase/decline/auction, rent, trade, mortgage/build, turns, jail, help, results and audio toggle.
- [ ] In browser menu choose **Install app** or **Add to Home screen**, then launch the new icon. Verify full-screen/standalone app shell and correct name/icon. Chrome + Google Play services or Samsung Internet may produce a true installed WebAPK; other browsers may offer only a shortcut.
- [ ] Start a game, purchase property or roll dice, completely close the application, then relaunch from the home-screen icon. Verify board positions, balances, ownership and current turn survive.
- [ ] After one successful online launch and service-worker activation, turn on airplane mode (disable Wi-Fi too). Force-close and launch the app from the icon. Verify the board, controls, CSS, icons and saved game work without connectivity.
- [ ] Make at least one offline game move, close and reopen while still offline, confirm save persisted. Re-enable connectivity; confirm progress remains and no duplicate game reset.
- [ ] Confirm game saves remain stable across a routine 1.0.1 static asset update at the same domain and path. Do not change URL or clear app/site data during this check.
- [ ] Run Android accessibility checks: readable text, 44px-class touch controls where practical, dialog close action, keyboard/screen reader navigation as applicable.

## Security / rollback

- [x] No third-party runtime packages or external game API endpoints; no user credentials or secrets needed in public assets.
- [x] Hosted index has CSP restricting scripts to self, object/embed disabled, and no inline JavaScript. Standalone single-file edition intentionally has inline scripts; it is **not** in the site artifact.
- [x] Service worker only precaches known app assets in a namespace scoped to its own subdirectory. Other site caches and arbitrary paths are not claimed.
- [ ] Verify live browser enforces CSP; inspect CSP violations, request list, storage privacy and actual HTTP headers.
- [ ] Verify GitHub Pages permissions and repository security settings. Note that custom response security headers cannot be fully controlled on GitHub Pages; use an approved self-hosted HTTPS server for header-level policies.
- [ ] Record previous known-good commit/release to permit rollback through a new, manually approved Pages workflow dispatch.
- [ ] Confirm rollback keeps the same origin/path and does not clear browser storage; after rollback, validate save compatibility and service worker cache update.
- [ ] Collect evidence and **explicit owner acceptance** before saying production launch is complete.

## Stop conditions

Stop without deploying if the selected GitHub owner, visibility or authorization is unclear; GitHub Pages is unavailable; workflow protection cannot be established; the target is an existing production-held host; any mandatory test fails; or the live app makes unintended requests. Do not substitute Vercel, move to Zeus, or bypass a hold.
