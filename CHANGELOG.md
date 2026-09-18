# Changelog

This file lists all notable changes to the project. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project uses
[semantic versioning](https://semver.org/).

## [0.4.2] - 2026-09-18

### Fixed

- `title-case-heading` compiled with the `i` flag along with every other rule,
  so its `[A-Z]` capitalization check matched lowercase words too (e.g.
  flagged `## For an AI`, where "an" isn't capitalized). Rules can now opt
  into case-sensitive matching.
- `superficial-ing` matched bare/plural forms ("highlights", "fosters") in
  addition to "-ing" forms, contradicting its own name and message. Narrowed
  to actual "-ing" forms only.

## [0.4.1] - 2026-09-18

### Added

- `rules.js` (the dependency-free rule engine, split out for the browser in
  0.4.0) is now a public subpath export: `import { findInText } from
  "style-doctor/rules.js"`. Powers the live demo at
  [style-doctor-site](https://github.com/baronunread/style-doctor-site).

## [0.4.0] - 2026-09-18

### Added

- Ten new rules drawn from
  [Wikipedia's Signs of AI writing](https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing)
  and the [avoid-ai-writing](https://github.com/conorbronsdon/avoid-ai-writing)
  pattern list:
  - LLM Tells: `superficial-ing`, `ai-vocab`, `copula-avoidance`,
    `legacy-praise`, `vague-attribution`.
  - Filler: `hedge-stack`.
  - A new "AI Artifacts" category with `ai-artifact` (error severity):
    chatbot sign-offs and leftover generation scraps such as `oaicite`,
    `utm_source=chatgpt.com`, and `citeturn0search0`.
  - A new "Formatting" category with `title-case-heading`,
    `inline-bold-bullet`, and doc-level `bold-density`.

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

[0.4.1]: https://github.com/baronunread/style-doctor/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/baronunread/style-doctor/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/baronunread/style-doctor/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/baronunread/style-doctor/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/baronunread/style-doctor/compare/171b17a...v0.1.1
