import { Resend } from 'resend'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const config = useRuntimeConfig()

  const resend = new Resend(config.resendApiKey)

  try {
    const { data, error } = await resend.emails.send({
    // "Réservations Jass Optic <reservation@jassoptic.fr>" qd le nom de domaine sera vérif
    from: "Service Réservation <onboarding@resend.dev>", // après 
    to: "miryam.atamna.cv@gmail.com",   // uniquement moi // et j'enverrais directement à body.email
    subject: "Enregistrement de votre réservation",
    html: String.raw `
      <div style="
        background:#e6f7f7;
        padding:30px;
        font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
      ">
        <div style="
          max-width:600px;
          margin:auto;
          background:white;
          border-radius:14px;
          padding:25px;
          box-shadow:0 3px 12px rgba(0,0,0,0.08);
          border-top:5px solid #27a7a5;
        ">

          <!-- HEADER -->
          <h2 style="
            color:#0f6c7e;
            margin-top:0;
            font-size:26px;
            font-weight:700;
            text-align:center;
          ">
            Nouvelle réservation
          </h2>

          <p style="text-align:center;color:#4c6666;margin-top:5px;">
            Vous avez effectué une demande de rendez-vous.
          </p>

          <hr style="border:none;height:1px;background:#cfecec;margin:25px 0;" />

          <!-- CRENEAU -->
          <h3 style="color:#0f6c7e;margin-bottom:10px;">📅 Créneau réservé</h3>
          <p style="font-size:16px;color:#244;margin:0;">
            <strong>Date :</strong> ${body.slotDate}<br/>
            <strong>Heure :</strong> ${body.slotHour}
          </p>

          <hr style="border:none;height:1px;background:#cfecec;margin:25px 0;" />

          <!-- CLIENT -->
          <h3 style="color:#0f6c7e;margin-bottom:10px;">👤 Informations du patient</h3>
          <p style="font-size:16px;color:#244;margin:0;">
            <strong>Nom :</strong> ${body.firstname} ${body.lastname}<br/>
            <strong>Email :</strong> ${body.email}<br/>
            <strong>Téléphone :</strong> ${body.phone}
          </p>

          <hr style="border:none;height:1px;background:#cfecec;margin:25px 0;" />

          <!-- FOOTER -->
          <p style="
            text-align:center;
            font-size:14px;
            color:#6a7b7b;
            margin-top:20px;
          ">
            Cet email vous a été envoyé automatiquement par le système de réservation.<br>
            Merci de ne pas répondre directement.
          </p>

        </div>
      </div>
    `
    })

    if (error) {
      console.log("RESEND ERROR:", error)
      return { error }
    }

    return { success: true }

  } catch (err) {
    console.log("SEND EMAIL CATCH ERROR:", err)
    return { error: "Email sending failed" }
  }
})
