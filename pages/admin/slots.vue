<script setup>
const config = useRuntimeConfig()
const slots = ref([])

const newDate = ref("")
const newStart = ref("")
const newEnd = ref("")
const newType = ref("pro")

const selectedLinkType = ref("pro")
const reservationEmail = ref("")
const reservationFirstname = ref("")
const reservationLastname = ref("")
const reservationPhone = ref("")
const sendingLink = ref(false)
const linkSentMessage = ref("")

const reservationLink = computed(() => {
  const base = config.public.publicBaseUrl || "https://jassoptic.fr"

  return selectedLinkType.value === "particulier"
    ? `${base}/reserver/particulier`
    : `${base}/reserver`
})

const selectedLinkLabel = computed(() => {
  return selectedLinkType.value === "particulier"
    ? "particulier"
    : "pro"
})

async function loadSlots() {
  slots.value = await $fetch(
    `${config.public.supabaseUrl}/rest/v1/slots?select=*`,
    { headers: { apikey: config.public.supabaseAnonKey } }
  )
}

onMounted(loadSlots)

const futureSlots = computed(() => {
  const now = new Date()

  return slots.value
    .filter((s) => {
      const endDateTime = new Date(`${s.date}T${s.end_time}`)
      return endDateTime > now
    })
    .sort((a, b) => {
      const da = new Date(`${a.date}T${a.start_time}`)
      const db = new Date(`${b.date}T${b.start_time}`)
      return da - db
    })
})

const proSlots = computed(() => {
  return futureSlots.value.filter((slot) => slot.type !== "particulier")
})

const particularSlots = computed(() => {
  return futureSlots.value.filter((slot) => slot.type === "particulier")
})

async function addSlot() {
  if (!newDate.value || !newStart.value || !newEnd.value) {
    return alert("Veuillez remplir tous les champs")
  }

  await $fetch("/api/admin/add-slot", {
    method: "POST",
    body: {
      date: newDate.value,
      start_time: newStart.value,
      end_time: newEnd.value,
      type: newType.value
    }
  })

  newDate.value = ""
  newStart.value = ""
  newEnd.value = ""
  newType.value = "pro"

  await loadSlots()
}

async function deleteSlot(id) {
  if (!confirm("Supprimer ce créneau ?")) return

  await $fetch(`/api/admin/delete-slot/${id}`, { method: "DELETE" })

  await loadSlots()
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(reservationLink.value)
    linkSentMessage.value = `✅ Lien ${selectedLinkLabel.value} copié dans le presse-papier`
  } catch (e) {
    const input = document.createElement("input")
    input.value = reservationLink.value
    document.body.appendChild(input)
    input.select()
    document.execCommand("copy")
    document.body.removeChild(input)

    linkSentMessage.value = `✅ Lien ${selectedLinkLabel.value} copié dans le presse-papier`
  }

  setTimeout(() => (linkSentMessage.value = ""), 3000)
}

async function sendLinkEmail() {
  if (!reservationEmail.value) {
    return alert("Veuillez saisir l'email du client")
  }

  sendingLink.value = true
  linkSentMessage.value = ""

  const res = await $fetch("/api/admin/send-reservation-link", {
    method: "POST",
    body: {
      type: selectedLinkType.value,
      email: reservationEmail.value,
      firstname: reservationFirstname.value,
      lastname: reservationLastname.value,
      phone: reservationPhone.value
    }
  })

  sendingLink.value = false

  if (res?.error) {
    return alert("Erreur : " + res.error)
  }

  linkSentMessage.value = `✉️ Mail ${selectedLinkLabel.value} envoyé à ${reservationEmail.value}`

  reservationFirstname.value = ""
  reservationLastname.value = ""
  reservationPhone.value = ""

  setTimeout(() => (linkSentMessage.value = ""), 5000)
}

function formatDateFr(dateStr) {
  const date = new Date(dateStr)

  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  })
}
</script>

