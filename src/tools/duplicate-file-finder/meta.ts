import { CopyCheck } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "duplicate-file-finder",
  title: "Duplicate File Finder",
  description:
    "Select files to hash them locally and group the ones with identical contents, whatever they are named.",
  longDescription:
    "Two copies of the same photo under different names look like two different files to your eyes and to most sorting tools. This one reads each file you select, computes its SHA-256 hash with the browser's own Web Crypto implementation, and groups files whose hashes match, which means identical contents regardless of the name, the folder, or the modification date. You get the duplicate groups, the size of each, and how much space the redundant copies are taking up. Nothing is uploaded: the files are read into memory in the page, hashed, and released, which is the difference between checking your own documents and handing them to a cloud service to check for you.",
  category: "security",
  keywords: [
    "duplicate file finder",
    "find duplicate files by hash",
    "compare files by checksum",
    "identical file detector",
    "find duplicate photos offline",
  ],
  tags: ["files", "duplicates", "hash", "sha-256", "privacy"],
  icon: CopyCheck,
  features: [
    "Groups files by SHA-256 hash, so names and dates do not matter",
    "Shows how much space the redundant copies occupy",
    "Add more files to an existing comparison without starting over",
    "Skips files already added, matched on name, size, and date",
    "Hashes locally with Web Crypto, with no upload",
  ],
  faqs: [
    {
      question: "Can two different files have the same hash?",
      answer:
        "Not in practice. SHA-256 collisions have never been produced, and the odds of two unrelated files colliding by chance are far smaller than the odds of a disk error. If two files share a hash here, they are byte for byte identical.",
    },
    {
      question: "Why can I not just drop a whole folder in?",
      answer:
        "Browsers only hand a page the files a user explicitly selects. Use the file picker and select everything inside a folder, or drop a multiple selection. This restriction is the reason a page cannot go looking through your disk on its own.",
    },
    {
      question: "Is there a limit on file size?",
      answer:
        "Each file is read into memory to hash it, so very large files are limited by the memory available to the tab rather than by any fixed cap. A few gigabytes of video at once will be slow and may fail; hashing them in smaller batches works.",
    },
    {
      question: "Are my files uploaded to be compared?",
      answer:
        "No. Reading and hashing both happen in your browser through the File and Web Crypto APIs. No file content and no hash is sent anywhere.",
    },
  ],
}

export default meta
