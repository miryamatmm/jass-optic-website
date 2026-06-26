<script setup>
import SlotCard from '@/components/SlotCard.vue'
import FileUpload from '@/components/FileUpload.vue'

const config = useRuntimeConfig()
const route = useRoute()

const isParticular = computed(() => route.path === '/reserver/particulier')
const slotType = computed(() => isParticular.value ? 'particulier' : 'pro')

const pageTitle = computed(() => {
  return isParticular.value
    ? 'Réserver votre créneau privé'
    : 'Réserver votre créneau'
})

const pageIntro = computed(() => {
  return isParticular.value
    ? 'Sélectionnez un créneau particulier parmi les disponibilités qui vous ont été transmises.'
    : 'Choisissez un créneau disponible et complétez vos informations pour préparer votre dossier.'
})

const slots = ref([])
const selectedSlot = ref(null)

const firstname = ref("")
const lastname = ref("")
const email = ref("")
const phone = ref("")

const ordonnance = ref(null)
const mutuelle = ref(null)

const loading = ref(false)
const success = ref(false)
const error = ref("")

onMounted(async () => {
  const data = await $fetch(`${config.public.supabaseUrl}/rest/v1/slots?select=*`, {
    headers: { apikey: config.public.supabaseAnonKey }
  })

  const now = new Date()

  const filtered = data.filter(slot => {
    const slotDate = new Date(slot.date + "T" + slot.start_time)

    if (slotDate < now) return false

    const t = slot.type === 'particulier' ? 'particulier' : 'pro'

    return t === slotType.value
  })

  filtered.sort((a, b) => {
    const da = new Date(a.date + "T" + a.start_time)
    const db = new Date(b.date + "T" + b.start_time)
    return da - db
  })

  slots.value = filtered
})

async function uploadFile(file, type) {
  if (!file) return null

  const form = new FormData()
  form.append("file", file)
  form.append("type", type)

  const res = await $fetch("/api/upload", {
    method: "POST",
    body: form
  })

  return res.url
}

async function submit() {
  error.value = ""

  if (!selectedSlot.value) {
    error.value = "Merci de choisir un créneau."
    return
  }

  if (!firstname.value || !lastname.value || !email.value || !phone.value) {
    error.value = "Merci de remplir tous les champs obligatoires."
    return
  }

  loading.value = true

  try {
    const ordonnancePath = await uploadFile(ordonnance.value, "ordonnances")
    const mutuellePath = await uploadFile(mutuelle.value, "mutuelle")

    const res = await $fetch("/api/reserve", {
      method: "POST",
      body: {
        slot_id: selectedSlot.value.id,
        firstname: firstname.value,
        lastname: lastname.value,
        email: email.value,
        phone: phone.value,
        ordonnance_url: ordonnancePath,
        mutuelle_url: mutuellePath,
        type: slotType.value
      }
    })

    if (res.error) {
      error.value = "Erreur : " + res.error
      return
    }

    const emailRes = await $fetch("/api/send-email", {
      method: "POST",
      body: {
        email: email.value,
        firstname: firstname.value,
        lastname: lastname.value,
        phone: phone.value,
        slotDate: selectedSlot.value.date,
        slotHour: `${selectedSlot.value.start_time} → ${selectedSlot.value.end_time}`,
        type: slotType.value
      }
    })

    if (emailRes?.error) {
      error.value = "Réservation confirmée, mais l’email n’a pas pu être envoyé."
    }

    success.value = true
  } catch (err) {
    console.error(err)
    error.value = "Impossible de confirmer la réservation pour le moment."
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="reservation-page">
    <header class="header">
      <NuxtLink to="/" class="brand">
        <img src="/images/logo.png" alt="Jass Optic" class="logo" />
      </NuxtLink>

      <nav class="nav">
        <NuxtLink to="/">Accueil</NuxtLink>
        <NuxtLink to="/avis">Avis</NuxtLink>
        <NuxtLink to="/contact">Contact</NuxtLink>
      </nav>
    </header>

    <main class="page reservation">
      <section class="reservation-hero">
        <p class="section-kicker">
          {{ isParticular ? "Réservation privée" : "Réservation" }}
        </p>

        <h1>
          {{ pageTitle }}
        </h1>

        <p>
          {{ pageIntro }}
        </p>
      </section>

      <div v-if="success" class="card success reservation-success-card">
        <h2>Réservation confirmée</h2>

        <p class="sub">
          Votre demande a bien été enregistrée.
          Nous vous contacterons rapidement.
        </p>

        <NuxtLink to="/" class="btn cta">
          Retour à l’accueil
        </NuxtLink>
      </div>

      <div v-else class="reservation-content">
        <section class="card reservation-step-card">
          <div class="reservation-step-heading">
            <span>01</span>
            <div>
              <h2>Choisissez un créneau</h2>
              <p class="step-desc">
                Sélectionnez l’horaire qui vous convient.
              </p>
            </div>
          </div>

          <div class="reservation-type-info">
            <span
              class="type-badge"
              :class="isParticular ? 'badge-particulier' : 'badge-pro'"
            >
              {{ isParticular ? "Particulier" : "Pro" }}
            </span>
          </div>

          <SlotCard
            v-for="slot in slots"
            :key="slot.id"
            :slot="slot"
            @select="selectedSlot = $event"
          />

          <div v-if="slots.length === 0" class="empty-slots">
            <p>Aucun créneau disponible pour le moment.</p>
            <NuxtLink to="/contact">Nous contacter</NuxtLink>
          </div>

          <p v-if="selectedSlot" class="selected-info">
            Créneau sélectionné :
            <strong>{{ selectedSlot.start_time }} → {{ selectedSlot.end_time }}</strong>
          </p>
        </section>

        <section class="card reservation-step-card" id="infos">
          <div class="reservation-step-heading">
            <span>02</span>
            <div>
              <h2>Vos informations</h2>
              <p class="step-desc">
                Ces informations nous permettent de préparer votre dossier.
              </p>
            </div>
          </div>

          <div class="reservation-form-grid">
            <input v-model="firstname" class="input" placeholder="Prénom" />
            <input v-model="lastname" class="input" placeholder="Nom" />
          </div>

          <input
            v-model="email"
            class="input"
            type="email"
            placeholder="Adresse email"
          />

          <input
            v-model="phone"
            class="input"
            type="tel"
            placeholder="Téléphone"
          />
        </section>

        <section class="card reservation-step-card">
          <div class="reservation-step-heading">
            <span>03</span>
            <div>
              <h2>Documents</h2>
              <p class="step-desc">
                Merci de joindre les documents nécessaires si vous les avez.
              </p>
            </div>
          </div>

          <FileUpload
            label="Ordonnance"
            id="ordonnance"
            @update:file="ordonnance = $event"
          />

          <FileUpload
            label="Carte mutuelle"
            id="mutuelle"
            @update:file="mutuelle = $event"
          />
        </section>

        <p v-if="error" class="error-message reservation-error">
          {{ error }}
        </p>

        <button
          class="btn cta-full"
          @click="submit"
          :disabled="loading"
        >
          {{ loading ? "Envoi en cours..." : "Confirmer la réservation" }}
        </button>
      </div>
    </main>
  </div>
</template>