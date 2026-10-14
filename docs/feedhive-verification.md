# Verification of all 120 FeedHive patterns

Source: [pinned upstream catalog](https://github.com/FeedHive/ai-slop-detector/blob/95d550706040191b0e75f1d89296a648bacb126e/patterns.json).

120 patterns, 223 probes: 61 representative examples detected (54 in 0.5.0), 4 limited/unmatched, 55 deferred.

These counts describe representative examples, not complete detection of every phrase or editorial concept in a pattern. Relevant rules are assigned explicitly; an unrelated finding does not count as coverage. Every ID has a probe and a decision, including intentionally unsupported patterns.

The 0.5.0 column records results from the released tag’s engine. The candidate column is generated from the current engine, incorporating PR #16 and subsequent targeted fixes. Package and website versions are tracked separately.

Quoted examples have their outer presentation quotes removed. Where upstream gives a description instead of literal prose, the fixture supplies an explicitly labeled rendered or description-derived example. Such examples do not establish factual accuracy or author intent.

Run `npm run verify:feedhive` to verify expectations and the generated report. Run `node scripts/verify-feedhive.mjs --write` to regenerate this file after reviewing an intentional change. Fixtures include the unmodified upstream snapshot, input text, expected relevant rules, baseline matches, and the decision for each pattern.

To independently recheck the recorded baseline, run `git show v0.5.0:rules.js > /tmp/style-doctor-v050-rules.mjs`, then `node scripts/verify-feedhive.mjs --baseline /tmp/style-doctor-v050-rules.mjs`.

## Vocabulary

| ID | Representative probe | 0.5.0 | Candidate | Decision and limits |
| --- | --- | --- | --- | --- |
| V-01 | <code>Let's delve into the data.</code><br>upstream example (outer quotes removed) | <code>delve</code> | <code>delve</code> | Selected delve/dive phrases only; unpack and explore are ordinary verbs. |
| V-02 | <code>the ever-evolving landscape of marketing.</code><br>upstream example (outer quotes removed) | <code>landscape</code> | <code>landscape</code> | Selected metaphors only; literal and technical nouns are not broadly banned. |
| V-03 | <code>The launch is a testament to the team's dedication.</code><br>upstream example (outer quotes removed) | <code>testament</code> | <code>testament</code> | Testament is detected; beacon, embodiment, and hallmark are not. |
| V-04 | <code>plays a pivotal role in growth.</code><br>upstream example (outer quotes removed) | <code>copula-avoidance</code>, <code>intensifier-cluster</code> | <code>copula-avoidance</code>, <code>intensifier-cluster</code> | Selected praise words/role phrases; critical is allowed for technical use. |
| V-05 | <code>The results underscore the importance of testing.</code><br>upstream example (outer quotes removed) | None | <code>commentary-praise</code> | Fix: selected significance objects after commentary verbs; ordinary highlighting remains allowed. |
| V-06 | <code>fostering a culture of innovation.</code><br>upstream example (outer quotes removed) | <code>superficial-ing</code> | <code>superficial-ing</code> | Only selected participles; cultivate and nurture are not blanket bans. |
| V-07 | <code>Leverage AI to streamline your workflow.</code><br>upstream example (outer quotes removed) | <code>leverage</code> | <code>leverage</code> | Leverage is detected; utilize and literal harness/capitalization are not. |
| V-08 | <code>Elevate your content strategy.</code><br>upstream example (outer quotes removed) | <code>elevate</code> | <code>elevate</code> | Selected benefit phrases only; enhance, empower, supercharge, and amplify are not blanket bans. |
| V-09 | <code>a seamless, robust solution.</code><br>upstream example (outer quotes removed) | <code>robust</code>, <code>seamless</code> | <code>robust</code>, <code>seamless</code> | Selected marketing adjectives; best-in-class/world-class are not included. |
| V-10 | <code>the intricate interplay of factors.</code><br>upstream example (outer quotes removed) | <code>ai-vocab</code> | <code>ai-vocab</code> | Intricate/interplay detected; ordinary complex and nuanced remain allowed. |
| V-11 | <code>meticulously crafted templates.</code><br>upstream example (outer quotes removed) | <code>ai-vocab</code> | <code>ai-vocab</code> | Meticulous detected; painstakingly and carefully crafted are not included. |
| V-12 | <code>a vibrant community of creators.</code><br>upstream example (outer quotes removed) | <code>ai-vocab</code> | <code>ai-vocab</code> | Vibrant detected; common rich, dynamic, thriving, and bustling remain allowed. |
| V-13 | <code>embark on your SEO journey.</code><br>upstream example (outer quotes removed) | None | <code>journey-hype</code> | Fix: embark-on selected abstract journeys; ordinary trips/paths remain allowed. |
| V-14 | <code>This feature is a game changer.</code><br>upstream example (outer quotes removed) | <code>game-changer</code> | <code>game-changer</code> | Game changer detected; other adjectives can describe real changes. |
| V-15 | <code>Additionally, the tool supports exports.</code><br>upstream example (outer quotes removed) | <code>connective-overload</code> | <code>connective-overload</code> | Selected connectives/aside markers; Importantly is not included. |
| V-16 | <code>a truly remarkable result.</code><br>upstream example (outer quotes removed) | None | None | Deferred: intensifiers can convey real degree; no blanket word ban. |
| V-17 | <code>Costs quietly crept up.</code><br>upstream example (outer quotes removed) | None | <code>quiet-hype</code> | Fix: quietly before selected achievement/change verbs; sound descriptions and silently/subtly remain allowed. |
| V-18 | <code>content that resonates with your audience.</code><br>upstream example (outer quotes removed) | None | None | Deferred: alignment/resonance can have precise literal or technical meanings. |
| V-19 | <code>The key takeaway is consistency.</code><br>upstream example (outer quotes removed) | None | None | Deferred: key can identify genuinely important findings; no blanket collocation ban. |
| V-20 | <code>In today's fast-paced digital world, content is king.</code><br>upstream example (outer quotes removed) | <code>todays-world</code> | <code>todays-world</code> | Selected era openers; general in-an-era-of is not included. |

## Stock phrases

| ID | Representative probe | 0.5.0 | Candidate | Decision and limits |
| --- | --- | --- | --- | --- |
| P-01 | <code>It's worth noting that the API is rate limited.</code><br>upstream example (outer quotes removed) | <code>important-to-note</code> | <code>important-to-note</code> | Selected note-announcing phrases; duplicate scoring removed. |
| P-02 | <code>At its core, marketing is about people.</code><br>upstream example (outer quotes removed) | <code>at-its-core</code> | <code>at-its-core</code> | Selected framing phrases; ultimately remains allowed. |
| P-03 | <code>When it comes to scheduling, timing matters.</code><br>upstream example (outer quotes removed) | <code>when-it-comes-to</code> | <code>when-it-comes-to</code> | Selected padding; in terms of can state units and remains allowed. |
| P-04 | <code>Ready? Let's dive in!</code><br>upstream example (outer quotes removed) | <code>deep-dive</code> | <code>deep-dive</code> | Dive phrases detected; ordinary invitations to start remain allowed. |
| P-05 | <code>Hashtags play a role in reach.</code><br>upstream example (outer quotes removed) | None | None | Only qualified role phrases; the unqualified upstream example is NOT detected. Causal wording needs context. |
| P-06 | <code>The dashboard serves as a central hub.</code><br>upstream example (outer quotes removed) | <code>copula-avoidance</code> | <code>copula-avoidance</code> | Serves/stands/functions as detected; precise technical acts-as remains allowed. |
| P-07 | <code>helping you navigate the complexities of SEO.</code><br>upstream example (outer quotes removed) | <code>navigate</code> | <code>navigate</code> | Selected navigate phrases; nuances/ins and outs are not broad bans. |
| P-08 | <code>Whether you're a solo creator or a global brand, ...</code><br>upstream example (outer quotes removed) | None | None | Deferred: audience alternatives and conditions may be meaningful. |
| P-09 | <code>Looking for a scheduler? Look no further.</code><br>upstream example (outer quotes removed) | <code>hollow-promise</code> | <code>hollow-promise</code> | Selected generic sales/guide promises. |
| P-10 | <code>Unlock the full potential of your content.</code><br>upstream example (outer quotes removed) | <code>unlock</code> | <code>unlock</code> | Selected power/potential/next-level phrases; not every possible benefit claim. |
| P-11 | <code>Here's the thing: most people quit.</code><br>upstream example (outer quotes removed) | <code>conversational-preface</code> | <code>conversational-preface</code> | Selected conversation/honesty prefaces; not an intent classifier. |
| P-12 | <code>The hard truth is that SEO takes time.</code><br>upstream example (outer quotes removed) | <code>truth-preface</code> | <code>truth-preface</code> | Selected dramatic truth prefaces; truthful statements can match. |
| P-13 | <code>Hope this helps!</code><br>rendered description | None | <code>ai-artifact</code> | Fix: Hope this helps with or without I; ordinary contact invitations remain allowed. |
| P-14 | <code>In conclusion, consistency is key.</code><br>upstream example (outer quotes removed) | <code>in-conclusion</code> | <code>in-conclusion</code> | Selected summary/recap markers; Overall remains allowed. |
| P-15 | <code>With AI, the possibilities are endless.</code><br>upstream example (outer quotes removed) | <code>vague-future</code> | <code>vague-future</code> | Four stock future cliches; not a semantic prediction check. |

## Sentence patterns

| ID | Representative probe | 0.5.0 | Candidate | Decision and limits |
| --- | --- | --- | --- | --- |
| S-01 | <code>It's not a tool. It's a teammate.</code><br>upstream example (outer quotes removed) | <code>its-not-x-its-y</code> | <code>its-not-x-its-y</code> | Selected same-line reversals; factual corrections can match. |
| S-02 | <code>Not just a scheduler, but a full content engine.</code><br>upstream example (outer quotes removed) | <code>not-just-but</code> | <code>not-just-but</code> | Selected not-just/only/merely plus but construction. |
| S-03 | <code>The question isn't if you should use AI. It's how.</code><br>upstream example (outer quotes removed) | None | <code>question-reversal</code> | Fix: selected question/problem reversals on one line; genuine reframing can match. |
| S-04 | <code>Not a plan. Not a hope. A system.</code><br>upstream example (outer quotes removed) | None | None | Deferred: negative fragment lists can be factual exclusions; no generic fragment ban. |
| S-05 | <code>Why does this matter? Because reach is everything.</code><br>upstream example (outer quotes removed) | <code>rhetorical-qa</code> | <code>rhetorical-qa</code> | Selected stock questions plus immediate because/it/this; not all rhetorical questions. |
| S-06 | <code>You might be wondering how this works.</code><br>upstream example (outer quotes removed) | <code>reader-question</code> | <code>reader-question</code> | Two question-announcing phrases. |
| S-07 | <code>The best part: it's free.</code><br>upstream example (outer quotes removed) | <code>part-reveal</code> | <code>part-reveal</code> | Selected best/useful/exciting-part colon/is setups; generic part-where remains allowed. |
| S-08 | <code>What nobody tells you about growth: distribution beats product.</code><br>upstream example (outer quotes removed) | <code>faux-insight</code> | <code>faux-insight</code> | Selected hidden-insight hooks. |
| S-09 | <code>And this is where it gets interesting.</code><br>upstream example (outer quotes removed) | <code>dramatic-transition</code> | <code>dramatic-transition</code> | Selected significance announcements and change/changes/changed/changing-everything phrases; a concrete scope may still make the wording intentional. |
| S-10 | <code>The useful part is that it connects to your inbox.</code><br>upstream example (outer quotes removed) | <code>part-reveal</code> | <code>part-reveal</code> | Selected best/useful/exciting-part colon/is setups; generic part-where remains allowed. |
| S-11 | <code>Posting without a plan is just gambling with your time.</code><br>upstream example (outer quotes removed) | None | None | Deferred: identifying vivid unrelated metaphors requires context. |
| S-12 | <code>Sales rose 20%, highlighting the strength of the brand.</code><br>upstream example (outer quotes removed) | <code>superficial-ing</code> | <code>superficial-ing</code> | Selected participles; not a grammatical trailing-clause parser. |
| S-13 | <code>fast, simple, and powerful.</code><br>upstream example (outer quotes removed) | None | None | Deferred: three-item lists are often useful; reflexive intent cannot be inferred. |
| S-14 | <code>The agent drafts. The assistant reviews. The tool publishes.</code><br>upstream example (outer quotes removed) | None | None | Deferred: identifying the same referent across synonyms requires context. |
| S-15 | <code>Start with one workflow.</code><br>upstream example (outer quotes removed) | None | None | Deferred: one can be a meaningful numerical constraint. |
| S-16 | <code>The app boasts an intuitive interface.</code><br>upstream example (outer quotes removed) | <code>boasts</code> | <code>boasts</code> | Boasts detected; ordinary features/offers/maintains remain allowed. |
| S-17 | <code>Imagine a world where your posts write themselves.</code><br>upstream example (outer quotes removed) | <code>imagine-world</code> | <code>imagine-world</code> | Selected hypothetical openers; Picture this needs a colon. |
| S-18 | <code>This may potentially help improve results.</code><br>upstream example (outer quotes removed) | <code>hedge-stack</code> | <code>hedge-stack</code> | Selected redundant modal/adverb pairs; legitimate uncertainty remains allowed. |
| S-19 | <code>While automation saves time, it's important to stay authentic.</code><br>upstream example (outer quotes removed) | None | None | Deferred: benefits and tradeoffs may be substantive; no generic while-clause ban. |
| S-20 | <code>From ideation to publication, we've got you covered.</code><br>upstream example (outer quotes removed) | None | None | Deferred: ranges can describe real scope or endpoints. |
| S-21 | <code>That last point matters more than it sounds.</code><br>upstream example (outer quotes removed) | None | None | Deferred: an interpretive aside may explain genuine significance. |
| S-22 | <code>It's fast. Or rather, it's instant.</code><br>upstream example (outer quotes removed) | None<br>Incidental: <code>weasel-word</code> | None<br>Incidental: <code>weasel-word</code> | Deferred: corrections can be useful. The weasel-word hit on rather is incidental, not coverage of self-correction. |

## Structure and rhythm

| ID | Representative probe | 0.5.0 | Candidate | Decision and limits |
| --- | --- | --- | --- | --- |
| R-01 | <code>I quit my job. ↵  ↵ I built a product. ↵  ↵ Nobody came. ↵  ↵ Then I learned this.</code><br>rendered description | None | None | Deferred: broad paragraph/fragment rhythm is not implemented. Staccato only catches comparative pairs, not this example. |
| R-02 | <code>Code. Content. Customers. Every day.</code><br>upstream example (outer quotes removed) | None | None | Deferred: broad paragraph/fragment rhythm is not implemented. Staccato only catches comparative pairs, not this example. |
| R-03 | <code>It saves time. It saves money. It saves your sanity.</code><br>upstream example (outer quotes removed) | None | None | Deferred: repeated starters can aid parallel instructions; no generic anaphora ban. |
| R-04 | <code>The team drafts weekly posts for customers, keeping every message clear today. The team reviews weekly posts for customers, keeping every message clear today. The team sends weekly posts to customers, keeping every message clear today.</code><br>rendered description | None | None | Deferred: sentence-shape uniformity needs a document-level metric and contextual thresholds. |
| R-05 | <code>sales, marketing, support, ops, finance, hiring, legal and product.</code><br>upstream example (outer quotes removed) | None | None | Deferred: long inventories can be complete and necessary. |
| R-06 | <code>- Save time each week. ↵ - Spend less each month. ↵ - Grow more each year.</code><br>rendered description | None | None | Deferred: deciding prose versus bullets requires editorial context. |
| R-07 | <code>## Why it matters ↵  ↵ Post on Tuesdays.</code><br>rendered description | None | None | Deferred: short sections can be useful navigation or reference material. |
| R-08 | <code>To recap, we covered A, B and C.</code><br>upstream example (outer quotes removed) | <code>in-conclusion</code> | <code>in-conclusion</code> | To recap marker detected; actual semantic repetition is not. |
| R-09 | <code>The future isn't coming. It's already here.</code><br>upstream example (outer quotes removed) | None | None | Deferred: judging a concluding line as profound requires context. |
| R-10 | <code>Despite these challenges, the outlook remains positive.</code><br>upstream example (outer quotes removed) | None | None | Deferred: outlook may be supported by evidence in the preceding text. |
| R-11 | <code>And honestly? That's when it clicked.</code><br>upstream example (outer quotes removed) | None | None | Deferred: colloquial scaffolding can be intentional author voice. |
| R-12 | <code>## Overview ↵  ↵ The tool schedules posts. ↵  ↵ ## Key Points ↵  ↵ It exports CSV files. ↵  ↵ ## Conclusion ↵  ↵ Try it today.</code><br>rendered description | None | None | Deferred: judging structure relative to answer length needs document/destination context. |

## Imagery and metaphor

| ID | Representative probe | 0.5.0 | Candidate | Decision and limits |
| --- | --- | --- | --- | --- |
| M-01 | <code>Your data is whispering insights.</code><br>upstream example (outer quotes removed) | None | None | Deferred: abstract personification versus useful metaphor requires context. |
| M-02 | <code>where your customer data lives.</code><br>upstream example (outer quotes removed) | None | None | Deferred: live/sit are ordinary location idioms, especially in technical writing. |
| M-03 | <code>Analytics finally get honest.</code><br>upstream example (outer quotes removed) | None | None | Deferred: systems can literally reveal/hide information; metaphor interpretation requires context. |
| M-04 | <code>a north star that fuels the engine of growth.</code><br>upstream example (outer quotes removed) | None | None | Deferred: detecting mixed metaphors requires meaning, not a noun count. |
| M-05 | <code>content that fuels your growth engine.</code><br>upstream example (outer quotes removed) | None | None | Deferred: engine/fuel/flywheel and other terms have literal technical uses. |
| M-06 | <code>Consistency is the secret sauce.</code><br>upstream example (outer quotes removed) | <code>secret-sauce</code> | <code>secret-sauce</code> | Three solution cliches detected; ordinary magic remains allowed. |

## Substance

| ID | Representative probe | 0.5.0 | Candidate | Decision and limits |
| --- | --- | --- | --- | --- |
| C-01 | <code>This marks a pivotal moment for the industry.</code><br>upstream example (outer quotes removed) | <code>intensifier-cluster</code> | <code>intensifier-cluster</code> | Selected significance words; does not evaluate whether the event is important. |
| C-02 | <code>Studies show posting daily works.</code><br>upstream example (outer quotes removed) | <code>vague-attribution</code> | <code>vague-attribution</code> | Selected authority phrases; sources may appear later in the paragraph. |
| C-03 | <code>AI can transform your business.</code><br>upstream example (outer quotes removed) | None | None | Deferred: receipts and evidence require surrounding claims and sources. |
| C-04 | <code>We're committed to delivering value to our customers.</code><br>upstream example (outer quotes removed) | None | None | Deferred: portability to another topic requires semantic comparison. |
| C-05 | <code>Growth is a mindset, not a metric.</code><br>upstream example (outer quotes removed) | None | None | Deferred: concrete meaning versus profundity requires context. |
| C-06 | <code>a leading expert in the field.</code><br>upstream example (outer quotes removed) | None | None | Deferred: judging lost specificity requires original facts/source text. |
| C-07 | <code>"Sarah, a marketing manager, saved 10 hours a week." (no Sarah exists)</code><br>upstream example | None | None | Deferred: invented names/numbers cannot be identified from prose alone. |
| C-08 | <code>Surprisingly, the simple version won.</code><br>upstream example (outer quotes removed) | None | None | Deferred: surprise/interest may be supported by the facts. Surprisingly is NOT detected; earlier related-rule claim overstated coverage. |
| C-09 | <code>She has been featured in numerous leading publications.</code><br>upstream example (outer quotes removed) | None<br>Incidental: <code>passive-voice</code> | None<br>Incidental: <code>passive-voice</code> | Deferred: identifying notability without receipts requires sources. Passive-voice is an incidental hit, not this check. |
| C-10 | <code>AI is powerful. However, it has limitations.</code><br>upstream example (outer quotes removed) | None | None | Deferred: superficial versus useful balance needs document context. |
| C-11 | <code>Optimize your posting schedule.</code><br>upstream example (outer quotes removed) | None | None | Deferred: judging missing steps needs the task and surrounding instructions. |
| C-12 | <code>The ultimate guide to LinkedIn.</code><br>upstream example (outer quotes removed) | <code>hollow-promise</code> | <code>hollow-promise</code> | Selected guide/completeness claims; master-X-in-minutes is not included. |

## Formatting and punctuation

| ID | Representative probe | 0.5.0 | Candidate | Decision and limits |
| --- | --- | --- | --- | --- |
| F-01 | <code>It's fast — really fast — and free.</code><br>upstream example (outer quotes removed) | None<br>Incidental: <code>weasel-word</code> | None<br>Incidental: <code>weasel-word</code> | Threshold-limited: the upstream two-dash example is below the three-dash minimum. A weasel-word hit is incidental. |
| F-02 | <code>This is **really important** for **growth**.</code><br>upstream example (outer quotes removed) | None<br>Incidental: <code>weasel-word</code> | None<br>Incidental: <code>weasel-word</code> | Threshold-limited: two spans are below the four-span minimum. A weasel-word hit is incidental. |
| F-03 | <code>✅ Faster ✅ Cheaper ✅ Better</code><br>upstream example (outer quotes removed) | <code>emoji-bullet</code> | <code>emoji-bullet</code> | Start-of-line emoji markers detected; inline decoration elsewhere is not. |
| F-04 | <code>How To Grow Your Audience On LinkedIn</code><br>upstream example (outer quotes removed) | None | None | Format-limited: bare title text is NOT detected; a Markdown # heading is required. |
| F-05 | <code>**Speed:** fast. **Price:** low. **Support:** great.</code><br>upstream example (outer quotes removed) | None | <code>inline-bold-bullet</code> | Fix: a bold colon-label at line start now matches with or without a bullet; arbitrary inline labels are not all matched. |
| F-06 | <code>**Subject:** New release</code><br>rendered description | None | None<br>Incidental: <code>inline-bold-bullet</code> | Deferred: Markdown is valid input; the target publishing destination is unknown. |
| F-07 | <code>“quotes” next to "quotes" in one paragraph.</code><br>upstream example | None | None | Deferred: typography mixes may come from names/quoted material; no automatic style normalization. |
| F-08 | <code>We updated the settings page!</code><br>upstream example (outer quotes removed) | None | None | Deferred: ordinary enthusiasm is not a sufficient reason to flag every exclamation. |
| F-09 | <code>𝗧𝗵𝗶𝘀 𝗶𝘀 𝗮 𝗽𝗼𝘀𝘁 𝗶𝗻 𝗯𝗼𝗹𝗱 𝗹𝗲𝘁𝘁𝗲𝗿𝘀.</code><br>rendered description | None | None | Deferred: decorative Unicode and real mathematical notation need careful classification. |
| F-10 | <code>&#124; Option &#124; Price &#124; ↵ &#124; --- &#124; --- &#124; ↵ &#124; A &#124; $10 &#124; ↵ &#124; B &#124; $20 &#124;</code><br>rendered description | None | None | Deferred: even small tables can aid comparisons. |

## Chatbot residue

| ID | Representative probe | 0.5.0 | Candidate | Decision and limits |
| --- | --- | --- | --- | --- |
| B-01 | <code>Certainly! Here's a LinkedIn post about...</code><br>upstream example (outer quotes removed) | <code>ai-artifact</code> | <code>ai-artifact</code> | Certainly/Of course exclamations detected; Absolutely/Great question are not included. |
| B-02 | <code>Great point, you're absolutely right!</code><br>rendered description | None | None | Deferred: agreement and enthusiasm can be authentic in replies. |
| B-03 | <code>Would you like me to adjust the tone?</code><br>rendered description | <code>assistant-offer</code> | <code>assistant-offer</code> | Explicit editing/length/tone offers only; ordinary service offers remain allowed. |
| B-04 | <code>Here is a polished version of your post:</code><br>description-derived example | <code>assistant-draft-intro</code> | <code>assistant-draft-intro</code> | Specific revised-version draft lead-ins only; broad Here is a is allowed. |
| B-05 | <code>[Your Name]</code><br>description-derived example | <code>unfilled-placeholder</code> | <code>unfilled-placeholder</code> | Selected bracket placeholders and XX%; reusable templates may intentionally match. |
| B-06 | <code>As an AI, I don't have personal opinions.</code><br>description-derived example | <code>ai-artifact</code> | <code>ai-artifact</code> | AI disclaimer with punctuation or language-model phrase; professional descriptions remain allowed. |
| B-07 | <code>While specific figures are not widely available, ...</code><br>upstream example (outer quotes removed) | None | None | Deferred: admitting missing sources can be honest and necessary. |
| B-08 | <code>turn0search0</code><br>description-derived example | <code>ai-artifact</code> | <code>ai-artifact</code> | Named generation/citation artifacts; numeric [1] citations remain allowed. |

## Social media and LinkedIn

| ID | Representative probe | 0.5.0 | Candidate | Decision and limits |
| --- | --- | --- | --- | --- |
| L-01 | <code>I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post. ↵  ↵ I wrote a post.</code><br>rendered description | None | None | Deferred: one sentence per paragraph can be intentional; broad broetry detection is not implemented. |
| L-02 | <code>Unpopular opinion: posting less helps.</code><br>description-derived example | None | None | Deferred: hooks may describe real events or useful instructions. |
| L-03 | <code>I'm thrilled to announce I've joined Acme!</code><br>upstream example (outer quotes removed) | <code>announcement-preface</code> | <code>announcement-preface</code> | Selected first-person stock announcement reactions. |
| L-04 | <code>Read that again.</code><br>description-derived example | <code>engagement-bait</code> | <code>engagement-bait</code> | Selected reader-reaction slogans. |
| L-05 | <code>Agree? 👇</code><br>upstream example (outer quotes removed) | None | <code>engagement-bait</code> | Standalone Agree?/Thoughts? lines, optionally followed by a pointing-down emoji; substantive questions and inline uses remain allowed. |
| L-06 | <code>Here are 7 lessons I learned from building a company.</code><br>description-derived example | None | None | Deferred: lesson lists can be specific and substantive. |
| L-07 | <code>I don't usually post this, but I made a sale.</code><br>description-derived example | None | None | Deferred: personal framing and sensitivity may be meaningful. |
| L-08 | <code>A thread 🧵 ↵ 1/ Start posting.</code><br>description-derived example | None | None | Deferred: thread markers may be correct; thread destination is unknown. |
| L-09 | <code>#growth #marketing #content #business #startup #sales #social #writing #linkedin #success</code><br>description-derived example | None | None | Deferred: hashtag count alone does not establish an irrelevant wall; platform conventions vary. |
| L-10 | <code>That's it. That's the tweet.</code><br>upstream example (outer quotes removed) | <code>engagement-bait</code> | <code>engagement-bait</code> | Explicit post/tweet ending slogan on the same line. |
| L-11 | <code>P.S. Repost ♻️ if this helped.</code><br>description-derived example | None | None | Deferred: repost requests can be intentional calls to action. |
| L-12 | <code>No fluff, just value.</code><br>description-derived example | <code>engagement-bait</code> | <code>engagement-bait</code> | No-fluff/just-value slogan only; straight-to-the-point and real-talk remain allowed. |
| L-13 | <code>Great insights!</code><br>description-derived example | None | None | Deferred: ordinary compliments/replies may be authentic. |
| L-14 | <code>I failed. I was broke. Then I discovered a new sales tool.</code><br>description-derived example | None | None | Deferred: verifying personal vulnerability or sales intent requires facts/context. |
| L-15 | <code>Everyone says posting daily works. They're wrong.</code><br>description-derived example | None | None | Deferred: a contrarian claim may be supported by evidence. |

## Variant and boundary probes

These checks make selected gaps visible instead of assuming a match on one example covers every alternative. “None” is an explicit non-detection, not a passing detection claim.

| ID | Additional probe | 0.5.0 | Candidate |
| --- | --- | --- | --- |
| V-01 | <code>Unpack the findings.</code><br>catalog variant | None | None |
| V-01 | <code>Here is what the data shows.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-02 | <code>Our developer ecosystem keeps growing.</code><br>catalog variant | None | None |
| V-03 | <code>The launch is a beacon of hope.</code><br>catalog variant | None | None |
| V-03 | <code>The team shipped it in six weeks.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-04 | <code>The system is critical to safety.</code><br>catalog variant | None | None |
| V-04 | <code>drives 40% of signups.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-05 | <code>Highlight the selected row in blue.</code><br>catalog variant | None | None |
| V-05 | <code>Testing caught three bugs before launch.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-06 | <code>Cultivate a culture of innovation.</code><br>catalog variant | None | None |
| V-07 | <code>Utilize the weekly report.</code><br>catalog variant | None | None |
| V-07 | <code>Use AI to draft the weekly report.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-08 | <code>Enhance your content strategy.</code><br>catalog variant | None | None |
| V-09 | <code>A world-class solution.</code><br>catalog variant | None | None |
| V-09 | <code>it syncs in under a second and hasn't gone down this year.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-10 | <code>A nuanced discussion of complex tradeoffs.</code><br>catalog variant | None | None |
| V-11 | <code>Painstakingly crafted templates.</code><br>catalog variant | None | None |
| V-11 | <code>templates tested on 200 posts.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-12 | <code>A thriving community of creators.</code><br>catalog variant | None | None |
| V-12 | <code>4,000 creators who post weekly.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-13 | <code>We embark on a train journey tomorrow.</code><br>catalog variant | None | None |
| V-13 | <code>start with your top ten pages.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-14 | <code>This is revolutionary.</code><br>catalog variant | None | None |
| V-15 | <code>Importantly, the tool supports exports.</code><br>catalog variant | None | None |
| V-15 | <code>It also exports to CSV.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-17 | <code>She quietly spoke to the librarian.</code><br>catalog variant | None | None |
| V-17 | <code>quietly built a system</code><br>reported regression | None | <code>quiet-hype</code> |
| V-17 | <code>Costs rose 12% in March.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-18 | <code>posts your audience replies to.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-19 | <code>Post on the same days every week.</code><br>upstream rewrite (outer quotes removed) | None | None |
| V-20 | <code>In an era of automation, timing matters.</code><br>catalog variant | None | None |
| P-01 | <code>The API allows 100 calls a minute.</code><br>upstream rewrite (outer quotes removed) | None | None |
| P-02 | <code>Ultimately, marketing is about people.</code><br>catalog variant | None | None |
| P-03 | <code>Measure the distance in terms of meters.</code><br>catalog variant | None | None |
| P-03 | <code>Posts at 9am get more reach than posts at 3pm.</code><br>upstream rewrite (outer quotes removed) | None | None |
| P-04 | <code>Let's get started.</code><br>catalog variant | None | None |
| P-05 | <code>Posts with 3 to 5 hashtags reached more people in our test.</code><br>upstream rewrite (outer quotes removed) | None | None |
| P-06 | <code>The server acts as a proxy.</code><br>catalog variant | None | None |
| P-06 | <code>The dashboard shows every scheduled post.</code><br>upstream rewrite (outer quotes removed) | None | None |
| P-07 | <code>The ins and outs of SEO.</code><br>catalog variant | None | None |
| P-07 | <code>explains how Google picks which page to rank.</code><br>upstream rewrite (outer quotes removed) | None | None |
| P-09 | <code>FeedHive schedules posts to 10 platforms.</code><br>upstream rewrite (outer quotes removed) | None | None |
| P-11 | <code>Most people quit in month two.</code><br>upstream rewrite (outer quotes removed) | None | None |
| P-12 | <code>SEO takes about six months to show results.</code><br>upstream rewrite (outer quotes removed) | None | None |
| P-13 | <code>Feel free to reach out.</code><br>catalog variant | None | None |
| P-14 | <code>Overall, the result was good.</code><br>catalog variant | None | None |
| S-03 | <code>The problem isn't speed. The problem is reliability.</code><br>catalog variant | None | <code>question-reversal</code> |
| S-03 | <code>Here is how we use AI for first drafts.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-04 | <code>A system: three posts a week, written on Mondays.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-05 | <code>How fast is it? Faster than last year.</code><br>catalog variant | None | None |
| S-05 | <code>Reach decides how many people see the post.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-07 | <code>It's free.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-10 | <code>The part where it connects to your inbox.</code><br>catalog variant | None | None |
| S-10 | <code>It connects to your inbox.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-08 | <code>Distribution brought us more users than any feature.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-09 | <code>I built a system that changed everything.</code><br>reported regression/boundary | None | <code>dramatic-transition</code> |
| S-09 | <code>Changing everything took three months.</code><br>reported regression/boundary | None | <code>dramatic-transition</code> |
| S-11 | <code>Without a plan you post less and repeat topics.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-12 | <code>Sales rose 20%.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-14 | <code>The agent drafts, reviews and publishes.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-15 | <code>Start with your weekly newsletter.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-16 | <code>The app offers CSV exports.</code><br>catalog variant | None | None |
| S-16 | <code>The app has a drag-and-drop calendar.</code><br>upstream rewrite (outer quotes removed) | None | None |
| S-18 | <code>This can sometimes improve results.</code><br>catalog variant | None | None |
| S-22 | <code>It's instant.</code><br>upstream rewrite (outer quotes removed) | None | None |
| R-03 | <code>It saves about four hours a week.</code><br>upstream rewrite (outer quotes removed) | None | None |
| M-01 | <code>Your data shows Tuesday posts get more replies.</code><br>upstream rewrite (outer quotes removed) | None | None |
| M-02 | <code>where your customer data is stored.</code><br>upstream rewrite (outer quotes removed) | None<br>Incidental: <code>passive-voice</code> | None<br>Incidental: <code>passive-voice</code> |
| M-03 | <code>Analytics now count only real views.</code><br>upstream rewrite (outer quotes removed) | None | None |
| M-05 | <code>posts that bring in signups.</code><br>upstream rewrite (outer quotes removed) | None | None |
| M-06 | <code>The feature works like magic.</code><br>catalog variant | None | None |
| M-06 | <code>Accounts that posted weekly grew twice as fast.</code><br>upstream rewrite (outer quotes removed) | None | None |
| C-02 | <code>Many believe posting daily works.</code><br>catalog variant | None | None |
| C-03 | <code>Our AI drafts a week of posts from a 3-line brief.</code><br>upstream rewrite (outer quotes removed) | None | None |
| C-06 | <code>who wrote the Kubernetes scheduler.</code><br>upstream rewrite (outer quotes removed) | None | None |
| C-08 | <code>The simple version got twice the clicks.</code><br>upstream rewrite (outer quotes removed) | None | None |
| C-11 | <code>Post Tuesday to Thursday between 8 and 10am.</code><br>upstream rewrite (outer quotes removed) | None | None |
| C-12 | <code>Master LinkedIn in minutes.</code><br>catalog variant | None | None |
| C-12 | <code>How to write a LinkedIn post that gets replies.</code><br>upstream rewrite (outer quotes removed) | None | None |
| F-01 | <code>It's fast — really fast — and free — today.</code><br>threshold control | <code>em-dash-density</code><br>Incidental: <code>weasel-word</code> | <code>em-dash-density</code><br>Incidental: <code>weasel-word</code> |
| F-02 | <code>This has **one** and **two** and **three** and **four**.</code><br>threshold control | <code>bold-density</code> | <code>bold-density</code> |
| F-03 | <code>We use ✅ to mark completed work.</code><br>format control | None | None |
| F-04 | <code>## How To Grow Your Audience On LinkedIn</code><br>format control | <code>title-case-heading</code> | <code>title-case-heading</code> |
| F-04 | <code>How to grow your audience on LinkedIn</code><br>upstream rewrite (outer quotes removed) | None | None |
| F-05 | <code>- **Speed:** fast.</code><br>format control | <code>inline-bold-bullet</code> | <code>inline-bold-bullet</code> |
| F-05 | <code>This has **Speed:** as an inline label.</code><br>format control | None | None |
| F-08 | <code>We updated the settings page.</code><br>upstream rewrite (outer quotes removed) | None | None |
| F-10 | <code>A is cheaper; B is faster.</code><br>upstream rewrite (outer quotes removed) | None | None |
| B-01 | <code>Absolutely! Great question!</code><br>catalog variant | None | None |
| B-03 | <code>Would you like me to send the invoice?</code><br>catalog variant | None | None |
| B-04 | <code>Here is a version of the API.</code><br>catalog variant | None | None |
| B-05 | <code>Read [Company](https://example.com).</code><br>catalog variant | None | None |
| B-05 | <code>[Company] [insert statistic] XX%</code><br>catalog variant | <code>unfilled-placeholder</code> | <code>unfilled-placeholder</code> |
| B-06 | <code>As an AI researcher, I study models.</code><br>catalog variant | None | None |
| B-08 | <code>See [1] for the source.</code><br>catalog variant | None | None |
| B-08 | <code>contentReference oaicite turn2view3</code><br>catalog variant | <code>ai-artifact</code> | <code>ai-artifact</code> |
| L-03 | <code>I joined Acme to lead the growth team.</code><br>upstream rewrite (outer quotes removed) | None | None |
| L-04 | <code>Let that sink in.</code><br>catalog variant | <code>engagement-bait</code> | <code>engagement-bait</code> |
| L-05 | <code>Thoughts? 👇</code><br>reported regression/boundary | None | <code>engagement-bait</code> |
| L-05 | <code>Do you agree?</code><br>reported regression/boundary | None | None |
| L-05 | <code>Agree? Please explain your reasoning.</code><br>reported regression/boundary | None | None |
| L-10 | <code>That's it. That's the post.</code><br>catalog variant | <code>engagement-bait</code> | <code>engagement-bait</code> |
| L-12 | <code>Straight to the point.</code><br>catalog variant | None | None |

Meaningful discretion, genuine reframing, or deliberate author voice can still match a heuristic. No rule here proves AI authorship. Context, fabricated facts, unsupported claims, and structural quality still require editorial review.
