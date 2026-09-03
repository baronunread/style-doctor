# Changelog

This file lists all notable changes to the project. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project uses
[semantic versioning](https://semver.org/).

## [0.3.0] - 2026-09-03

### Added

- Scan prose inside template/component files, not just Markdown/text.
  `.astro`, `.jsx`, `.tsx`, `.html`, `.htm`, `.vue`, and `.svelte` are now
  discovered by default. A dependency-free, allowlist extractor pulls the
  linted prose from each file: JSX/HTML text nodes, and the values of `alt`,
  `aria-label`, `title`, `placeholder`, and `<meta name="description"
  content="...">`. It blanks frontmatter, `<script>`/`<style>` blocks, `{...}`
  expressions, tags, and any line that reads as code (identifiers, paths, class
  lists) length-preservingly, so `file:line:column` in findings stays exact.
  ([#2](https://github.com/baronunread/style-doctor/issues/2))
- `--no-templates` restricts the scan to `.md`/`.markdown`/`.mdx`/`.txt`.
- `-` reads prose to scan from stdin (already-extracted component text, a
  commit message, a diff). Combines with file/dir args; everything merges into
  one score. stdin is always treated as plain prose, even when `--stdin-name`
  ends in a template extension.
- `--stdin-name <label>` sets the `filePath` reported for stdin findings
  (default `<stdin>`).

## [0.2.0] - 2026-08-29

### Added

- `--exclude <globs>` and an `exclude` key in `.style-doctor.json` /
  `package.json` to skip paths.
- A persistent config file (`.style-doctor.json`, or a `"style-doctor"` key in
  `package.json`) with `exclude` and `ignore` lists; CLI flags add to them.

## [0.1.1] - 2026-08-28

### Fixed

- Empty output when run via `npx` / `bunx` — the symlinked bin shim broke the
  "run as CLI" entrypoint check.

## [0.1.0] - 2026-08-28

- Initial release: scan Markdown/text for LLM tells, filler, and naive grammar
  issues; 0-100 score; grouped findings; `--json`; CI exit codes.

[0.3.0]: https://github.com/baronunread/style-doctor/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/baronunread/style-doctor/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/baronunread/style-doctor/compare/171b17a...v0.1.1
