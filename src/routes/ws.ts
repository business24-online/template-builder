import type { WebSocket } from "ws"
import type { IncomingMessage } from "node:http"

export function wsHandler(ws: WebSocket, _req: IncomingMessage, _templatePath: string) {
  ws.send(JSON.stringify({ type: "connected", message: "template-builder ws ready" }))

  ws.on("message", async (raw) => {
    try {
      const msg = JSON.parse(raw.toString())
      if (msg.type === "generate") {
        ws.send(JSON.stringify({ type: "progress", step: "generating" }))
        ws.send(JSON.stringify({ type: "complete", message: "generated" }))
      }
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "invalid message" }))
    }
  })

  ws.on("close", () => {})
}
