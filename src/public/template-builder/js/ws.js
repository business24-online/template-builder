(() => {
  const proto = location.protocol === "https:" ? "wss:" : "ws:"
  const ws = new WebSocket(`${proto}//${location.host}/template-builder/ws`)

  ws.addEventListener("message", (e) => {
    try {
      const msg = JSON.parse(e.data)
      if (msg.type === "page_reload") {
        location.reload()
      }
    } catch {}
  })
})()
