# Changelog

All notable changes to ShadyShard are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/). See
[docs/git/git-workflow.md](docs/git/git-workflow.md#release-tagging) for the
process this file is maintained under.

## [Unreleased]

### Added

- Fifteen tools across eight existing categories, taking the catalog from 133
  to 148, with no new dependency: Text Encoding Fixer and List Comparison
  (Text Tools); Text Redactor and File Encrypter (Security and Privacy);
  Gzip Size Calculator and XML Formatter (Developer Tools); Env File
  Converter, Number to Words Converter, and Image to Base64 Converter
  (Converters); CSS Specificity Calculator (CSS Generators); Image Watermark
  and Placeholder Image Generator (Image Tools); Lorem Ipsum Generator and
  Random Picker (Generators); Compound Interest Calculator (Math and
  Calculators).
- `src/lib/crypto-box.ts`, holding the AES-256-GCM and PBKDF2 parameters and
  key derivation shared by Text Encrypter and File Encrypter, so the two
  password-based formats cannot drift apart. See
  [decisions.md ADR-029](docs/architecture/decisions.md).
- First use of the Compression Streams API, which is how Gzip Size
  Calculator measures compressed size without a compression library. See
  [decisions.md ADR-030](docs/architecture/decisions.md).
- Fifteen tools across nine existing categories, taking the catalog from 118
  to 133: SERP Snippet Preview and Schema Markup Generator (SEO Tools);
  Readability Score Checker and List Delimiter Converter (Text Tools); SQL
  Formatter and JSONL to JSON Converter (Developer Tools); CSV Splitter
  (Converters); JWT Generator and HMAC Generator (Security and Privacy);
  Time Duration Calculator and Business Days Calculator (Time and Date);
  Loan EMI Calculator and Aspect Ratio Calculator (Math and Calculators);
  CSS Animation Generator (CSS Generators); Image Metadata Viewer (Image
  Tools).
- `sql-formatter` and `exifreader` as dependencies, each used by exactly one
  tool and isolated to that tool's lazy chunk. See
  [decisions.md ADR-027 and ADR-028](docs/architecture/decisions.md).
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
  its own page opens. The app entry chunk drops from 64.06 KB to 34.35 KB
  gzip despite the catalog growing by fifteen tools. The prose is loaded as
  route data so tool pages still render in a single paint, with layout
  stability measured unchanged against the pre-split baseline. Writing a
  `meta.ts` is unchanged. See
  [decisions.md ADR-026](docs/architecture/decisions.md).
- The `isNew` flag is cleared from the previous batch each time a new batch
  ships, so the homepage "New tools" section shows tools that are actually
  new. It currently surfaces File Encrypter, Text Redactor, Gzip Size
  Calculator, Text Encoding Fixer, Image Watermark, and Number to Words
  Converter.

### Fixed

- Horizontal overflow on every tool page at narrow viewports, caused by a
  missing `min-w-0` on the related-tools grid item.
