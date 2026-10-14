// Development-only verification; the CLI/browser engine has no fixture dependency.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { COMPILED, findInText } from '../rules.js';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const sourceText = read('../tests/fixtures/feedhive-patterns.json');
const catalog = JSON.parse(sourceText);
const coverage = JSON.parse(read('../tests/fixtures/feedhive-coverage.json'));
assert.equal(createHash('sha256').update(sourceText).digest('hex'), coverage.sourceSha256,
  'Pinned source snapshot changed; verify its revision before updating expectations');
const upstream = catalog.categories.flatMap(c => c.patterns);
const ids = upstream.map(p => p.id);
assert.equal(ids.length, 120);
assert.equal(new Set(ids).size, 120);
assert.equal(coverage.patterns.length, 120);
assert.deepEqual(coverage.patterns.map(p => p.id).sort(), [...ids].sort(),
  'Every upstream ID must have exactly one verification entry');
const ruleIds = new Set(COMPILED.map(r => r.id));
const sorted = (items) => [...new Set(items)].sort();
const results = new Map();
const baselineIndex = process.argv.indexOf('--baseline');
const baseline = baselineIndex === -1 ? null
  : await import(pathToFileURL(resolve(process.argv[baselineIndex + 1])).href);
if (baseline) assert.equal(baseline.VERSION, coverage.baselineVersion, 'Wrong baseline engine version');
let probes = 0;
for (const entry of coverage.patterns) {
  assert.ok(entry.reason && entry.probes.length, `${entry.id}: missing decision/probe`);
  for (const rule of entry.relatedRules) assert.ok(ruleIds.has(rule), `${entry.id}: unknown rule ${rule}`);
  const checked = entry.probes.map(probe => {
    if (baseline) assert.deepEqual(
      sorted(baseline.findInText(probe.text, 'example.md', {}).diagnostics.map(d => d.rule)),
      probe.baselineMatches, `${entry.id}: recorded 0.5.0 results changed`);
    const matches = sorted(findInText(probe.text, 'example.md', {}).diagnostics.map(d => d.rule));
    const related = matches.filter(r => entry.relatedRules.includes(r));
    assert.deepEqual(related, sorted(probe.expectedRelatedRules),
      `${entry.id}: ${JSON.stringify(probe.text)}: relevant detection changed`);
    probes++;
    return { ...probe, matches, related,
      baselineRelated: probe.baselineMatches.filter(r => entry.relatedRules.includes(r)) };
  });
  results.set(entry.id, { ...entry, checked });
}
const entries = [...results.values()];
const matched = entries.filter(e => e.checked[0].related.length).length;
const releasedMatched = entries.filter(e => e.checked[0].baselineRelated.length).length;
const limited = entries.filter(e => !e.checked[0].related.length && e.relatedRules.length).length;
const deferred = entries.filter(e => !e.relatedRules.length).length;
const summary = `120 patterns, ${probes} probes: ${matched} representative examples detected (${releasedMatched} in 0.5.0), ${limited} limited/unmatched, ${deferred} deferred.`;

const html = text => text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('|', '&#124;');
const code = text => `<code>${html(text).replaceAll('\n', ' ↵ ')}</code>`;
const hits = (all, related) => {
  const other = all.filter(r => !related.includes(r));
  return (related.length ? related.map(code).join(', ') : 'None') +
    (other.length ? `<br>Incidental: ${other.map(code).join(', ')}` : '');
};
const lines = [
  '# Verification of all 120 FeedHive patterns', '',
  `Source: [pinned upstream catalog](${coverage.source}).`, '',
  summary, '',
  'These counts describe representative examples, not complete detection of every phrase or editorial concept in a pattern. Relevant rules are assigned explicitly; an unrelated finding does not count as coverage. Every ID has a probe and a decision, including intentionally unsupported patterns.', '',
  'The 0.5.0 column records results from the released tag’s engine. The candidate column is generated from the current engine, incorporating PR #16 and subsequent targeted fixes. Package and website versions are tracked separately.', '',
  'Quoted examples have their outer presentation quotes removed. Where upstream gives a description instead of literal prose, the fixture supplies an explicitly labeled rendered or description-derived example. Such examples do not establish factual accuracy or author intent.', '',
  'Run `npm run verify:feedhive` to verify expectations and the generated report. Run `node scripts/verify-feedhive.mjs --write` to regenerate this file after reviewing an intentional change. Fixtures include the unmodified upstream snapshot, input text, expected relevant rules, baseline matches, and the decision for each pattern.', '',
  'To independently recheck the recorded baseline, run `git show v0.5.0:rules.js > /tmp/style-doctor-v050-rules.mjs`, then `node scripts/verify-feedhive.mjs --baseline /tmp/style-doctor-v050-rules.mjs`.', '',
];
for (const category of catalog.categories) {
  lines.push(`## ${category.name}`, '', '| ID | Representative probe | 0.5.0 | Candidate | Decision and limits |', '| --- | --- | --- | --- | --- |');
  for (const pattern of category.patterns) {
    const result = results.get(pattern.id);
    const probe = result.checked[0];
    lines.push(`| ${pattern.id} | ${code(probe.text)}<br>${probe.origin} | ${hits(probe.baselineMatches, probe.baselineRelated)} | ${hits(probe.matches, probe.related)} | ${result.reason} |`);
  }
  lines.push('');
}
lines.push('## Variant and boundary probes', '',
  'These checks make selected gaps visible instead of assuming a match on one example covers every alternative. “None” is an explicit non-detection, not a passing detection claim.', '',
  '| ID | Additional probe | 0.5.0 | Candidate |', '| --- | --- | --- | --- |');
for (const entry of entries) for (const probe of entry.checked.slice(1))
  lines.push(`| ${entry.id} | ${code(probe.text)}<br>${probe.origin} | ${hits(probe.baselineMatches, probe.baselineRelated)} | ${hits(probe.matches, probe.related)} |`);
lines.push('', 'Meaningful discretion, genuine reframing, or deliberate author voice can still match a heuristic. No rule here proves AI authorship. Context, fabricated facts, unsupported claims, and structural quality still require editorial review.', '');
const report = lines.join('\n');
const reportPath = new URL('../docs/feedhive-verification.md', import.meta.url);
if (process.argv.includes('--write')) writeFileSync(reportPath, report);
else assert.equal(readFileSync(reportPath, 'utf8'), report, 'Verification report is stale; review and regenerate it');
console.log(summary);
