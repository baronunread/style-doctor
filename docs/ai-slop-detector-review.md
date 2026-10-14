# FeedHive catalog review

Reviewed all 120 patterns in [FeedHive's catalog at
95d5507](https://github.com/FeedHive/ai-slop-detector/blob/95d550706040191b0e75f1d89296a648bacb126e/patterns.json)
on 2026-10-14. The upstream list is editorial guidance, not an executable
linter. The regexes here are style-doctor implementations of selected ideas.
No dependency, network call, or installed agent skill is required.

**Existing** means an existing heuristic covers at least part of the pattern.
**Extended** means this PR adds variants to that rule. **New** names an added
rule. None of these labels promises complete semantic coverage. **Deferred**
means the pattern needs context that this engine cannot reliably infer, or
would flag too much ordinary prose.

## Selection

Keep stable existing rule IDs and the browser-compatible, line-based regex
engine. The initial integration added 18 rules: 16 warnings and two errors.
A follow-up adds `quiet-hype` as a warning for selected achievement/change verbs
after “quietly”, including “quietly built a system”. Warnings affect the score but
do not block CI under the default `--blocking error`; `--blocking warning`
blocks them too. Only explicit assistant editing offers and draft introductions
are new errors. Placeholders remain warnings because reusable templates use
them intentionally.

## Vocabulary

| Upstream IDs | Decision and coverage |
| --- | --- |
| V-01 | Existing: `delve`, `deep-dive`; ordinary discussion verbs remain allowed. |
| V-02 | Existing: `tapestry`, `landscape`, `realm`; do not ban literal fabrics or technical ecosystems. |
| V-03 | Existing: `testament`; other praise needs context. |
| V-04 | Existing: `intensifier-cluster`, `copula-avoidance`; keep technical “critical” allowed. |
| V-05, V-06 | Existing: `superficial-ing` catches selected participles; other verb forms need context. |
| V-07 | Existing: `leverage`; do not broadly ban literal harnesses or financial capitalization. |
| V-08 | Extended: `unlock` gains full-potential, harness-potential, and next-level phrases; existing `elevate`. |
| V-09 | Existing: `seamless`, `robust`, `cutting-edge`; no broader adjective ban. |
| V-10, V-11, V-12 | Existing: `ai-vocab` catches selected words; common “complex”, “rich”, and “dynamic” remain allowed. |
| V-13 | Existing: `navigate` catches selected abstract objects; journeys and paths need context. |
| V-14 | Existing: `game-changer`; other adjectives can describe real changes. |
| V-15 | Existing: `connective-overload`, `hedge-stack`; do not ban every transition. |
| V-16, V-18, V-19 | Deferred: these words and collocations have frequent literal or useful meanings. |
| V-17 | New: `quiet-hype` catches “quietly” before selected achievement/change verbs (build, create, launch, ship, transform, reshape, crept up). Ordinary sound descriptions remain allowed; “silently” and “subtly” are deferred. |
| V-20 | Extended: `todays-world` gains smart apostrophes, digital-world/age, and now-more-than-ever variants. Generic “in an era of” remains allowed. |

## Stock phrases

| Upstream IDs | Decision and coverage |
| --- | --- |
| P-01 | Extended: `important-to-note` gains smart apostrophes, expanded forms, and “it should be noted”. Remove overlapping “it's worth noting” from `hedge-stack`. |
| P-02 | New: `at-its-core`; existing `at-end-of-day`. Do not ban “ultimately”. |
| P-03 | Existing: `when-it-comes-to`, `wordy-phrase`, `world-of`; “in terms of” can state units. |
| P-04 | Existing: `deep-dive`; ordinary invitations to start remain allowed. |
| P-05 | Existing: `copula-avoidance` catches qualified role phrases; causal statements need context. |
| P-06 | Existing: `copula-avoidance`; “acts as” is often a precise technical description. |
| P-07 | Existing: `navigate`; nuanced subjects and ordinary “ins and outs” need context. |
| P-08 | Deferred: alternatives may express actual audience coverage or conditions. |
| P-09 | New: `hollow-promise` catches specific generic sales/guide claims. |
| P-10 | Extended: `unlock` handles selected hype variants. |
| P-11 | New: `conversational-preface` catches selected staged honesty and conversation phrases. |
| P-12 | New: `truth-preface` catches selected dramatic truth claims. |
| P-13 | Existing: `ai-artifact` catches explicit assistant sign-offs; ordinary contact invitations remain allowed. |
| P-14 | Extended: `in-conclusion` gains sum-up/recap variants; keep ordinary “overall” allowed. |
| P-15 | New: `vague-future` catches four specific future cliches. |

## Sentence patterns

| Upstream IDs | Decision and coverage |
| --- | --- |
| S-01 | Extended: `its-not-x-its-y` gains same-line period reversals, smart apostrophes, and “this/it isn't” variants. |
| S-02 | Existing: `not-just-but`. |
| S-03, S-04 | Deferred: distinguishing rhetorical reframing/negative lists from factual corrections requires context. |
| S-05 | New: `rhetorical-qa` catches a small set of stock questions followed immediately by “because”, “it”, or “this”. No generic ban on questions or FAQs. |
| S-06 | New: `reader-question` catches two question-announcing phrases. |
| S-07, S-10 | New: `part-reveal` catches best/useful/exciting-part setups followed by a colon or “is”. Ordinary uses of “part” remain allowed. |
| S-08 | New: `faux-insight` catches selected hidden-insight hooks. |
| S-09 | New: `dramatic-transition` catches selected significance announcements. |
| S-11 | Deferred: metaphor interpretation requires context. |
| S-12 | Existing: `superficial-ing`; no grammatical parsing of trailing clauses. |
| S-13, S-14, S-15 | Deferred: triples, synonyms, and “one” are frequently useful; detecting reflexive use needs context. |
| S-16 | Existing: `boasts`; normal verbs such as “offers” remain allowed. |
| S-17 | New: `imagine-world` catches specific hypothetical openers. |
| S-18 | Extended: `hedge-stack` gains may/might-potentially and could/may/might-possibly combinations. Useful uncertainty remains allowed. |
| S-19, S-20, S-21, S-22 | Deferred: tradeoffs, ranges, emphasis, and corrections can carry real information. |

## Structure and rhythm

| Upstream IDs | Decision and coverage |
| --- | --- |
| R-01, R-02 | Existing: `staccato-sentences` covers only same-line paired comparative slogans. Broader paragraph/fragment rhythm is deferred. |
| R-03, R-04, R-05, R-06, R-07 | Deferred: repeated starters, uniform sentence shape, inventories, bullets, and short sections need document context. |
| R-08 | Extended: `in-conclusion` catches the explicit “to recap” marker; semantic repetition is deferred. |
| R-09, R-10, R-11, R-12 | Deferred: ending quality, outlook, conversational voice, and section density require context. |

## Imagery and metaphor

| Upstream IDs | Decision and coverage |
| --- | --- |
| M-01, M-02, M-03, M-04, M-05 | Deferred: metaphor and literal technical usage cannot be reliably separated with word bans. |
| M-06 | New: `secret-sauce` catches three specific cliches; ordinary “magic” remains allowed. |

## Substance

| Upstream IDs | Decision and coverage |
| --- | --- |
| C-01 | Existing: `intensifier-cluster` catches selected praise words, not the importance of the claim. |
| C-02 | Existing: `vague-attribution`; do not ban every “many believe” or claim of regard. |
| C-03, C-04, C-05, C-06, C-07 | Deferred: specificity, portability, profundity, and factual invention need source/context review. |
| C-08 | Existing: `hedge-stack` catches selected introductory adverbs; surprise can be meaningful. |
| C-09, C-10, C-11 | Deferred: notability, balance, and actionable advice need context. |
| C-12 | New: `hollow-promise` catches guide/completeness claims; no generic judgment of all promises. |

## Formatting and punctuation

| Upstream IDs | Decision and coverage |
| --- | --- |
| F-01 | Existing: `em-dash-density`. |
| F-02 | Existing: `bold-density`. |
| F-03 | New: `emoji-bullet` catches four common emoji markers at the start of a line, optionally after a Markdown bullet. In-sentence emoji remain allowed. |
| F-04 | Existing: `title-case-heading` for Markdown headings. |
| F-05 | Existing: `inline-bold-bullet`. |
| F-06 | Deferred: Markdown is valid in this tool's primary input formats; destination is unknown. |
| F-07 | Deferred: typography mixes occur in quoted names and imported text; no automatic normalization. |
| F-08 | Deferred: ordinary enthusiasm is not a sufficient signal. |
| F-09 | Deferred: mathematical Unicode also represents actual mathematical notation; prose/notation classification needs care. |
| F-10 | Deferred: small tables can improve comparisons. |

## Chatbot residue

| Upstream IDs | Decision and coverage |
| --- | --- |
| B-01 | Existing: `ai-artifact` catches selected assistant exclamations; ordinary enthusiasm remains allowed. |
| B-02 | Deferred: agreement and praise can be authentic, especially in replies. |
| B-03 | New: `assistant-offer` catches explicit rewrite/revision/length/tone offers, not ordinary offers to send something. |
| B-04 | New: `assistant-draft-intro` catches specific generated-version lead-ins naming the reader's draft. |
| B-05 | New: `unfilled-placeholder` catches selected bracketed placeholders and XX-percent tokens. Markdown link labels are excluded. |
| B-06 | Extended: `ai-artifact` catches “as an AI language model” and “as an AI” before comma/semicolon/colon punctuation. Professional descriptions such as “as an AI researcher” remain allowed. |
| B-07 | Deferred: acknowledging missing sources may be necessary and honest. |
| B-08 | Extended: `ai-artifact` catches turn/search/view/fetch markers; numeric citations such as [1] remain allowed. |

## Social media and LinkedIn

| Upstream IDs | Decision and coverage |
| --- | --- |
| L-01 | Deferred: a broader version of R-01 needs paragraph-level context. |
| L-02 | Deferred: hooks can state actual events or useful instructions. |
| L-03 | New: `announcement-preface` catches first-person stock announcement reactions. |
| L-04 | New: `engagement-bait` catches selected reader-reaction slogans. |
| L-05, L-06, L-07, L-08, L-09 | Deferred: questions, lessons, personal framing, threads, and hashtags depend on the publishing context. |
| L-10 | New: `engagement-bait` catches the explicit post/tweet-ending slogan on the same line. |
| L-11 | Deferred: repost requests can be intentional calls to action. |
| L-12 | New: `engagement-bait` catches the specific no-fluff/just-value slogan; ordinary “straight to the point” remains allowed. |
| L-13, L-14, L-15 | Deferred: generic replies, vulnerability, and contrarian claims need context and fact checking. |

## Limits and validation

Rules scan one extracted prose line at a time. Wrapped phrases and reversals
across lines are not detected. Code fences, inline code, and blockquotes remain
excluded; matching quoted words inside ordinary prose is still possible.
Smart apostrophes are supported in the selected new phrases and extended rules,
not globally normalized. Template entity decoding is outside this change.

These are editing prompts, not authorship detection. For example, a literal
“at its core” description or a factual “It's not available. It's on backorder.”
can match. Source citations may follow a phrase caught by `vague-attribution`.
`quiet-hype` can also match meaningful discretion (for example, a confidential
launch); the regex cannot determine whether that detail matters to the story.
Read the surrounding sentence before rewriting. Use `--ignore` for intentional
style and reusable templates; use `--only` to select a narrower rule set.

`npm test` checks every new rule and each extended rule with positive examples,
nearby nonmatching prose, severity, stable IDs/locations, rule filters, and
code/quote exclusions. All new phrase rules except the Markdown emoji marker
also run through HTML prose extraction. Existing scanner/report tests remain
in place. Versions and release tags are unchanged; this is an unreleased PR.
