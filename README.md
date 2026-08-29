# style-doctor

`react-doctor` for prose. Point it at a folder of Markdown/text; it scans,
groups findings by rule, prints a **0–100 score**, and **exits non-zero when
blocking issues are present**, so it drops straight into CI. Single file, zero
dependencies, Node ≥18.

It looks for LLM tells (`delve`, `rich tapestry`, `not just X, but Y`, em-dash
overuse, `it's important to note`) and filler/grammar problems (weasel words,
wordy phrases, passive voice).

## Use

```
npx style-doctor                  # scan ./
npx style-doctor docs/            # scan a folder
npx style-doctor CHANGELOG.md     # scan specific files
```

Output mirrors react-doctor: an agent-guidance header, `Scanned N files`, a
score line, a per-category issue count, then grouped findings
(`rule`, then `file:line:col` per occurrence).

```
✔ Scanned 12 files in 21ms

Style Doctor — my-docs
Score: 78 / 100 Needs work

6 issues
LLM Tells: 6 errors

✖ Filler word "delve" ×4
  style-doctor/delve
  guide.md:5:21
  ...
```

## CI

```yaml
- run: npx style-doctor --scope changed --quiet
```

- **Exit 0/1.** `1` when blocking issues exist. `--blocking error` (default) blocks
  on error-severity findings; `--blocking warning` blocks on any; `--blocking none`
  is advisory-only.
- **`--scope changed`** limits the scan to files changed vs `git HEAD` (`--base <ref>`
  to compare against a PR base). Fast pre-commit / PR checks.
- **`--min <n>`** also fails if the score drops below `n`.
- **`--quiet`** drops the guidance header and footer.
- **`--score`** prints just the number.

## For an AI

```
npx style-doctor --json          # full report, suppresses other output
npx style-doctor --json-compact  # same, one line
```

```json
{
  "schemaVersion": 1, "tool": "style-doctor", "version": "0.1.1",
  "ok": false, "score": 78, "label": "Needs work", "words": 640,
  "summary": { "issues": 6, "errors": 6, "warnings": 0, "filesWithIssues": 1,
               "byCategory": { "LLM Tells": { "errors": 6, "warnings": 0 } } },
  "diagnostics": [
    { "filePath": "guide.md", "rule": "delve", "category": "LLM Tells",
      "severity": "error", "title": "Filler word \"delve\"",
      "message": "...", "help": "Use \"look at\", \"go into\", or cut.",
      "line": 5, "column": 21, "match": "delve",
      "id": "guide.md::5:21::style-doctor/delve" }
  ]
}
```

Finding `id`s are stable (`<file>::<line>:<col>::style-doctor/<rule>`). Loop:
scan → apply `help` at each `line:col` → re-scan until `ok` / your `--min`.

## Options

`--category "LLM Tells"|Filler|Grammar` (repeatable, display filter; score stays
global) · `--no-warnings` · `--only a,b` · `--ignore a,b` · `--exclude a,b`
(skip paths, globs) · `--no-color` / `NO_COLOR` · `--rules` · `--selftest`.

Persistent config: a `.style-doctor.json` file, or a `"style-doctor"` key in
`package.json`:

```json
{ "exclude": ["vendor/**", "CHANGELOG.md"], "ignore": ["passive-voice"] }
```

`exclude` skips paths (globs, matched at any depth: `**` spans directories, `*`
stays in one segment); `ignore` skips rule ids. CLI `--exclude` / `--ignore` add
to the config lists.

Use it as a library too: `import { buildReport } from "style-doctor"`, then
`buildReport(dir, opts)` returns the same object as `--json`.

## Scoring

`score = 100 − 4 × (weighted findings per 100 words)`, clamped 0–100.
Weights: error 3, warning 1. Label: ≥90 Excellent, ≥80 Healthy, ≥50 Needs work,
else Critical.

## Prior art

[Vale](https://vale.sh) and [proselint](https://github.com/amperser/proselint)
are the established prose linters, with richer engines, but no single score, no
react-doctor-style grouped report, and setup to do. `style-doctor` trades
breadth for one zero-config command tuned for LLM tells: scan → score → gate.

Passive-voice detection is a naive regex (no POS tagger); pass `--ignore
passive-voice` if it's noisy for reference docs.

## Credits

Simon Willison's
[**llm-cliche-highlighter**](https://github.com/simonw/tools/blob/main/llm-cliche-highlighter.html)
([tools.simonwillison.net](https://tools.simonwillison.net/llm-cliche-highlighter))
inspired the LLM-tell rules. It is a browser tool that highlights the words and
constructions LLMs overuse; this project turns that idea into a scored,
CI-friendly CLI. Thanks, Simon.

The output format and CI ergonomics follow
[react-doctor](https://github.com/millionco/react-doctor).

## License

[MIT](./LICENSE) © Andrea Bruno
