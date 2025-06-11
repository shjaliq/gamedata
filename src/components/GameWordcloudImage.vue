<template>
  <div class="image-box">
    <img :src="imageSrc"/>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()
const imageSrc = computed(() => gameStore.wordcloudImage)
</script>

<style scoped>
.image-box {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.image-box img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
}
</style>