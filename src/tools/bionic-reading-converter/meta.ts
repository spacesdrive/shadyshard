import { BookOpenText } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "bionic-reading-converter",
  title: "Bionic Reading Converter",
  description:
    "Emphasise the first part of every word to give your eyes a fixation point while reading.",
  longDescription:
    "This converts ordinary text into the reading format that bolds the opening letters of each word, giving the eye an anchor to land on so it moves forward through a sentence instead of drifting back. How much of each word is emphasised is adjustable, and short words can be left alone so the page does not turn into solid bold. Three outputs are available: a live preview, HTML using strong tags for anything you are publishing, and a plain-text version using Unicode bold characters for apps that strip formatting. Text is transformed in your browser, so a draft, a study text, or a private document is never uploaded.",
  category: "text",
  keywords: [
    "bionic reading converter",
    "bionic reading text",
    "bold first letters reading",
    "speed reading converter",
    "adhd reading format",
  ],
  tags: ["reading", "bionic", "accessibility", "focus", "adhd", "dyslexia", "text"],
  icon: BookOpenText,
  isNew: true,
  features: [
    "Adjustable fixation strength from 20 to 80 percent of each word",
    "Optional minimum word length so short words stay unemphasised",
    "Live preview, HTML output, and Unicode bold plain text",
    "Preserves line breaks, punctuation, and spacing exactly",
    "Copy or download the result as HTML or a text file",
  ],
  faqs: [
    {
      question: "Does this reading format actually help?",
      answer:
        "Reports are mixed. Many readers, particularly people with ADHD, say the fixation points make it easier to keep moving through a long passage, while controlled studies have generally not found a reliable improvement in reading speed or comprehension across the general population. Treat it as a preference worth trying rather than a proven technique, and judge it on whether it helps you specifically.",
    },
    {
      question: "Which output should I use?",
      answer:
        "Use the HTML output for anything on the web, in an email, or in a document that supports formatting, because it uses real strong tags around real letters. Use the plain-text output only where formatting is stripped, such as a chat message or a notes app that stores plain text.",
    },
    {
      question: "Why does the plain-text version look wrong in some apps?",
      answer:
        "It substitutes Unicode mathematical bold symbols for letters, because plain text has no concept of bold. Those symbols render as bold-looking characters in most fonts, but they are not letters: screen readers may announce them oddly or skip them, search will not match them, and a font missing the range shows empty boxes. That is why the HTML output is the better choice wherever formatting is possible.",
    },
    {
      question: "Is my text uploaded anywhere?",
      answer:
        "No. The conversion is plain string processing in your browser, so nothing is sent to a server and nothing is stored. That matters if what you are reformatting is unpublished writing, a legal document, or study material you do not own.",
    },
  ],
}

export default meta
