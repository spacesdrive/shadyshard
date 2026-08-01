# Changelog

All notable changes to ShadyShard are documented here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versioning follows
[Semantic Versioning](https://semver.org/). See
[docs/git/git-workflow.md](docs/git/git-workflow.md#release-tagging) for the
process this file is maintained under.

## [Unreleased]

### Added

- Fifteen tools across six existing categories, taking the catalog from 148
  to 163: CSS Minifier and Formatter, JSON to Go Struct, and CSV to SQL
  Insert (Developer Tools); OAuth PKCE Generator, Hash Identifier, and
  Caesar Cipher and ROT13 (Security and Privacy); Bionic Reading Converter,
  Text to Speech Reader, and List Comparer (Text Tools); Morse Code
  Translator, Roman Numeral Converter, and Unit Converter (Converters);
  Compound Interest Calculator (Math and Calculators); Image Splitter and
  Image Combiner (Image Tools). No new dependency, no new shared `lib/`
  file, and no new category was needed for any of them.
- First use of the Web Speech synthesis API (`speechSynthesis`, Text to
  Speech Reader) and of the Web Audio API (Morse Code Translator's tone
  playback), both native rather than a dependency. See
  [decisions.md ADR-030](docs/architecture/decisions.md).
- Fifteen tools across eight existing categories, taking the catalog from
  133 to 148: Subtitle Converter, Subtitle Timing Shifter, and Data Size
  Converter (Converters); cURL to Fetch Converter, Gzip Size Calculator, XML
  Formatter, JSON Schema Generator, and Env File Converter (Developer
  Tools); Image to Base64, Image Watermark, and Placeholder Image Generator
  (Image Tools); CSS Specificity Calculator (CSS Generators); Unicode
  Character Inspector (Text Tools); Open Graph Image Generator (SEO Tools);
  Punycode Converter (Security and Privacy). No new dependency and no new
  category was needed for any of them.
- First use of the Compression Streams API (`CompressionStream`, Gzip Size
  Calculator) and of `Intl.Segmenter` (Unicode Character Inspector), both
  native rather than a dependency. See
  [decisions.md ADR-029](docs/architecture/decisions.md).
- `lib/subtitle.ts`, shared SRT and WebVTT parsing and time shifting used by
  the two subtitle tools, with unit test coverage.
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

- Removed the `isNew` flag from the fifteen tools added in the previous
  batch, so the homepage "New tools" section surfaces the current batch.
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
  new.

### Fixed

- Horizontal overflow on every tool page at narrow viewports, caused by a
  missing `min-w-0` on the related-tools grid item.
