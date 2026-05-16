import { mkdir, cp } from "node:fs/promises"
import { existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import inquirer from "inquirer"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..", "..")
const SAMPLES = join(ROOT, "samples")

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export async function main(templatesDir: string) {
  console.log("")

  const { name } = await inquirer.prompt([
    { type: "input", name: "name", message: "Template name:", validate: (v: string) => v.trim().length > 0 || "Name is required" },
  ])

  const slug = slugify(name)
  const outputDir = join(templatesDir, slug)

  if (existsSync(outputDir)) {
    console.log(`\n  "${slug}" already exists. Use a different name or remove it first.\n`)
    return
  }

  await cp(SAMPLES, outputDir, { recursive: true })
  console.log(`\n  Generated: ${outputDir}\n`)
}

// main() — called via CLI dispatcher
