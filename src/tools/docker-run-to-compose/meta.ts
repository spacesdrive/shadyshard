import { Container } from "lucide-react"
import type { ToolMeta } from "@/types/tool"

const meta: ToolMeta = {
  slug: "docker-run-to-compose",
  title: "Docker Run to Compose Converter",
  description:
    "Turn a long docker run command into a compose.yaml service definition, flag by flag.",
  longDescription:
    "Paste the docker run command from a project README and get back the equivalent Compose service, with ports, volumes, environment variables, networks, restart policy, healthcheck, and logging options mapped to their Compose keys. Named volumes and user-defined networks are declared at the top level so the file runs as it stands. Flags with no Compose equivalent are listed rather than dropped silently, so you know exactly what still needs a manual decision. The command is parsed in your browser, which matters because these commands routinely carry API tokens and database passwords in their environment flags.",
  category: "developer",
  keywords: [
    "docker run to docker compose",
    "convert docker run command",
    "compose yaml generator",
    "docker compose converter",
    "docker run flags to compose keys",
  ],
  tags: ["docker", "compose", "yaml", "devops", "converter", "containers"],
  icon: Container,
  isNew: true,
  features: [
    "Maps ports, volumes, environment, networks, and restart policy to Compose keys",
    "Understands both short and long flags, including combined ones like -itd",
    "Declares named volumes and user-defined networks at the top level",
    "Converts --mount key=value syntax into volume entries",
    "Lists any flag it could not map instead of dropping it quietly",
  ],
  faqs: [
    {
      question: "Is my docker run command sent anywhere?",
      answer:
        "No. The command is tokenised and converted by JavaScript running on this page. That matters here because docker run commands often contain -e flags holding API keys, database passwords, and other secrets.",
    },
    {
      question: "Which Compose file version does it produce?",
      answer:
        "It produces a file with no version key, which is what the Compose Specification expects. The top-level version field has been ignored by Docker Compose v2 for several years and produces a warning if present.",
    },
    {
      question: "Why are some of my flags listed as unmapped?",
      answer:
        "A few docker run flags describe how the CLI should behave rather than how the container should be configured, such as --rm and --detach, and a few others like --gpus map onto a different Compose structure that depends on your setup. Those are reported so you can decide what to do rather than being silently discarded.",
    },
    {
      question: "Does it handle multi-line commands?",
      answer:
        "Yes. Backslash line continuations are handled, so you can paste a command exactly as it appears in a README without joining the lines first.",
    },
  ],
}

export default meta
