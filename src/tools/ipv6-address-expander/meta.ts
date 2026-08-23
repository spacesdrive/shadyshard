import { Network } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "ipv6-address-expander",
  title: "IPv6 Address Expander",
  description:
    "Expand an IPv6 address to its full form, compress it to RFC 5952 canonical form, and get its reverse DNS pointer.",
  longDescription:
    "The same IPv6 address can be written many ways, which is why a firewall rule, a log line, and a DNS record that look different can all refer to one host. Paste an address in any notation to see it expanded to all eight four-digit groups, compressed to the canonical form RFC 5952 defines, and turned into the ip6.arpa pointer a reverse DNS record needs. Addresses with a prefix length also show the network address and the address type, and embedded IPv4 notation is handled. Everything is parsed in your browser, so internal addressing never leaves the page.",
  category: "developer",
  keywords: [
    "ipv6 expander",
    "compress ipv6 address",
    "ipv6 canonical form rfc 5952",
    "ipv6 reverse dns ip6.arpa",
    "expand shortened ipv6",
  ],
  tags: ["ipv6", "network", "dns", "address", "networking", "converter"],
  icon: Network,
  features: [
    "Expands any shortened address to all eight groups",
    "Compresses to the canonical form defined by RFC 5952",
    "Builds the ip6.arpa reverse DNS pointer",
    "Identifies loopback, link-local, unique local, multicast, and IPv4-mapped addresses",
    "Accepts a prefix length and shows the resulting network address",
  ],
  faqs: [
    {
      question: "What makes one compressed form canonical?",
      answer:
        "RFC 5952 requires lowercase hex, no leading zeros in a group, and the :: shorthand applied to the single longest run of zero groups, choosing the leftmost run when two are the same length. A single zero group is never shortened to ::. Two tools that both compress correctly will therefore always agree.",
    },
    {
      question: "Does it handle addresses with a zone index?",
      answer:
        "Yes. A zone index such as %eth0 is separated from the address, reported back to you, and left out of the expanded and compressed forms, since it identifies a local interface rather than part of the address itself.",
    },
    {
      question: "Why does my IPv4-mapped address show as hexadecimal?",
      answer:
        "The expanded form always shows all 128 bits as eight hexadecimal groups, so ::ffff:192.0.2.1 expands to a form ending in c000:0201. The compressed output keeps the dotted-quad notation, which is what RFC 5952 recommends for that range.",
    },
    {
      question: "Is the address sent anywhere for lookup?",
      answer:
        "No. This tool does no DNS resolution and makes no network request. It only rewrites the address you type, entirely in your browser, so internal and management addresses stay private.",
    },
  ],
}

export default meta
