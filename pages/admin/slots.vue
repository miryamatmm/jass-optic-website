<script setup>
const config = useRuntimeConfig()
const slots = ref([])

const newDate = ref("")
const newStart = ref("")
const newEnd = ref("")

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
    }
  })

  newDate.value = ""
  newStart.value = ""
  newEnd.value = ""
  loadSlots()
}

async function deleteSlot(id) {
  if (!confirm("Supprimer ce créneau ?")) return

  await $fetch(`/api/admin/delete-slot/${id}`, { method: "DELETE" })
  loadSlots()
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
      </div>

       <button type="button" class="btn cta" @click="addSlot">
        Ajouter le créneau
      </button>
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

        <button class="btn danger" @click="deleteSlot(s.id)">
          Supprimer
        </button>
      </div>
    </div>

  </div>
</template>
