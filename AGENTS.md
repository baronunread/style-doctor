# Agent guidance

For style-doctor package releases or companion-site version updates, follow [the release skill](.agents/skills/style-doctor-release/SKILL.md).

## Release mistake to avoid

In the 0.4.3 release, `package.json` was bumped but `rules.js`'s `VERSION` constant stayed at `0.4.2`. As a result, the published package metadata said 0.4.3 while `style-doctor --version` and JSON reports still said 0.4.2. Before tagging a release, verify the version in both files and the README example. Once a version is published and tagged, do not amend or move that tag to fix it; correct the version with the next release.
