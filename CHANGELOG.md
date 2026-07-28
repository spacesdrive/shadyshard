# Changelog

All notable changes to ShadyShard are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/). See
[docs/git/git-workflow.md](docs/git/git-workflow.md#release-tagging) for the
process this file is maintained under.

## [Unreleased]

### Added

- Fifteen tools across seven existing categories, taking the catalog from
  103 to 118: Regex Tester and Chmod Calculator (Developer Tools); CSS Clamp
  Generator, CSS Unit Converter, Cubic Bezier Generator, and Text Shadow
  Generator (CSS Generators); Color Blindness Simulator and Image Palette
  Extractor (Color Tools); Signature Pad and SVG to PNG Converter (Image
  Tools); PDF Watermark and PDF Page Numbers (PDF Tools); CSP Header
  Generator (Security and Privacy); Mock Data Generator (Generators);
  Markdown TOC Generator (Text Tools).
- Fifteen tools across seven existing categories, taking the catalog from 88
  to 103: Cron Expression Parser, IP Subnet Calculator, HAR File Analyzer,
  and JSON to TypeScript (Developer Tools); Text Encrypter and TOTP Code
  Generator (Security and Privacy); Word Frequency Counter and Line Sorter
  (Text Tools); Markdown Table Generator (Converters); Unix Timestamp
  Converter and Time Zone Converter (Time and Date); ICS Calendar Event
  Generator and vCard Generator (Generators); UTM Link Builder and Hreflang
  Tag Generator (SEO Tools).

### Changed

- Tool metadata is split into an eagerly-loaded summary and a lazily-loaded
  detail half, so a tool's long description and FAQs now download only when
  its own page opens. The app entry chunk drops from 64.06 KB to 34.34 KB
  gzip despite the catalog growing by fifteen tools. Writing a `meta.ts` is
  unchanged. See
  [decisions.md ADR-026](docs/architecture/decisions.md).
- The `isNew` flag is cleared from the 103 previously-shipped tools, so the
  homepage "New tools" section shows tools that are actually new.

### Fixed

- Horizontal overflow on every tool page at narrow viewports, caused by a
  missing `min-w-0` on the related-tools grid item.
