export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Many tool/subsystem names in this catalog are acronyms (JSON, CSS,
    // SEO, QR, HTML, SVG, UUID, SHA-256, EXIF, CI/CD) that legitimately
    // start a commit subject with an uppercase run -- the default
    // subject-case heuristic misreads those as sentence-case/upper-case
    // violations. Disabled rather than worked around by rewording every
    // affected subject.
    "subject-case": [0],
    // `release:` is not part of @commitlint/config-conventional's default
    // type-enum -- added on top of it (not replacing it) for this
    // project's tagged-release convention, see
    // docs/git/git-workflow.md#release-tagging.
    "type-enum": [
      2,
      "always",
      [
        "build",
        "chore",
        "ci",
        "docs",
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "style",
        "test",
        "release",
      ],
    ],
  },
}
