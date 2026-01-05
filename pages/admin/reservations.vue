<script setup>
const config = useRuntimeConfig()
const reservations = ref([])
const newCount = ref(0)

// regroupées par date
const grouped = ref({})

async function load() {
  const data = await $fetch("/api/admin/get-reservations")

  reservations.value = data.reservations
  newCount.value = data.newCount

  // Regrouper par date
  const byDate = {}

  data.reservations.forEach(r => {
    if (!r.slot?.date) return

    const d = r.slot.date.split("T")[0]

    if (!byDate[d]) byDate[d] = []
    byDate[d].push(r)
  })

  // Trier les dates
  const ordered = Object.keys(byDate).sort()

  const final = {}
  ordered.forEach(date => {
    final[date] = byDate[date]
  })

  grouped.value = final
}

onMounted(load)

async function cancel(id) {
  if (!confirm("Annuler cette réservation ?")) return
  await $fetch(`/api/admin/cancel-reservation/${id}`, { method: "DELETE" })
  load()
}

async function validateR(id) {
  await $fetch(`/api/admin/validate-reservation/${id}`, { method: "POST" })
  load()
}

function formatSlot(slot) {
  if (!slot?.date) return ""

  const d = new Date(slot.date)

  const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
  const mois = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ]

  const jour = jours[d.getDay()]
  const jourNum = d.getDate()
  const moisTxt = mois[d.getMonth()]

  const h1 = slot.start_time.slice(0, 5)
  const h2 = slot.end_time.slice(0, 5)

  return `${jour} ${jourNum} ${moisTxt} — ${h1} → ${h2}`
}
</script>

<template>
  <div class="page admin-reservations">

    <!-- HEADER -->
    <div class="admin-header">
      <h1>Réservations</h1>

      <div v-if="newCount > 0" class="badge">
        {{ newCount }} en attente
      </div>
    </div>

    <!-- GROUPES PAR DATE -->
    <div v-for="(items, date) in grouped" :key="date">

      <h2 class="date-title">
        {{ new Date(date).toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long"
        }) }}
      </h2>

      <!-- RÉSERVATION -->
      <div class="card reservation-card" v-for="r in items" :key="r.id">

        <div class="reservation-header">
          <h3>{{ r.firstname }} {{ r.lastname }}</h3>

          <span v-if="r.validated" class="status validated">
            Validée
          </span>
          <span v-else class="status pending">
            En attente
          </span>
        </div>

        <p class="contact">
          {{ r.email }} · {{ r.phone }}
        </p>

        <p class="slot-info">
          <strong>Créneau :</strong> {{ formatSlot(r.slot) }}
        </p>

        <!-- DOCUMENTS -->
        <div class="documents">

          <div class="download-row">
            <span>Ordonnance</span>

            <a
              v-if="r.ordonnance_url"
              :href="r.ordonnance_url"
              class="download-pill"
              target="_blank"
            >
              Télécharger
            </a>

            <span v-else class="download-empty">
              Aucun fichier
            </span>
          </div>

          <div class="download-row">
            <span>Carte mutuelle</span>

            <a
              v-if="r.mutuelle_url"
              :href="r.mutuelle_url"
              class="download-pill"
              target="_blank"
            >
              Télécharger
            </a>

            <span v-else class="download-empty">
              Aucun fichier
            </span>
          </div>

        </div>

        <!-- ACTIONS -->
        <div class="btn-row">
          <button
            class="btn"
            :disabled="r.validated"
            @click="!r.validated && validateR(r.id)"
          >
            {{ r.validated ? "Déjà validée" : "Valider" }}
          </button>

          <button class="btn danger" @click="cancel(r.id)">
            Annuler
          </button>
        </div>

      </div>
    </div>
  </div>
</template>
