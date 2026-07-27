import { Network } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "ip-subnet-calculator",
  title: "IP Subnet Calculator",
  description:
    "Calculate network, broadcast, host range, and mask details from an IPv4 CIDR block.",
  longDescription:
    "Enter an IPv4 address with a prefix length to get the network address, broadcast address, usable host range, host count, subnet mask, and wildcard mask, plus the binary form of the mask. Every value is computed in your browser, so internal addressing plans are never sent to a server.",
  category: "developer",
  keywords: [
    "ip subnet calculator",
    "cidr calculator",
    "subnet mask calculator",
    "ipv4 host range",
  ],
  tags: ["network", "subnet", "cidr", "ipv4", "sysadmin"],
  icon: Network,
  features: [
    "Network, broadcast, and first and last usable host addresses",
    "Subnet mask, wildcard mask, and total and usable host counts",
    "Binary view of the subnet mask",
    "Detects private, loopback, and link-local ranges",
  ],
  faqs: [
    {
      question: "Which notation does this calculator accept?",
      answer:
        "CIDR notation such as 192.168.10.37/24. You can also enter the address on its own and pick a prefix length from the list.",
    },
    {
      question: "Why do /31 and /32 report no usable hosts?",
      answer:
        "A /32 describes a single address and a /31 has no room for separate network and broadcast addresses, so the usable host count is reported as zero. Point-to-point links using /31 per RFC 3021 still work in practice.",
    },
    {
      question: "Does it support IPv6?",
      answer:
        "Not yet. This calculator covers IPv4 only, which is where subnet mask and wildcard mask arithmetic is most commonly needed.",
    },
  ],
  isNew: true,
}

export default meta
