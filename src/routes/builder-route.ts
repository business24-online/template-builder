import { Router } from "express"
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { join, dirname, basename } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, "..", "..", "package.json"), "utf-8"))

export function createBuilderRouter(schema: Record<string, unknown>, schemaPath: string, templatePath: string) {
  const router = Router()

  function save() {
    writeFileSync(schemaPath, JSON.stringify(schema, null, 2))
  }

  function reload() {
    if (!existsSync(schemaPath)) return
    const raw = readFileSync(schemaPath, "utf-8")
    const parsed = JSON.parse(raw)
    Object.keys(schema).forEach((k) => delete schema[k])
    Object.assign(schema, parsed)
  }

  router.get("/project-metadata", (_req, res) => {
    res.json({
      template: basename(templatePath),
      version: pkg.version,
      installPath: process.argv[1],
    })
  })

  router.get("/schema", (_req, res) => {
    reload()
    res.json(schema)
  })

  router.put("/schema", (req, res) => {
    const updated = req.body
    if (!updated || typeof updated !== "object") {
      res.status(400).json({ error: "Invalid schema" })
      return
    }
    Object.keys(schema).forEach((k) => delete schema[k])
    Object.assign(schema, updated)
    save()
    res.json(schema)
  })

  return router
}
