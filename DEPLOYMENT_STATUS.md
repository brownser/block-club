# BLOCK CLUB 1.0.1 — deployment status (2026-11-08)

## Current state
- Repository: https://github.com/brownser/block-club (PUBLIC; personal account `brownser`; branch `main`).
- Source commit initially published: `f320fc8302740416a76ca857a2ebff61185913fe`.
- GitHub Pages: configured for `build_type=workflow`, HTTPS enforced, deployment environment `github-pages` restricted to exact branch `main`.
- **Live game: NOT DEPLOYED.** The repository contains only ordinary game source, tests and documentation. The deployment workflow was deliberately withheld when GitHub rejected permission to create or update `.github/workflows/publish-pages.yml`.
- Refusal: `refusing to allow an OAuth App to create or update workflow ... without workflow scope`. Do not retry with another credential or publish by an unprotected route.
- Felix/Zeus/Lucy and other protected infrastructure were not used or changed. No Vercel.

## Verification completed
- 20/20 rules-engine and service-worker simulation tests.
- 3/3 static-release checks after building the ten-asset public bundle.
- 8/8 Chromium touch/mobile UI checks at 320, 390, 412 and 1280px, repeated successfully after making the test robust to an outstanding informational game dialog. These are desktop-browser simulations, NOT real Android evidence.
- SHA-256 verification of the isolated source-transfer archive on APOLLO before extraction. No public workflow or Pages deployment was dispatched.

## Required permission before publication
1. The `brownser` owner must explicitly approve the normal GitHub OAuth `workflow` scope for the existing authenticated GitHub CLI connection on APOLLO. The standard owner-operated command is `gh auth refresh -h github.com -s workflow` (follow GitHub's interactive consent prompts; do not send tokens in chat).
2. Confirm the resulting actor is still `brownser`, the workflow scope is granted, the remote `main` commit is current, and the `github-pages` environment still restricts deployments to `main`.
3. Add the reviewed, manual-only `.github/workflows/publish-pages.yml` from the isolated release workspace. Do not change its explicit `approve_publication` input. Rerun checks.
4. Manually dispatch the workflow with `approve_publication=true`; observe successful test, build, upload and deploy jobs. Record run URL, exact commit, HTTPS site and asset hashes.
5. On a physical Android device verify installation from Chrome, standalone launch, saved progress after app relaunch, airplane-mode restart and offline moves, touch dialogs, game mechanics and no unexpected requests.

## Release disposition
Source is public. GitHub Pages is configured but not live. No alternate deployment path is authorized to circumvent the rejected workflow permission. Final production acceptance remains pending a successful GitHub Pages deployment and actual Android-device verification.
