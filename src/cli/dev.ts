import { readdirSync } from "node:fs"
import { statSync } from "node:fs"
import { join } from "node:path"
import inquirer from "inquirer"
import { startServer } from "../index.js"

export async function main(templatesDir: string, templateName?: string) {
  const listTemplates = () => {
    try {
      return readdirSync(templatesDir).filter((name) => {
        const p = join(templatesDir, name)
        return statSync(p).isDirectory()
      })
    } catch {
      return []
    }
  }

  const dirs = listTemplates()
  if (dirs.length === 0) {
    console.log(`\n  No templates found in ${templatesDir}. Run \`template-builder generate\` first.\n`)
    process.exit(1)
  }

  if (templateName) {
    if (!dirs.includes(templateName)) {
      console.log(`\n  "${templateName}" does not exist in ${templatesDir}.\n`)
      process.exit(1)
    }
    startServer(join(templatesDir, templateName), (port) => {
      console.log(`  Open: http://localhost:${port}                    (template preview)`)
      console.log(`        http://localhost:${port}/template-builder/  (builder)\n`)
    })
    return
  }

  const { selected } = await inquirer.prompt([
    {
      type: "list",
      name: "selected",
      message: "Select a template:",
      choices: dirs,
    },
  ])

  startServer(join(templatesDir, selected), (port) => {
    console.log(`  Open: http://localhost:${port}                    (template preview)`)
    console.log(`        http://localhost:${port}/template-builder/  (builder)\n`)
  })
}
