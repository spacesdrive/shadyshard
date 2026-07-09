/**
 * Shared reference data for the IITM BS Student Tools category.
 *
 * Grade points follow IIT Madras's published 10-point relative grading
 * scale (S/A/B/C/D/E/U), documented at
 * https://www.iitm.ac.in/sites/default/files/Others/CGPA_Calculation_and_Conversion.pdf.
 * Credit targets per level are the commonly published defaults for the BS
 * Degree in Data Science and Applications
 * (https://study.iitm.ac.in/ds/academics.html). Individual specializations
 * (Electronic Systems, Aeronautics, etc.) and program revisions can differ,
 * so every tool that uses these numbers exposes them as editable defaults
 * rather than hard-coded truth -- always confirm against the current
 * official IITM BS handbook and term-specific announcements before making
 * an academic decision based on them.
 */

export const IITM_UNOFFICIAL_NOTICE =
  "Unofficial planning tool, not affiliated with or endorsed by IIT Madras. Verify grades, credits, and deadlines against the official IITM BS portal and current term announcements before making academic decisions."

export interface GradeOption {
  letter: string
  points: number
  description: string
}

/** IIT Madras's standard 10-point letter grade scale. Editable per course row in every calculator, since a term's actual grade boundaries are set relative to that term's cohort. */
export const DEFAULT_GRADE_SCALE: GradeOption[] = [
  { letter: "S", points: 10, description: "Outstanding" },
  { letter: "A", points: 9, description: "Excellent" },
  { letter: "B", points: 8, description: "Very good" },
  { letter: "C", points: 7, description: "Good" },
  { letter: "D", points: 6, description: "Average" },
  { letter: "E", points: 4, description: "Below average, pass" },
  { letter: "U", points: 0, description: "Fail" },
]

export function gradePoints(letter: string): number {
  return DEFAULT_GRADE_SCALE.find((g) => g.letter === letter)?.points ?? 0
}

export interface ProgramLevel {
  slug: string
  label: string
  defaultCredits: number
  outcome: string
}

/** Default published credit requirements per exit level of the BS Degree in Data Science and Applications. Treated as editable defaults everywhere they're used -- other specializations and program revisions vary. */
export const DEFAULT_PROGRAM_LEVELS: ProgramLevel[] = [
  {
    slug: "foundation",
    label: "Foundation",
    defaultCredits: 32,
    outcome: "Foundation Certificate",
  },
  { slug: "diploma", label: "Diploma", defaultCredits: 27, outcome: "Diploma" },
  { slug: "bsc", label: "BSc Degree", defaultCredits: 114, outcome: "BSc Degree" },
  { slug: "bs", label: "BS Degree", defaultCredits: 142, outcome: "BS Degree" },
]

/** IITM BS runs three terms a year: January, May, September. */
export const TERMS_PER_YEAR = 3
