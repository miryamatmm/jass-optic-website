<!--
  Page wrapper : la logique métier reste dans pages/reserver.vue.
  On expose simplement une URL distincte (/reserver/particulier) qui
  permet à la page de détecter qu'on est en mode "particulier"
  via useRoute().path.
-->
<template>
  <Reserver />
</template>

<script setup>
import Reserver from '../reserver.vue'

// /reserver/particulier est traitée exactement comme /reserver :
// la page détecte le mode particulier via useRoute().path === '/reserver/particulier'
// (cf. pages/reserver.vue)
</script>