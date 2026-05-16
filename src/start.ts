import { startServer } from "./index.js"

const templatePath = process.argv[2]
if (!templatePath) {
  console.error("Usage: npx tsx src/start.ts <template-path>")
  process.exit(1)
}

startServer(templatePath)
