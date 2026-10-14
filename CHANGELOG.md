# Changelog

This file lists all notable changes to the project. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project uses
[semantic versioning](https://semver.org/).

## [Unreleased]

### Fixed

- `dramatic-transition` detects "changed everything" and other change-verb
  variants without requiring the subject "this".
- `engagement-bait` detects standalone "Agree?" / "Thoughts?" lines, optionally
  followed by 👇, including short text nodes in templates.

## [0.5.1] - 2026-10-14

### Added

- `quiet-hype` warns about "quietly" before selected achievement/change verbs,
  including "quietly built a system". Ordinary low-noise descriptions such as
  "quietly spoke" remain allowed; meaningful discretion still needs context.
- `commentary-praise`, `journey-hype`, and `question-reversal` warn about selected
  significance commentary, abstract embark-on-journey openers, and stock
  question/problem reversals missed by the initial FeedHive integration.
- Reproducible verification of all 120 upstream patterns with 218 probes,
  a pinned source snapshot, recorded 0.5.0 results, and explicit detection limits.

### Changed

- `ai-artifact` catches "Hope this helps" with or without the initial "I".
- `inline-bold-bullet` catches bold colon-label lines with or without a bullet,
  retaining its existing rule ID.

## [0.5.0] - 2026-10-14

### Added

- Eighteen selected FeedHive ai-slop-detector rules for stock hooks, filler
  prefaces, vague promises, engagement slogans, emoji list markers, unfilled
  placeholders, and leftover assistant draft introductions/editing offers.
  Style checks are warnings; explicit assistant draft residue is an error.
- A review mapping all 120 upstream patterns to existing, extended, new, or
  deferred checks, with the limits of the regex heuristics documented.

### Changed

- Extended `its-not-x-its-y`, `unlock`, `todays-world`, `important-to-note`,
  `in-conclusion`, `hedge-stack`, and `ai-artifact` with selected variants.
- Removed duplicate `hedge-stack` findings for "it's worth noting", which is
  already reported by `important-to-note`.

## [0.4.4] - 2026-10-08

### Fixed

- Corrected the runtime version reported by `style-doctor --version` and JSON
  output, which remained at 0.4.2 in the 0.4.3 package.

## [0.4.3] - 2026-10-08

### Added

- `staccato-sentences` (warning, LLM Tells) detects same-line pairs of short
  comparative claims such as "More reliable. Less expensive." and "Sleep
  better. Live longer." Guidance tells agents to avoid the pattern in landing
  pages and combine the claims into one specific sentence.
- Template extraction retains these short slogan pairs for linting.

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
[0.4.4]: https://github.com/baronunread/style-doctor/compare/v0.4.3...v0.4.4
[0.4.3]: https://github.com/baronunread/style-doctor/compare/v0.4.2...v0.4.3
[0.4.0]: https://github.com/baronunread/style-doctor/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/baronunread/style-doctor/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/baronunread/style-doctor/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/baronunread/style-doctor/compare/171b17a...v0.1.1

[0.5.0]: https://github.com/baronunread/style-doctor/compare/v0.4.4...v0.5.0
[0.5.1]: https://github.com/baronunread/style-doctor/compare/v0.5.0...v0.5.1
