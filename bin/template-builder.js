#!/usr/bin/env node
import { spawn } from "node:child_process"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)
const entry = join(__dirname, "..", "src", "cli", "index.ts")
const tsx = require.resolve("tsx/cli")
const child = spawn(process.execPath, [tsx, entry, ".", ...process.argv.slice(2)], { stdio: "inherit" })
child.on("exit", (code) => process.exit(code ?? 1))
