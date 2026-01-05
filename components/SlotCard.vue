<template>
  <div class="card slot-card">
    <div class="slot-info">
      <strong>{{ formattedDate }}</strong>
      <div>{{ slot.start_time }} → {{ slot.end_time }}</div>
    </div>

    <button
      class="btn"
      :disabled="slot.reserved"
      @click="$emit('select', slot)"
    >
      <span v-if="!slot.reserved">Réserver</span>
      <span v-else>Déjà réservé</span>
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  slot: { type: Object, required: true }
});

const formattedDate = computed(() => {
  const d = new Date(props.slot.date);
  return d.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
});
</script>
