# Security design, limits and release controls

This is an offline-first, client-only game, not an authenticated application.

- **No back end, accounts or cloud storage.** The only stored user data is a game state and game preferences in local browser storage. Nothing is intentionally transmitted to a game server. GitHub Pages itself may log visitor IP addresses under GitHub's infrastructure policies.
- **No external runtime dependencies.** No third-party fonts, images, scripts, ad SDK, analytics, remote game logic, API keys or secrets are required. Only a small allowlist of static files is published.
- **DOM escaping.** Player-provided names and game log text are HTML-escaped before insertion into templates. Settings are type-checked and the saved game performs basic shape validation on load. This is not designed to import untrusted save files.
- **Content security policy.** The hosted HTML uses a meta CSP blocking inline JavaScript, external JS, object/embed, frames and unauthorized origins. Inline CSS styles remain permitted because the board uses generated CSS variables. A meta CSP **cannot** set `frame-ancestors`; GitHub Pages does not provide site-defined security response headers in this deployment. If clickjacking protection or strict response headers are a requirement, use an approved self-hosted HTTPS host with the example Caddy header policy.
- **Service worker.** Precache of known static assets, isolated to the published subpath; no interception of other domains, other site paths, POST requests or unrelated same-path resources. Caches are versioned to support updates. Offline fallback is triggered for navigation network failures. It does not act as authenticated proxy or cache data returned by APIs.
- **GitHub Actions.** Deployment is manual-only, requires an explicit confirmation input, runs tests before publication, scopes deploy token to Pages + OIDC for the deployment job, and uses the `github-pages` environment. Protect the repository and the environment before first publication.
- **Known limitations.** `localStorage` can be evicted or cleared by the user/OS; there is no export/restore or cloud backup. Browser CSP and actual Android PWA behavior need live testing after HTTPS publication. GitHub Pages is a public host even for some private repositories. The HTML file edition cannot be installed as a PWA from `file://` and does not use the hosted CSP. A direct website rollback cannot restore an already-cleared local save.

Do not deploy into Felix, Zeus or Lucy; their independent authorization and holds are out of scope.
