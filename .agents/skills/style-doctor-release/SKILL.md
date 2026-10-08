---
name: style-doctor-release
description: Release the style-doctor npm package and update its companion website. Use when preparing or shipping a version of either repository.
---

# Release style-doctor and its site

Coordinate the package repository (`~/Code/Products/style-doctor`) with the companion site (`~/Code/Products/style-doctor-site`). The package version appears in the site's header from its installed package, so a site version update requires refreshing that dependency and lockfile.

## Package release

1. Inspect both repositories, their current branches, working trees, tags, and release workflows. Preserve unrelated user changes.
2. Choose the next version from the package's existing semver and release history. Update `package.json`, the matching `rules.js` `VERSION` constant, the README's illustrative JSON version, and `CHANGELOG.md` with a dated release section and compare link. Include only changes actually shipping.
3. Review the release diff and `git diff --check`. The release workflow in `.github/workflows/release.yml` runs `node cli.js --selftest` and publishes with npm provenance when a `v*` tag is pushed. Create a versioned release commit and annotated `vX.Y.Z` tag only when the user has asked to release. Push the tag to trigger publishing, then check the GitHub Actions run and confirm the package version is available before updating the site.

## Site update

1. In the site repository, update the `style-doctor` dependency in `package.json` to the released version range and refresh `package-lock.json` so it resolves that exact release. The header component reads the installed package's `package.json` version.
2. Update any version-pinned examples, especially the Style Doctor GitHub Actions snippet in `src/pages/repos.astro` (`npx --yes style-doctor@X.Y.Z --quiet`). Keep intentional historical scan snapshot versions as recorded unless the user also asks to regenerate those snapshots; when refreshing them, use one engine version for the batch.
3. Run `npm ci` before building if the existing `node_modules` may be stale; a lockfile-only refresh leaves installed packages unchanged. Build the site before shipping. Push site changes to its production branch (`main`) only when site release is part of the request. Cloudflare Pages is configured to deploy the production branch; check the deployment result and verify the rendered header version.

Treat publishing the npm package and pushing to the site's production branch as external changes. Do not infer authorization for those steps from a request to edit local files; complete the release preparation and request approval immediately before a missing external authorization would be needed.
