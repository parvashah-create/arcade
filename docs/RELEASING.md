# Releasing Monochrome Arcade

Monochrome Arcade follows [Semantic Versioning](https://semver.org/) and the current [Obsidian plugin submission process](https://docs.obsidian.md/plugins/releasing/submit-plugin).

Obsidian expects the GitHub release tag to exactly match `manifest.json` using the format `x.y.z` without a `v` prefix. Each release must attach `main.js`, `manifest.json`, and `styles.css`.

## Initial release

1. Make the GitHub repository public so Obsidian reviewers can inspect the source.
2. Under **Settings → Actions → General**, confirm workflows are allowed to create releases and attestations. The workflow declares only the permissions it needs.
3. Commit and push the complete `0.1.0` source to the default branch.
4. Confirm the **Verify plugin** workflow passes on `main`.
5. Create and push the exact annotated release tag:

   ```bash
   git tag -a 0.1.0 -m "0.1.0"
   git push origin main --follow-tags
   ```

6. Confirm the **Release plugin assets** workflow creates GitHub release `0.1.0` with these attachments:
   - `main.js`
   - `manifest.json`
   - `styles.css`
7. Download the three release attachments and manually install them in a clean test vault.
8. Sign in at [community.obsidian.md](https://community.obsidian.md), connect the GitHub account that owns the repository, and submit `https://github.com/parvashah-create/arcade`.
9. Resolve every automated scan or reviewer comment with a new version and release rather than replacing an existing release artifact.

## Later releases

Choose the smallest correct version increase:

- Patch, such as `0.1.1`, for backward-compatible fixes.
- Minor, such as `0.2.0`, for backward-compatible features or new games.
- Major, such as `1.0.0`, for incompatible behavior or data changes after the project reaches a stable public API.

Run one of the following from a clean `main` branch:

```bash
npm version patch
npm version minor
npm version major
```

The version lifecycle updates `package.json`, `package-lock.json`, `manifest.json`, and `versions.json`, then creates the matching Git commit and tag. Review the generated changes before pushing:

```bash
git show --stat
git push origin main --follow-tags
```

The tag triggers the release workflow. Never prefix the tag with `v`, edit a published release artifact in place, or reuse a version number.

## Compatibility versions

`versions.json` maps each Monochrome Arcade version to its minimum supported Obsidian version. If a future release requires a newer Obsidian API, update `minAppVersion` in `manifest.json` before running `npm version`.

## Release checklist

- [ ] Update `CHANGELOG.md` and move relevant entries out of `Unreleased`.
- [ ] Confirm metadata and versions use exact `x.y.z` values.
- [ ] Run `npm ci` and `npm run check`.
- [ ] Test the production artifacts in a clean vault.
- [ ] Verify keyboard navigation, pause behavior, sound cleanup, and data persistence.
- [ ] Verify the GitHub release has all three required assets.
- [ ] Verify the release tag exactly matches `manifest.json`.
