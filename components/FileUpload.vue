<template>
  <div class="file-upload card">
    <label :for="id" class="label">{{ label }}</label>

    <input
      :id="id"
      type="file"
      class="input"
      @change="handleFile"
      accept=".pdf, image/*"
    />

    <div v-if="filename" class="file-name">
      📄 {{ filename }}
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["update:file"])
const props = defineProps({
  label: String,
  id: String
});

const filename = ref("");

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  filename.value = file.name;
  emit("update:file", file);
}
</script>

<style scoped>
.label {
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}
</style>
