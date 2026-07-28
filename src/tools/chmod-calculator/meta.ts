import { Lock } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "chmod-calculator",
  title: "Chmod Calculator",
  description:
    "Convert Unix file permissions between checkbox, symbolic, and octal form, and get the chmod command to apply them.",
  longDescription:
    "Tick the read, write, and execute boxes for owner, group, and others and the octal value, the symbolic string, and the ready-to-run chmod command all update together. Typing an octal value such as 755 or a symbolic string such as rwxr-xr-x works just as well, since every representation is editable. Setuid, setgid, and the sticky bit are included with a plain explanation of what each one does, because those are the ones people most often get wrong. Nothing you enter leaves the page.",
  category: "developer",
  keywords: [
    "chmod calculator",
    "unix file permissions calculator",
    "octal permissions converter",
    "chmod 755 meaning",
    "linux permission bits",
  ],
  tags: ["chmod", "permissions", "linux", "unix", "developer"],
  icon: Lock,
  features: [
    "Two-way conversion between checkboxes, octal, and symbolic form",
    "Setuid, setgid, and sticky bit support",
    "Generates the matching chmod command",
    "Plain-language explanation of the selected permissions",
    "Inline validation for malformed octal or symbolic input",
  ],
  faqs: [
    {
      question: "What does chmod 755 actually allow?",
      answer:
        "The owner can read, write, and execute. Group members and everyone else can read and execute but not write. It is the usual mode for a directory or a program that others need to run.",
    },
    {
      question: "When should a file be 644 rather than 755?",
      answer:
        "644 leaves out the execute bit, which is correct for ordinary data files such as documents, images, and configuration. Directories need the execute bit to be traversable, so they are usually 755.",
    },
    {
      question: "What is the sticky bit for?",
      answer:
        "On a directory it means only a file's owner, the directory's owner, or root can delete or rename that file. This is why /tmp is mode 1777: everyone can write there, but nobody can remove anyone else's files.",
    },
    {
      question: "Why is setuid considered risky?",
      answer:
        "A setuid executable runs with the file owner's privileges rather than the caller's, so a flaw in a setuid root program becomes a route to root access. Set it only when you genuinely need it.",
    },
  ],
  isNew: true,
}

export default meta