<template>
  <div class="page admin-slots">
    <NuxtLink to="/admin" class="back-link">
      ← Retour à l'administration
    </NuxtLink>

    <div class="admin-page-heading">
      <div>
        <h1>
          Gestion des créneaux
        </h1>

        <p class="admin-intro">
          Ajoutez des disponibilités et envoyez les bons liens de réservation aux clients.
        </p>
      </div>
    </div>

    <section class="slots-top-grid">
      <div class="card admin-panel-card">
        <h2>Ajouter un créneau</h2>

        <p class="step-desc">
          Définissez une date, un horaire et le type de disponibilité.
        </p>

        <div class="form-grid">
          <input type="date" v-model="newDate" class="input" />
          <input type="time" step="300" v-model="newStart" class="input" />
          <input type="time" step="300" v-model="newEnd" class="input" />

          <select v-model="newType" class="input">
            <option value="pro">Professionel</option>
            <option value="particulier">Particulier</option>
          </select>
        </div>

        <button type="button" class="btn cta" @click="addSlot">
          Ajouter le créneau
        </button>
      </div>

      <div class="card admin-panel-card">
        <h2>Envoyer un lien</h2>

        <p class="step-desc">
          Sélectionnez le type de réservation, puis envoyez le lien adapté au client.
        </p>

        <div class="link-type-toggle">
          <button
            type="button"
            :class="['link-type-option', { active: selectedLinkType === 'pro' }]"
            @click="selectedLinkType = 'pro'"
          >
            Pro
          </button>

          <button
            type="button"
            :class="['link-type-option', { active: selectedLinkType === 'particulier' }]"
            @click="selectedLinkType = 'particulier'"
          >
            Particulier
          </button>
        </div>

        <div class="link-row">
          <input
            class="input link-input"
            :value="reservationLink"
            readonly
            @focus="$event.target.select()"
          />

          <button type="button" class="btn" @click="copyLink">
            Copier
          </button>
        </div>

        <h3 class="send-title">Envoyer le lien par mail</h3>

        <div class="particular-mail-grid">
          <input
            v-model="reservationEmail"
            type="email"
            class="input"
            placeholder="Email du client"
          />

          <input
            v-model="reservationFirstname"
            class="input"
            placeholder="Prénom"
          />

          <input
            v-model="reservationLastname"
            class="input"
            placeholder="Nom"
          />

          <input
            v-model="reservationPhone"
            class="input"
            placeholder="Téléphone"
          />
        </div>

        <button
          type="button"
          class="btn cta"
          :disabled="sendingLink"
          @click="sendLinkEmail"
        >
          {{ sendingLink ? "Envoi en cours..." : "Envoyer le mail" }}
        </button>

        <p v-if="linkSentMessage" class="link-feedback">
          {{ linkSentMessage }}
        </p>
      </div>
    </section>

    <section class="slots-list-grid">
      <div class="slots-column">
        <div class="slots-column-header">
          <div>
            <p class="section-kicker">Public</p>
            <h2>Créneaux professionnels</h2>
          </div>

          <span class="slots-count">
            {{ proSlots.length }}
          </span>
        </div>

        <div v-if="proSlots.length" class="slots-list">
          <div
            v-for="s in proSlots"
            :key="s.id"
            class="slot-admin-card"
          >
            <div>
              <strong>{{ formatDateFr(s.date) }}</strong>
              <p class="slot-hour">
                {{ s.start_time }} → {{ s.end_time }}
              </p>
            </div>

            <div class="slot-admin-right">
              <span class="type-badge badge-pro">
                Pro
              </span>

              <button class="btn danger compact-btn" @click="deleteSlot(s.id)">
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-admin-card compact-empty">
          <p>Aucun créneau pro à venir.</p>
        </div>
      </div>

      <div class="slots-column">
        <div class="slots-column-header">
          <div>
            <p class="section-kicker">Privé</p>
            <h2>Créneaux particuliers</h2>
          </div>

          <span class="slots-count">
            {{ particularSlots.length }}
          </span>
        </div>

        <div v-if="particularSlots.length" class="slots-list">
          <div
            v-for="s in particularSlots"
            :key="s.id"
            class="slot-admin-card"
          >
            <div>
              <strong>{{ formatDateFr(s.date) }}</strong>
              <p class="slot-hour">
                {{ s.start_time }} → {{ s.end_time }}
              </p>
            </div>

            <div class="slot-admin-right">
              <span class="type-badge badge-particulier">
                Particulier
              </span>

              <button class="btn danger compact-btn" @click="deleteSlot(s.id)">
                Supprimer
              </button>
            </div>
          </div>
        </div>

        <div v-else class="empty-admin-card compact-empty">
          <p>Aucun créneau particulier à venir.</p>
        </div>
      </div>
    </section>
  </div>
</template>