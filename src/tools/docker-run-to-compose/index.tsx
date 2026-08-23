import { useMemo, useState } from "react"
import { AlertCircle, Info, RotateCcw } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/tool/CopyButton"
import { DownloadButton } from "@/components/tool/DownloadButton"

const EXAMPLE = `docker run -d --name postgres \\
  --restart unless-stopped \\
  -p 5432:5432 \\
  -e POSTGRES_PASSWORD=secret \\
  -e POSTGRES_DB=app \\
  -v pgdata:/var/lib/postgresql/data \\
  --network backend \\
  postgres:17-alpine`

type YamlValue = string | boolean | YamlValue[] | { [key: string]: YamlValue }

/**
 * A tiny emitter rather than js-yaml's dump, because of one Compose-specific
 * rule a general serialiser cannot express: a bare port mapping like 22:22
 * matches the YAML 1.1 sexagesimal integer form, so a parser following that
 * version reads it as the number 1342. Values of that shape are quoted;
 * everything else that does not strictly need quotes is left bare, so an
 * image reference stays readable as image: nginx:alpine.
 */
function needsQuoting(value: string): boolean {
  if (value === "") return true
  if (/^\s|\s$/.test(value)) return true
  if (/^(true|false|null|yes|no|on|off|~)$/i.test(value)) return true
  // The fractional part is written as an optional group beginning with the
  // dot, not as \d+\.?\d*, so the two digit runs cannot both claim the same
  // digits and backtrack quadratically on a long numeric-looking value.
  if (/^[-+]?(\d+(\.\d*)?|\.\d+)([eE][-+]?\d+)?$/.test(value)) return true
  if (/^[&*!|>%@`#{}[\],"'?]/.test(value)) return true
  if (/^[-+]?\d+(:\d+)+$/.test(value)) return true
  return /:\s/.test(value) || value.includes(" #")
}

function scalar(value: string | boolean): string {
  if (typeof value === "boolean") return String(value)
  if (!needsQuoting(value)) return value
  return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}

function emit(value: { [key: string]: YamlValue }, indent: number): string[] {
  const pad = " ".repeat(indent)
  return Object.entries(value).flatMap(([key, child]) => {
    if (Array.isArray(child)) {
      if (child.length === 0) return []
      return [
        `${pad}${key}:`,
        ...child.map((item) => `${pad}  - ${scalar(item as string | boolean)}`),
      ]
    }
    if (typeof child === "object") {
      const nested = emit(child, indent + 2)
      if (nested.length === 0) return []
      return [`${pad}${key}:`, ...nested]
    }
    return [`${pad}${key}: ${scalar(child)}`]
  })
}

/**
 * Splits a shell command into tokens, honouring single and double quotes and
 * backslash line continuations so a command copied straight out of a README
 * parses without being joined onto one line first.
 */
function tokenize(input: string): string[] {
  const tokens: string[] = []
  let current = ""
  let quoted = false
  let quote: string | null = null

  for (let i = 0; i < input.length; i++) {
    const char = input[i]

    if (quote) {
      if (char === quote) {
        quote = null
      } else if (quote === '"' && char === "\\" && i + 1 < input.length) {
        current += input[++i]
      } else {
        current += char
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      quoted = true
      continue
    }

    if (char === "\\" && i + 1 < input.length) {
      const next = input[i + 1]
      if (next === "\n" || (next === "\r" && input[i + 2] === "\n")) {
        i += next === "\r" ? 2 : 1
        continue
      }
      current += next
      i++
      continue
    }

    if (/\s/.test(char)) {
      if (current !== "" || quoted) {
        tokens.push(current)
        current = ""
        quoted = false
      }
      continue
    }

    current += char
  }

  if (current !== "" || quoted) tokens.push(current)
  return tokens
}

const LONG_FLAGS_WITH_VALUE = new Set([
  "add-host",
  "attach",
  "blkio-weight",
  "cap-add",
  "cap-drop",
  "cgroup-parent",
  "cgroupns",
  "cidfile",
  "cpu-shares",
  "cpus",
  "cpuset-cpus",
  "device",
  "dns",
  "dns-search",
  "domainname",
  "entrypoint",
  "env",
  "env-file",
  "expose",
  "gpus",
  "group-add",
  "health-cmd",
  "health-interval",
  "health-retries",
  "health-start-period",
  "health-timeout",
  "hostname",
  "ipc",
  "isolation",
  "label",
  "link",
  "log-driver",
  "log-opt",
  "mac-address",
  "memory",
  "memory-swap",
  "mount",
  "name",
  "network",
  "network-alias",
  "pid",
  "platform",
  "publish",
  "pull",
  "restart",
  "runtime",
  "security-opt",
  "shm-size",
  "stop-signal",
  "stop-timeout",
  "storage-opt",
  "sysctl",
  "tmpfs",
  "ulimit",
  "user",
  "userns",
  "volume",
  "volumes-from",
  "workdir",
])

const SHORT_FLAGS: Record<string, string> = {
  a: "attach",
  d: "detach",
  e: "env",
  h: "hostname",
  i: "interactive",
  l: "label",
  m: "memory",
  p: "publish",
  t: "tty",
  u: "user",
  v: "volume",
  w: "workdir",
  P: "publish-all",
}

const SHORT_FLAGS_WITH_VALUE = new Set(["a", "e", "h", "l", "m", "p", "u", "v", "w"])

/** Flags that describe how the CLI behaves, not how the container is configured. */
const CLI_ONLY_FLAGS: Record<string, string> = {
  detach: "--detach is how the CLI runs the container; use docker compose up -d instead.",
  rm: "--rm has no Compose equivalent; remove the container with docker compose down.",
  attach: "--attach controls CLI stream attachment and has no Compose equivalent.",
  "publish-all":
    "--publish-all assigns random host ports at run time; list the ports you need under ports instead.",
  gpus: "--gpus maps to a deploy.resources.reservations.devices block that depends on your runtime, so it needs a manual decision.",
  pull: "--pull is a CLI image-pull policy; Compose uses the pull_policy key per service.",
}

interface Flag {
  name: string
  value?: string
}

interface ParsedCommand {
  flags: Flag[]
  image: string | null
  command: string[]
}

function parseCommand(tokens: string[]): ParsedCommand {
  const flags: Flag[] = []
  let image: string | null = null
  const command: string[] = []
  let index = 0

  while (index < tokens.length) {
    const token = tokens[index]

    if (image !== null) {
      command.push(token)
      index++
      continue
    }

    if (token.startsWith("--") && token.length > 2) {
      const separator = token.indexOf("=")
      const name = separator === -1 ? token.slice(2) : token.slice(2, separator)
      let value = separator === -1 ? undefined : token.slice(separator + 1)
      if (value === undefined && LONG_FLAGS_WITH_VALUE.has(name)) {
        value = tokens[++index]
        if (value === undefined) throw new Error(`The flag --${name} expects a value.`)
      }
      flags.push({ name, value })
      index++
      continue
    }

    if (token.startsWith("-") && token.length > 1 && token !== "--") {
      const characters = token.slice(1)
      for (let position = 0; position < characters.length; position++) {
        const character = characters[position]
        const name = SHORT_FLAGS[character]
        if (!name) throw new Error(`Unrecognised flag -${character}.`)
        if (SHORT_FLAGS_WITH_VALUE.has(character)) {
          let value = characters.slice(position + 1)
          if (value === "") {
            value = tokens[++index]
            if (value === undefined)
              throw new Error(`The flag -${character} expects a value.`)
          }
          flags.push({ name, value })
          break
        }
        flags.push({ name })
      }
      index++
      continue
    }

    if (token !== "--") image = token
    index++
  }

  return { flags, image, command }
}

/** Rewrites `--mount type=bind,source=/a,target=/b` as the short volume form. */
function mountToVolume(value: string): string | null {
  const parts = Object.fromEntries(
    value.split(",").map((pair) => {
      const separator = pair.indexOf("=")
      return separator === -1
        ? [pair.trim(), "true"]
        : [pair.slice(0, separator).trim(), pair.slice(separator + 1).trim()]
    }),
  )
  const target = parts.target ?? parts.destination ?? parts.dst
  if (!target) return null
  const source = parts.source ?? parts.src
  const readOnly = parts.readonly === "true" || parts.ro === "true"
  if (!source) return target
  return `${source}:${target}${readOnly ? ":ro" : ""}`
}

function serviceNameFrom(image: string, containerName: string | undefined): string {
  if (containerName) return containerName
  const withoutRegistry = image.split("/").pop() ?? image
  const withoutTag = withoutRegistry.split("@")[0].split(":")[0]
  const cleaned = withoutTag.toLowerCase().replace(/[^a-z0-9_-]/g, "-")
  return cleaned || "app"
}

/** A volume source is a named volume unless it looks like a host path. */
function isNamedVolume(entry: string): boolean {
  const source = entry.split(":")[0]
  if (entry.split(":").length < 2) return false
  return /^[a-zA-Z0-9][a-zA-Z0-9_.-]*$/.test(source)
}

interface Conversion {
  yaml: string
  notes: string[]
}

function convert(input: string): Conversion {
  const tokens = tokenize(input)
  if (tokens.length === 0) throw new Error("Paste a docker run command to convert.")

  let start = 0
  if (tokens[start] === "$" || tokens[start] === "sudo") start++
  if (tokens[start] === "docker" || tokens[start] === "podman") start++
  if (tokens[start] === "container") start++
  if (tokens[start] === "run") {
    start++
  } else {
    throw new Error('The command must start with "docker run".')
  }

  const { flags, image, command } = parseCommand(tokens.slice(start))
  if (!image) throw new Error("No image name found. Add the image the container runs.")

  const notes: string[] = []
  const service: Record<string, YamlValue> = { image }
  const ports: string[] = []
  const expose: string[] = []
  const environment: string[] = []
  const envFiles: string[] = []
  const volumes: string[] = []
  const tmpfs: string[] = []
  const networks: string[] = []
  const labels: string[] = []
  const capAdd: string[] = []
  const capDrop: string[] = []
  const devices: string[] = []
  const dns: string[] = []
  const extraHosts: string[] = []
  const securityOpt: string[] = []
  const sysctls: string[] = []
  const groupAdd: string[] = []
  const links: string[] = []
  const volumesFrom: string[] = []
  const logOptions: Record<string, YamlValue> = {}
  const healthcheck: Record<string, YamlValue> = {}
  const simpleKeys: Record<string, string> = {
    hostname: "hostname",
    domainname: "domainname",
    restart: "restart",
    workdir: "working_dir",
    user: "user",
    "mac-address": "mac_address",
    "cgroup-parent": "cgroup_parent",
    ipc: "ipc",
    pid: "pid",
    platform: "platform",
    runtime: "runtime",
    isolation: "isolation",
    userns: "userns_mode",
    memory: "mem_limit",
    "memory-swap": "memswap_limit",
    "shm-size": "shm_size",
    cpus: "cpus",
    "cpu-shares": "cpu_shares",
    "cpuset-cpus": "cpuset",
    "stop-signal": "stop_signal",
    "blkio-weight": "blkio_weight",
  }
  const booleanKeys: Record<string, string> = {
    privileged: "privileged",
    init: "init",
    "read-only": "read_only",
    interactive: "stdin_open",
    tty: "tty",
    "oom-kill-disable": "oom_kill_disable",
  }
  let containerName: string | undefined
  let ulimits: string[] = []

  for (const { name, value } of flags) {
    if (CLI_ONLY_FLAGS[name]) {
      notes.push(CLI_ONLY_FLAGS[name])
      continue
    }
    if (booleanKeys[name]) {
      service[booleanKeys[name]] = true
      continue
    }
    if (value === undefined) {
      notes.push(`--${name} was ignored because it has no Compose equivalent.`)
      continue
    }
    if (simpleKeys[name]) {
      service[simpleKeys[name]] = value
      continue
    }

    switch (name) {
      case "name":
        containerName = value
        service.container_name = value
        break
      case "publish":
        ports.push(value)
        break
      case "expose":
        expose.push(value)
        break
      case "env":
        environment.push(value)
        break
      case "env-file":
        envFiles.push(value)
        break
      case "volume":
        volumes.push(value)
        break
      case "mount": {
        const converted = mountToVolume(value)
        if (converted) volumes.push(converted)
        else notes.push(`--mount ${value} has no target and was skipped.`)
        break
      }
      case "tmpfs":
        tmpfs.push(value)
        break
      case "network":
        networks.push(value)
        break
      case "network-alias":
        notes.push(
          `--network-alias ${value} belongs under networks.<name>.aliases once you name the network explicitly.`,
        )
        break
      case "label":
        labels.push(value)
        break
      case "cap-add":
        capAdd.push(value)
        break
      case "cap-drop":
        capDrop.push(value)
        break
      case "device":
        devices.push(value)
        break
      case "dns":
        dns.push(value)
        break
      case "dns-search":
        notes.push(`--dns-search ${value} maps to the dns_search key if you need it.`)
        break
      case "add-host":
        extraHosts.push(value)
        break
      case "security-opt":
        securityOpt.push(value)
        break
      case "sysctl":
        sysctls.push(value)
        break
      case "group-add":
        groupAdd.push(value)
        break
      case "link":
        links.push(value)
        break
      case "volumes-from":
        volumesFrom.push(value)
        break
      case "ulimit":
        ulimits = [...ulimits, value]
        break
      case "entrypoint":
        service.entrypoint = value
        break
      case "log-driver":
        logOptions.driver = value
        break
      case "log-opt": {
        const separator = value.indexOf("=")
        if (separator === -1) break
        const options = (logOptions.options ?? {}) as Record<string, YamlValue>
        options[value.slice(0, separator)] = value.slice(separator + 1)
        logOptions.options = options
        break
      }
      case "health-cmd":
        healthcheck.test = `CMD-SHELL ${value}`
        break
      case "health-interval":
        healthcheck.interval = value
        break
      case "health-timeout":
        healthcheck.timeout = value
        break
      case "health-retries":
        healthcheck.retries = value
        break
      case "health-start-period":
        healthcheck.start_period = value
        break
      case "stop-timeout":
        service.stop_grace_period = `${value}s`
        break
      case "storage-opt":
        notes.push(`--storage-opt ${value} maps to the storage_opt key if you need it.`)
        break
      case "cidfile":
      case "detach-keys":
        notes.push(`--${name} is a CLI-only option and was skipped.`)
        break
      default:
        notes.push(`--${name} ${value} could not be mapped to a Compose key.`)
    }
  }

  const serviceName = serviceNameFrom(image, containerName)
  if (command.length > 0) service.command = command.join(" ")

  const assign = (key: string, list: string[]) => {
    if (list.length > 0) service[key] = list
  }
  assign("ports", ports)
  assign("expose", expose)
  assign("environment", environment)
  assign("env_file", envFiles)
  assign("volumes", volumes)
  assign("volumes_from", volumesFrom)
  assign("tmpfs", tmpfs)
  assign("networks", networks)
  assign("labels", labels)
  assign("cap_add", capAdd)
  assign("cap_drop", capDrop)
  assign("devices", devices)
  assign("dns", dns)
  assign("extra_hosts", extraHosts)
  assign("security_opt", securityOpt)
  assign("sysctls", sysctls)
  assign("group_add", groupAdd)
  assign("links", links)
  assign("ulimits", ulimits)
  if (Object.keys(healthcheck).length > 0) service.healthcheck = healthcheck
  if (Object.keys(logOptions).length > 0) service.logging = logOptions

  const document: Record<string, YamlValue> = { services: { [serviceName]: service } }

  const namedVolumes = Array.from(
    new Set(volumes.filter(isNamedVolume).map((entry) => entry.split(":")[0])),
  )
  if (namedVolumes.length > 0) {
    document.volumes = Object.fromEntries(namedVolumes.map((name) => [name, {}]))
    notes.push(
      "Named volumes are declared at the top level with default settings. Compose creates them on first run.",
    )
  }

  const externalNetworks = networks.filter(
    (network) => !["host", "none", "bridge", "container"].includes(network.split(":")[0]),
  )
  if (externalNetworks.length > 0) {
    document.networks = Object.fromEntries(
      externalNetworks.map((name) => [name, { external: true }]),
    )
    notes.push(
      "User-defined networks are declared as external, matching a network you created with docker network create. Remove external: true to let Compose create it.",
    )
  }

  return { yaml: `${emit(document, 0).join("\n")}\n`, notes }
}

export default function DockerRunToCompose() {
  const [input, setInput] = useState("")

  const result = useMemo(() => {
    if (!input.trim()) return { yaml: "", notes: [] as string[], error: null }
    try {
      const conversion = convert(input)
      return { yaml: conversion.yaml, notes: conversion.notes, error: null }
    } catch (conversionError) {
      return {
        yaml: "",
        notes: [] as string[],
        error:
          conversionError instanceof Error
            ? conversionError.message
            : "This command could not be parsed.",
      }
    }
  }, [input])

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="docker-run-input">docker run command</Label>
        <Textarea
          id="docker-run-input"
          name="command"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="docker run -d --name web -p 8080:80 nginx:alpine"
          className="mt-1.5 min-h-40 resize-y font-mono text-sm"
          spellCheck={false}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => setInput(EXAMPLE)}>
          Load example
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInput("")}
          disabled={!input}
        >
          <RotateCcw className="size-4" />
          Reset
        </Button>
        <CopyButton value={result.yaml} label="Copy compose.yaml" />
        <DownloadButton
          getBlob={() => new Blob([result.yaml], { type: "text/yaml" })}
          filename="compose.yaml"
          label="Download"
          disabled={!result.yaml}
        />
      </div>

      {result.error && (
        <div className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg border p-3 text-sm">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{result.error}</span>
        </div>
      )}

      <div>
        <Label htmlFor="docker-run-output">compose.yaml</Label>
        <Textarea
          id="docker-run-output"
          name="compose"
          value={result.yaml}
          readOnly
          placeholder="The converted Compose service appears here."
          className="mt-1.5 min-h-64 resize-y font-mono text-sm"
        />
      </div>

      {result.notes.length > 0 && (
        <div className="border-border/60 rounded-lg border p-3">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Info className="size-4 shrink-0" aria-hidden />
            Worth checking
          </p>
          <ul className="text-muted-foreground mt-2 space-y-1.5 text-sm">
            {result.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
