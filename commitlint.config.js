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
  },
}
