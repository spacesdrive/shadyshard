import { Scissors } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "text-chunker",
  title: "Text Chunker",
  description:
    "Split long text into overlapping chunks that fit a context window, without cutting mid-sentence.",
  longDescription:
    "Long documents have to be broken up before they fit in a model's context window or an embedding request, and where the breaks land changes how useful each piece is. This splits text into chunks of a size you choose, optionally overlapping each chunk with the end of the previous one so a sentence spanning a boundary is not lost, and it can snap every break to the nearest paragraph or sentence end rather than cutting mid-word. Each chunk shows its character, word, and estimated token count, and can be copied on its own or exported as a JSON array. The text is split in your browser, which matters when the document being prepared is a contract, a transcript, or an internal report.",
  category: "text",
  keywords: [
    "text chunker",
    "split text into chunks",
    "chunk text for llm",
    "text splitter with overlap",
    "rag chunking tool",
  ],
  tags: ["text", "split", "chunk", "llm", "rag", "embedding", "context window"],
  icon: Scissors,
  features: [
    "Split by characters, words, sentences, or paragraphs",
    "Adjustable overlap so context carries across a boundary",
    "Breaks snap to a sentence or paragraph end instead of mid-word",
    "Character, word, and estimated token count per chunk",
    "Copy one chunk, or download them all as JSON or numbered text",
  ],
  faqs: [
    {
      question: "How accurate is the token estimate?",
      answer:
        "It is an estimate of roughly four characters per token, which is the usual rule of thumb for English in the common byte pair encoding tokenizers. Real counts vary by model and by language, and code or non-Latin scripts use noticeably more tokens per character. Leave headroom rather than sizing a chunk to exactly fill a limit.",
    },
    {
      question: "Why would I want overlapping chunks?",
      answer:
        "When chunks are used for retrieval, a sentence that lands across a boundary can end up in neither chunk in a usable form. Repeating the last part of each chunk at the start of the next means that sentence appears whole somewhere, at the cost of storing a little more text. Ten to twenty percent of the chunk size is a common starting point.",
    },
    {
      question: "What does snapping to a boundary do?",
      answer:
        "With a paragraph or sentence boundary selected, the split point moves backward to the nearest paragraph or sentence end within the chunk, so chunks come out slightly under the target size rather than cutting in the middle of a thought. Choosing characters splits at exactly the size you asked for.",
    },
    {
      question: "Is my text uploaded?",
      answer:
        "No. Splitting and counting happen in your browser with no network request, so a document you are preparing for a model is not exposed twice over just to divide it up.",
    },
  ],
}

export default meta
