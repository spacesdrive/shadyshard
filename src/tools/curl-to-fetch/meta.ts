import { TerminalSquare } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "curl-to-fetch",
  title: "cURL to Fetch Converter",
  description:
    "Turn a copied cURL command into JavaScript fetch code, with headers, body, and auth carried over.",
  longDescription:
    "Paste a cURL command copied from browser DevTools, API documentation, or a colleague's terminal and get the equivalent JavaScript fetch call. The command is tokenised the way a shell would read it, so quoted headers, escaped line continuations, and repeated flags are all handled. Method, headers, request body, basic auth, cookies, and multipart form fields are mapped onto the fetch options object. This matters more than convenience: a cURL command copied from DevTools usually carries a session cookie or bearer token, and this tool parses it in your browser, so those credentials are never posted to a conversion service.",
  category: "developer",
  keywords: [
    "curl to fetch",
    "convert curl command to javascript",
    "curl to javascript",
    "copy as curl to fetch",
    "curl converter",
  ],
  tags: ["curl", "fetch", "javascript", "http", "api", "converter", "devtools"],
  icon: TerminalSquare,
  features: [
    "Handles quoting, escapes, and backslash line continuations like a shell",
    "Maps method, headers, body, basic auth, cookies, and form fields",
    "Supports repeated -H and -d flags, --data-urlencode, and --json",
    "Choose async/await or promise chain output",
    "Parses locally so tokens in the command are never transmitted",
  ],
  faqs: [
    {
      question: "Where do I get a cURL command to paste in?",
      answer:
        "In Chrome or Firefox DevTools, open the Network panel, right click any request and choose Copy as cURL. Most API documentation and tools like Postman can also export a request in cURL form.",
    },
    {
      question:
        "Is it safe to paste a command that contains my API key or session cookie?",
      answer:
        "Yes, on this page. The command is parsed by JavaScript running in your browser and nothing is sent anywhere. That is worth checking before using any converter, because a cURL command copied from DevTools normally contains live authentication headers.",
    },
    {
      question: "Which cURL flags are supported?",
      answer:
        "The flags that affect the request: -X and --request, -H and --header, -d with its --data variants, --json, -u for basic auth, -b for cookies, -F for multipart form fields, -A for the user agent, and -e for the referer. Transport flags such as -k, -L, and --compressed have no fetch equivalent and are ignored rather than silently changing the output.",
    },
    {
      question: "Will the generated code run in Node.js as well as the browser?",
      answer:
        "Yes on Node 18 and later, which ships a global fetch with the same API. The one difference is cookies: a browser applies its own cookie jar and CORS rules, while Node sends only the headers written in the code.",
    },
  ],
}

export default meta
