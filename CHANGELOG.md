# Changelog

All notable changes to ShadyShard are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/). See
[docs/git/git-workflow.md](docs/git/git-workflow.md#release-tagging) for the
process this file is maintained under.

## [Unreleased]

### Added

- Fifteen tools across seven existing categories, taking the catalog from 88
  to 103: Cron Expression Parser, IP Subnet Calculator, HAR File Analyzer,
  and JSON to TypeScript (Developer Tools); Text Encrypter and TOTP Code
  Generator (Security and Privacy); Word Frequency Counter and Line Sorter
  (Text Tools); Markdown Table Generator (Converters); Unix Timestamp
  Converter and Time Zone Converter (Time and Date); ICS Calendar Event
  Generator and vCard Generator (Generators); UTM Link Builder and Hreflang
  Tag Generator (SEO Tools).

### Fixed

- Horizontal overflow on every tool page at narrow viewports, caused by a
  missing `min-w-0` on the related-tools grid item.
