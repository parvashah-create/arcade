# Community Plugin Submission Checklist

This checklist tracks Arcade's initial submission to the official Obsidian Community directory.

Canonical references:

- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin)
- [Submission requirements for plugins](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins)
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies)
- [Set up and claim](https://docs.obsidian.md/community-directory/set-up-and-claim)

## Repository preparation

- [x] Root `README.md` explains purpose, installation, use, privacy, support, and licensing.
- [x] Root `LICENSE` contains the MIT License.
- [x] Root `manifest.json` contains a unique lowercase ID, exact semantic version, tested minimum app version, short description, author, and desktop compatibility.
- [x] Root `versions.json` maps `0.1.0` to the tested Obsidian baseline.
- [x] Plugin description is under 250 characters, starts with an action, ends with a period, and uses no emoji.
- [x] No donation field is present because Arcade does not solicit funding.
- [x] Runtime code contains no telemetry, ads, remote requests, dynamic updates, Node.js imports, or Electron imports.
- [x] No ROM, copied commercial asset, recorded commercial audio, or game binary is included.
- [x] Originality, non-affiliation, privacy, and stored-data behavior are disclosed.
- [x] Public support, security reporting, contribution, changelog, and release documents exist.
- [x] The `arcade` ID and `Arcade` name were absent from the official registry on 2026-08-27.

## Verification

- [x] `npm ci` completes without a vulnerability report.
- [x] `npm run verify:metadata` passes.
- [x] `npm run lint` passes.
- [x] `npm run test` passes with 49 tests in 14 files.
- [x] `npm run build` creates non-empty `main.js`.
- [x] `styles.css` and `manifest.json` are non-empty release artifacts.
- [x] The production bundle scan finds no runtime network, Node.js, Electron, eval, or console patterns.
- [x] A simulated patch bump keeps `package.json`, `package-lock.json`, `manifest.json`, and `versions.json` aligned.
- [x] GitHub workflow and issue-form YAML parses successfully.
- [ ] Install the three release attachments—not repository files—in a clean vault and repeat the manual smoke test.

## GitHub release

- [x] Commit the complete source tree to `main`.
- [x] Make `https://github.com/parvashah-create/arcade` public.
- [x] Push `main` and confirm the **Verify plugin** workflow passes.
- [x] Confirm GitHub Actions may write release contents and attestations.
- [x] Create annotated tag `0.1.0`; do not use `v0.1.0`.
- [x] Confirm the release workflow publishes release `0.1.0`.
- [x] Confirm the release contains `main.js`, `manifest.json`, and `styles.css` as individual attachments.
- [x] Confirm the build provenance attestation appears for all three assets.
- [ ] Download the attachments and complete the clean-vault test.

## Community directory

- [ ] Sign in to [community.obsidian.md](https://community.obsidian.md) with the maintainer's Obsidian account.
- [ ] Connect the GitHub account that owns `parvashah-create/arcade`.
- [ ] Submit the public repository URL and select the correct owner.
- [ ] Review and accept the current Developer policies.
- [ ] Confirm ongoing maintenance responsibility.
- [ ] Resolve every automated scanner error. Publish an incremented version if a release change is required.
- [ ] Wait for directory publication and verify installation from **Settings → Community plugins**.

## After acceptance

- [ ] Announce the first public release only after it is installable from the directory.
- [ ] For every update, use `npm version patch`, `minor`, or `major`, then push `main` and the exact unprefixed tag.
- [ ] Never reuse or silently replace a published version.
- [ ] Keep `CHANGELOG.md`, compatibility metadata, and release notes current.
