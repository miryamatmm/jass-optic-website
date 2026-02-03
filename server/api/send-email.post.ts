import { Resend } from 'resend'

/**
 * Format date FR : "2026-02-02" -> "Lundi 2 février 2026"
 */
function formatDateFr(dateStr: string) {
  const date = new Date(dateStr)

  const formatted = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const resend = new Resend(config.resendApiKey)

  const formattedDate = formatDateFr(body.slotDate)

  // 👉 Email admin (à mettre en variable d'env plus tard si tu veux)
  const ADMIN_EMAIL = "contact@jassoptic.fr"

  try {
    /* =========================
       EMAIL CLIENT
    ========================= */
    const clientEmail = await resend.emails.send({
      from: "Jass Optic <reservation@jassoptic.fr>",
      to: body.email,
      subject: "Votre rendez-vous chez Jass Optic",
      html: `
      <div style="background:#fafafa;padding:40px 20px;font-family:Inter,sans-serif;color:#111;">
        <div style="max-width:560px;margin:auto;background:#fff;padding:40px;border-radius:8px;">
          <h1 style="text-align:center;font-weight:500;">Confirmation de rendez-vous</h1>

          <p style="text-align:center;">
            Bonjour ${body.firstname},<br>
            Votre demande de rendez-vous chez <strong>Jass Optic</strong> a bien été prise en compte.
          </p>

          <div style="margin:30px 0;border:1px solid #eee;padding:20px;border-radius:6px;">
            <strong>${formattedDate}</strong><br>
            ${body.slotHour}
          </div>

          <p>
            <strong>Nom :</strong> ${body.firstname} ${body.lastname}<br>
            <strong>Téléphone :</strong> ${body.phone}<br>
            <strong>Email :</strong> ${body.email}
          </p>

          <p style="font-size:13px;color:#888;text-align:center;margin-top:40px;">
            Jass Optic – Email automatique
          </p>
        </div>
      </div>
      `
    })

    if (clientEmail.error) {
      console.error("CLIENT EMAIL ERROR:", clientEmail.error)
      return { success: false }
    }

    /* =========================
       EMAIL ADMIN
    ========================= */
    const adminEmail = await resend.emails.send({
      from: "Jass Optic <reservation@jassoptic.fr>",
      to: ADMIN_EMAIL,
      subject: "📅 Nouvelle réservation – Jass Optic",
      html: `
      <div style="font-family:Inter,sans-serif;color:#111;">
        <h2>Nouvelle réservation</h2>

        <p>
          <strong>Date :</strong> ${formattedDate}<br>
          <strong>Heure :</strong> ${body.slotHour}
        </p>

        <p>
          <strong>Client :</strong> ${body.firstname} ${body.lastname}<br>
          <strong>Téléphone :</strong> ${body.phone}<br>
          <strong>Email :</strong> ${body.email}
        </p>

        <hr>

        <p style="font-size:13px;color:#666;">
          Notification automatique – Jass Optic
        </p>
      </div>
      `
    })

    if (adminEmail.error) {
      console.error("ADMIN EMAIL ERROR:", adminEmail.error)
      return { success: false }
    }

    return { success: true }

  } catch (err) {
    console.error("SEND EMAIL ERROR:", err)
    return { success: false }
  }
})
