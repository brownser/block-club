# BLOCK CLUB — Own the City

**Release candidate 1.0.1 · November 8, 2026**

An original, mobile-first, Monopoly-style property strategy game. No account, backend, ad network, third-party JavaScript, tracking scripts, or Vercel. One human plays 1–3 AI opponents. Includes a 40-space board, offers, auctions, property/cash trading, mortgages, buildings, jail, cards, bankruptcy, short and classic modes, and local autosave.

The game is designed for an HTTPS Progressive Web App (PWA) installed from Android Chrome or Samsung Internet. It also ships as a self-contained HTML file for offline use in browsers that permit opening local HTML files.

## Status

**Ready to review; not deployed.** The package includes an approval-gated, manually triggered GitHub Pages workflow. No public repository, website, production infrastructure change, or release has been created. **Do not deploy on existing Zeus or Lucy production hosts while their holds remain in effect.** See [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md) and [QA_EVIDENCE.md](QA_EVIDENCE.md) for evidence and unverified device checks.

## Run the standalone game

Open `play.html` in a browser that supports local HTML files. This version embeds game logic and CSS, and needs no network. Some Android browsers cannot open downloaded HTML files directly; the installed HTTPS PWA is the preferred route.

## Preferred deployment: isolated GitHub Pages project

1. Obtain explicit approval for a **new, separate** GitHub repository and a publicly accessible game site. Do not use `brownser/Felix`, the Zeus host, or any production pipeline.
2. Create a repository (for example, `block-club`) in an approved GitHub account. The game code requires no license from a third party, but the project name and any public source licensing should be selected by the owner.
3. Commit the repository contents, **not** the generated `site/` directory. Use GitHub **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Protect the `github-pages` deployment environment; configure permitted `main` branch and a reviewer if your GitHub plan supports environment approvals.
5. In **Actions → BLOCK CLUB — manually approved GitHub Pages release → Run workflow**, use branch `main` and explicitly select the approval checkbox. This executes tests, builds a minimal static artifact, and publishes it using GitHub's official Pages actions.
6. The resulting address will be `https://<owner>.github.io/<repository>/` unless a custom domain is deliberately configured. Always verify the actual URL returned by the deployment before sharing it.
7. Perform the live Android test matrix in [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md). Do not mark the launch accepted until those tests pass.

This workflow has **no push trigger**: publishing cannot happen merely because the files are committed. It needs a manual dispatch with the explicit `approve_publication` input and appropriate repository/environment permissions.

GitHub Pages sites are typically **publicly accessible even with a private repository**. No secrets or personal data belong in the game bundle. For a private-only experience or full control of HTTP headers, use a separately authorized self-hosted HTTPS static server.

## Alternative: self-host on a separately approved host

Generate the minimal static site and place `site/` under the document root of an HTTPS static server such as Caddy or Nginx. See `ops/Caddyfile.example` (not deployed). This provides more security header control, but also requires maintaining TLS, DNS, availability and backups. **Do not use any machine or domain subject to an existing hold.**

## Build, tests and source

- `npm test` — pure rules-engine tests and isolated service-worker simulation (Node 18+; no dependency install needed).
- `python3 scripts/build_site.py && node --test tests/release.test.mjs` — create/verify the allowlisted website in `site/`.
- `python3 build.py` — regenerate the offline single-file `play.html`.
- `python3 tests/mobile_embed.py` — UI tests in Chromium using a standalone HTML page; requires `pip install playwright` and installed Chromium.
- `python3 tests/pwa_launch.py` — **requires an unrestricted local browser**; tests actual HTTP-served PWA manifest, service worker, offline restart, browser-save reload, mobile trading and CSP. Run before approval to publish if possible, then repeat equivalent tests at the final HTTPS URL.

Only ten allowlisted web assets enter the hosted bundle. `play.html`, source tests and build scripts are not published. Release engineering details are in [SECURITY.md](SECURITY.md) and [RELEASE_CHECKLIST.md](RELEASE_CHECKLIST.md).

## Saving and updates

Saves use `localStorage` under `blockclub.game.v1`. The app version is **1.0.1** and the save schema is **1**, preserving compatible 1.0.0 saves **on the same origin and storage partition**. Saved games do not sync between devices or domains, and may disappear if a browser clears site data or storage is evicted. Opening a local HTML file and later switching to a GitHub Pages URL does **not** transfer saves. A new game intentionally replaces the previous saved game.

The service worker uses a versioned, app-path-specific cache and precaches the site so subsequent visits can load without internet. Initial installation requires a secure HTTPS origin and an online visit to populate that cache. Real-device installation and airplane-mode behavior remain release acceptance gates.

## Intellectual property

BLOCK CLUB has original names, graphics and property branding; it is not affiliated with or endorsed by the owners of the Monopoly brand. This game uses simplified rules and is not a licensed copy of that product. No real-money gambling or commerce.
