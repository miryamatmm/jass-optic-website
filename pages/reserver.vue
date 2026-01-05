<script setup>
import SlotCard from '@/components/SlotCard.vue'
import FileUpload from '@/components/FileUpload.vue'

const config = useRuntimeConfig()

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

/* ----------- 1) Charger les créneaux ----------- */
onMounted(async () => {
  const data = await $fetch(`${config.public.supabaseUrl}/rest/v1/slots?select=*`, {
    headers: { apikey: config.public.supabaseAnonKey }
  })

  // TRIER par date puis heure
  data.sort((a, b) => {
    const da = new Date(a.date + "T" + a.start_time)
    const db = new Date(b.date + "T" + b.start_time)
    return da - db
  })

  slots.value = data
})



/* ----------- 2) Upload fichier via notre API ----------- */
async function uploadFile(file, type) {
  if (!file) return null

  const form = new FormData()
  form.append("file", file)
  form.append("type", type) // ordonnance / mutuelle

  const res = await $fetch("/api/upload", {
    method: "POST",
    body: form
  })

  return res.url // ⇦ très important
}


/* ----------- 3) Soumettre la réservation ----------- */
async function submit() {
  if (!selectedSlot.value) return alert("Choisissez un créneau")
  if (!firstname.value || !lastname.value || !email.value || !phone.value)
    return alert("Tous les champs sont obligatoires")

  loading.value = true

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
      mutuelle_url: mutuellePath
    }
  })

  if (res.error) {
    alert("Erreur : " + res.error)
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
      slotHour: `${selectedSlot.value.start_time} → ${selectedSlot.value.end_time}`
    }
  })

  if (emailRes?.error) {
    alert("Réservation confirmée, mais l’email n’a pas pu être envoyé.")
  }

  loading.value = false
  success.value = true
}
</script>

<template>
  <div class="page reservation">

    <h1>
      Réserver votre créneau
    </h1>

    <!-- Confirmation -->
    <div v-if="success" class="card success">
      <h2>Réservation confirmée</h2>
      <p class="sub">
        Votre demande a bien été enregistrée.
        Nous vous contacterons rapidement.
      </p>

      <NuxtLink to="/" class="btn cta">
        Retour à l’accueil
      </NuxtLink>
    </div>

    <div v-else>

      <!-- ÉTAPE 1 : Créneaux -->
      <div class="card">
        <h2>Choisissez un créneau</h2>
        <p class="step-desc">
          Sélectionnez l’horaire qui vous convient.
        </p>

        <SlotCard
          v-for="slot in slots"
          :key="slot.id"
          :slot="slot"
          @select="selectedSlot = $event"
        />

        <p v-if="selectedSlot" class="selected-info">
          Créneau sélectionné :
          <strong>{{ selectedSlot.start_time }} → {{ selectedSlot.end_time }}</strong>
        </p>
      </div>

      <!-- ÉTAPE 2 : Infos -->
      <div class="card">
        <h2>Vos informations</h2>
        <p class="step-desc">
          Ces informations nous permettent de préparer votre dossier.
        </p>

        <input v-model="firstname" class="input" placeholder="Prénom" />
        <input v-model="lastname" class="input" placeholder="Nom" />
        <input v-model="email" class="input" placeholder="Adresse email" />
        <input v-model="phone" class="input" placeholder="Téléphone" />
      </div>

      <!-- ÉTAPE 3 : Documents -->
      <div class="card">
        <h2>Documents</h2>
        <p class="step-desc">
          Merci de joindre les documents nécessaires.
        </p>

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
      </div>

      <!-- CTA FINAL -->
      <button
        class="btn cta-full"
        @click="submit"
        :disabled="loading"
      >
        {{ loading ? "Envoi en cours..." : "Confirmer la réservation" }}
      </button>

    </div>
  </div>
</template>

