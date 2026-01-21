import { defineEventHandler, sendRedirect, getCookie } from "h3"

export default defineEventHandler((event) => {
  const url = event.node.req.url || ""
  const config = useRuntimeConfig()

  if (url === "/admin/login") return

  if (url.startsWith("/admin")) {
    const cookie = getCookie(event, "admin_session")
    if (cookie !== config.adminKey) {
      return sendRedirect(event, "/admin/login")
    }
  }
})
