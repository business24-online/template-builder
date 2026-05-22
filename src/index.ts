import express from "express";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  watch,
} from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { Liquid } from "liquidjs";
import multer from "multer";
import { v4 as uuid } from "uuid";
import { createBuilderRouter } from "./routes/builder-route.js";
import { wsHandler } from "./routes/ws.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT = parseInt(process.env.PORT || "4001", 10);

export function startServer(
  templatePath: string,
  onListening?: (port: number) => void,
) {
  const schemaPath = join(templatePath, "schema.json");
  let schema: Record<string, unknown> = {};

  if (existsSync(schemaPath)) {
    schema = JSON.parse(readFileSync(schemaPath, "utf-8"));
  }

  const app = express();
  app.use(express.json());

  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: "/template-builder/ws" });

  app.use(
    "/template-builder/api",
    createBuilderRouter(schema, schemaPath, templatePath),
  );

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", uptime: process.uptime() });
  });

  app.use(
    "/template-builder",
    express.static(join(__dirname, "public", "template-builder")),
  );

  app.get(["/template-builder", "/template-builder/"], (_req, res) => {
    const html = readFileSync(
      join(__dirname, "templates", "index.html"),
      "utf-8",
    );
    res.type("html").send(html);
  });

  app.post("/template-builder/formdata", (req, res) => {
    const formdataPath = join(templatePath, ".formdata.json");
    writeFileSync(formdataPath, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  });

  app.get("/template-builder/formdata", (_req, res) => {
    const formdataPath = join(templatePath, ".formdata.json");
    if (!existsSync(formdataPath)) {
      res.status(404).json({ error: "No form data" });
      return;
    }
    const raw = readFileSync(formdataPath, "utf-8");
    res.json(JSON.parse(raw));
  });

  const uploadsDir = join(templatePath, "saved_data", "uploads");
  mkdirSync(uploadsDir, { recursive: true });
  const fileStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
      const ext = extname(file.originalname);
      cb(null, uuid() + ext);
    },
  });
  const upload = multer({ storage: fileStorage });

  app.post("/template-builder/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No file" });
      return;
    }
    res.json({ path: "/uploads/" + req.file.filename });
  });
  app.use(
    "/uploads",
    express.static(join(templatePath, "saved_data", "uploads")),
  );

  const liquid = new Liquid();

  function loadFormdata(): Record<string, unknown> {
    const fp = join(templatePath, ".formdata.json");
    if (!existsSync(fp)) return {};
    return JSON.parse(readFileSync(fp, "utf-8"));
  }

  const templateTitle = basename(templatePath);

  app.use((req, res, next) => {
    const isHtml = req.path === "/" || extname(req.path) === ".html";
    if (!isHtml) {
      next();
      return;
    }
    const filePath = join(
      templatePath,
      req.path === "/" ? "index.html" : req.path,
    );
    if (!existsSync(filePath)) {
      next();
      return;
    }
    let raw = readFileSync(filePath, "utf-8");
    raw = raw.replace(
      /<\s*\/\s*body\s*>/i,
      '<script src="/template-builder/js/ws.js"></script></body>',
    );
    const ctx = { formCtx: loadFormdata() };
    liquid
      .parseAndRender(raw, ctx)
      .then((out) => {
        res.type("html").send(out);
      })
      .catch((err) => {
        console.error("Liquid render error:", err);
        res
          .status(500)
          .type("text")
          .send("Liquid render error: " + err.message);
      });
  });
  app.use("/", express.static(templatePath));

  wss.on("connection", (ws, req) => wsHandler(ws, req, templatePath));
  wss.on("error", () => {});

  try {
    watch(templatePath, { recursive: true }, (_, filename) => {
      if (filename && /\.(html|css|json)$/i.test(filename)) {
        for (const client of wss.clients) {
          client.send(JSON.stringify({ type: "page_reload" }));
        }
      }
    });
  } catch {} // fs.watch may fail on some systems

  let retries = 0;
  server.on("error", (err: NodeJS.ErrnoException) => {
    if ((err as any).code === "EADDRINUSE" && retries < 20) {
      const next = PORT + ++retries;
      console.log(`  Port ${PORT + retries - 1} in use, trying ${next}...`);
      server.close(() => server.listen(next));
    } else {
      console.error("  Server error:", err.message);
      process.exit(1);
    }
  });

  server.once("listening", () => {
    const addr = server.address();
    const port = typeof addr === "object" && addr ? addr.port : PORT;
    console.log(`\n  code-generator running on :${port}`);
    console.log(`  serving: ${templatePath}\n`);
    onListening?.(port);
  });

  server.listen(PORT);

  return server;
}
