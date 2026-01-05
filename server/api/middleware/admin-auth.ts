import { defineEventHandler, sendRedirect, getCookie } from "h3"

export default defineEventHandler((event) => {
  const url = event.node.req.url || ""

  // Autoriser login
  if (url === "/admin/login") return

  // Autoriser API login
  if (url.startsWith("/api/admin/login")) return

  // Protéger UNIQUEMENT les pages /admin/* SAUF /admin/login
  if (url.startsWith("/admin")) {
    const token = getCookie(event, "admin_session")

    if (!token) {
      return sendRedirect(event, "/admin/login")
    }
  }
})
