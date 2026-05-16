import { join } from "node:path";

const commands = ["dev", "generate"];

// process.argv[0] = node/bun executable path
// process.argv[1] = entry script path (bin shim, index.ts, etc.)
// process.argv[2+] = user arguments
//
// bin shim:   template-builder dev my-template  →  argv[2]="."  argv[3]="dev"  argv[4]="my-template"
// npm/npx:    npm run dev -- my-template         →  argv[2]="dev"  argv[3]="my-template"
// bun:        bun src/cli/index.ts dev           →  argv[2]="dev"  argv[3]="my-template"
// tsx direct: tsx src/cli/index.ts dev           →  argv[2]="dev"  argv[3]="my-template"
//
// The bin shim prepends "." as argv[2] to signal "look in current dir for templates"
// so args = argv.slice(2) gives:
//   via bin shim:  [".", "dev", "my-template"]   →  args[0]="." (dir),  args[1]="dev" (cmd),  args[2]="my-template" (name)
//   otherwise:     ["dev", "my-template"]         →  args[0]="dev" (cmd),  args[1]="my-template" (name)

const args = process.argv.slice(2);
const isDirect = commands.includes(args[0]);

const templatesDir = isDirect
  ? join(process.cwd(), "templates")
  : process.cwd();
const cmd = isDirect ? args[0] : args[1];
const name = isDirect ? args[1] : args[2];

switch (cmd) {
  case "dev": {
    const { main } = await import("./dev.js");
    await main(templatesDir, name);
    break;
  }
  case "generate": {
    const { main } = await import("./generate.js");
    await main(templatesDir);
    break;
  }
  default:
    console.log(`
  Usage: template-builder <command>

  Commands:
    dev [name]       Start dev server for a template
    generate         Create a new template from samples
`);
    break;
}
