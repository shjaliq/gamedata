<template>
    <div class="gallery-grid">
      <div v-for="game in filteredGames" :key="game.name" class="game-item">
        <img :src="getImageUrl(game.name)" :alt="game.name" />
        <div class="caption">{{ game.name }}</div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import Papa from 'papaparse'
  
  const filteredGames = ref([])
  
  function getImageUrl(name) {
    const safeName = name.replace(/[^a-zA-Z0-9]/g, '_')
    return `/images/${safeName}.jpg`
  }
  
  async function fetchGames() {
    const res = await fetch(import.meta.env.BASE_URL + '/Video_Games.csv')
    const text = await res.text()
    const { data } = Papa.parse(text, { header: true })
  
    // 取销量前10游戏作为示例
    const topGames = data
      .filter(r => r.name && r.total_sales)
      .sort((a, b) => parseFloat(b.total_sales) - parseFloat(a.total_sales))
      .slice(0, 10)
  
    filteredGames.value = topGames
  }
  
  onMounted(fetchGames)
  </script>
  
  <style scoped>
  .gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 0.5rem;
    max-height: 100%;
    overflow-y: auto;
  }
  .game-item {
    text-align: center;
    font-size: 0.75rem;
  }
  .game-item img {
    width: 100%;
    height: auto;
    border-radius: 4px;
    object-fit: cover;
  }
  .caption {
    margin-top: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  </style>
  