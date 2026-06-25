<script setup>
const config = useRuntimeConfig()
const slots = ref([])

const newDate = ref("")
const newStart = ref("")
const newEnd = ref("")
const newType = ref("pro") // "pro" | "particulier"

// --- Envoi lien particulier ---
const particularEmail = ref("")
const particularFirstname = ref("")
const particularLastname = ref("")
const particularPhone = ref("")
const sendingLink = ref(false)
const linkSentMessage = ref("")

const particularLink = computed(() => {
  const base = config.public.publicBaseUrl || "https://jassoptic.fr"
  return `${base}/reserver/particulier`
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

  return slots.value.filter(s => {
    const endDateTime = new Date(`${s.date}T${s.end_time}`)
    return endDateTime > now
  })
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
  loadSlots()
}

async function deleteSlot(id) {
  if (!confirm("Supprimer ce créneau ?")) return

  await $fetch(`/api/admin/delete-slot/${id}`, { method: "DELETE" })
  loadSlots()
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(particularLink.value)
    linkSentMessage.value = "✅ Lien copié dans le presse-papier"
  } catch (e) {
    // Fallback si clipboard API bloquée
    const input = document.createElement("input")
    input.value = particularLink.value
    document.body.appendChild(input)
    input.select()
    document.execCommand("copy")
    document.body.removeChild(input)
    linkSentMessage.value = "✅ Lien copié dans le presse-papier"
  }
  setTimeout(() => (linkSentMessage.value = ""), 3000)
}

async function sendLinkEmail() {
  if (!particularEmail.value) {
    return alert("Veuillez saisir l'email du particulier")
  }

  sendingLink.value = true
  linkSentMessage.value = ""

  const res = await $fetch("/api/admin/send-particular-link", {
    method: "POST",
    body: {
      email: particularEmail.value,
      firstname: particularFirstname.value,
      lastname: particularLastname.value,
      phone: particularPhone.value
    }
  })

  sendingLink.value = false

  if (res?.error) {
    return alert("Erreur : " + res.error)
  }

  linkSentMessage.value = "✉️ Mail envoyé à " + particularEmail.value

  // reset (on garde l'email pour permettre un nouvel envoi rapide)
  particularFirstname.value = ""
  particularLastname.value = ""
  particularPhone.value = ""

  setTimeout(() => (linkSentMessage.value = ""), 5000)
}

function formatDateFr(dateStr) {
  const date = new Date(dateStr)

  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}
</script>

<template>
  <div class="page admin-slots">

    <h1>
      Gestion des créneaux
    </h1>

    <!-- AJOUT -->
    <div class="card">
      <h2>Ajouter un créneau</h2>
      <p class="step-desc">
        Définissez une date et un horaire de disponibilité.
      </p>

      <div class="form-grid">
        <input type="date" v-model="newDate" class="input" />
        <input type="time" step="300" v-model="newStart" class="input" />
        <input type="time" step="300" v-model="newEnd" class="input" />
        <select v-model="newType" class="input">
          <option value="pro">Pro (public)</option>
          <option value="particulier">Particulier (lien privé)</option>
        </select>
      </div>

       <button type="button" class="btn cta" @click="addSlot">
        Ajouter le créneau
      </button>
    </div>

    <!-- LIEN PARTICULIER -->
    <div class="card">
      <h2>Lien de réservation particulier</h2>
      <p class="step-desc">
        Partagez ce lien à un client ciblé pour qu'il réserve un créneau particulier.
      </p>

      <div class="link-row">
        <input
          class="input link-input"
          :value="particularLink"
          readonly
          @focus="$event.target.select()"
        />
        <button type="button" class="btn" @click="copyLink">
          📋 Copier
        </button>
      </div>

      <h3 class="send-title">Envoyer le lien par mail</h3>

      <div class="form-grid">
        <input
          v-model="particularEmail"
          type="email"
          class="input"
          placeholder="Email du particulier"
        />
        <input
          v-model="particularFirstname"
          class="input"
          placeholder="Prénom (optionnel)"
        />
        <input
          v-model="particularLastname"
          class="input"
          placeholder="Nom (optionnel)"
        />
        <input
          v-model="particularPhone"
          class="input"
          placeholder="Téléphone (optionnel)"
        />
      </div>

      <button
        type="button"
        class="btn cta"
        :disabled="sendingLink"
        @click="sendLinkEmail"
      >
        {{ sendingLink ? "Envoi en cours..." : "✉️ Envoyer le mail" }}
      </button>

      <p v-if="linkSentMessage" class="link-feedback">
        {{ linkSentMessage }}
      </p>
    </div>

    <!-- LISTE -->
    <div class="card" v-for="s in futureSlots" :key="s.id">
      <div class="slot-admin-line">
        <div>
          <strong>{{ formatDateFr(s.date) }}</strong>
          <p class="slot-hour">
            {{ s.start_time }} → {{ s.end_time }}
          </p>
        </div>

        <div class="slot-admin-right">
          <span
            class="type-badge"
            :class="s.type === 'particulier' ? 'badge-particulier' : 'badge-pro'"
          >
            {{ s.type === 'particulier' ? 'Particulier' : 'Pro' }}
          </span>

          <button class="btn danger" @click="deleteSlot(s.id)">
            Supprimer
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.slot-admin-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.slot-admin-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slot-hour {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 4px;
}

.type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-pro {
  background: var(--text-main);
  color: #fff;
}

.badge-particulier {
  background: var(--accent);
  color: #fff;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.link-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 12px 0 24px;
}

.link-input {
  flex: 1;
  font-family: monospace;
  font-size: 13px;
  background: var(--bg-main);
}

.send-title {
  font-size: 16px;
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 12px;
  font-family: inherit;
}

.link-feedback {
  margin-top: 12px;
  font-size: 14px;
  color: var(--accent-hover);
  text-align: center;
}
</style>
