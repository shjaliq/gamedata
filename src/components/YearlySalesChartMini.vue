<template>
  <div class="chart-wrapper">
    <div class="filters">
      <Multiselect
        v-model="selectedGenres"
        :options="genres"
        :multiple="true"
        placeholder="选择类型"
      />
      <Multiselect
        v-model="selectedPlatform"
        :options="platforms"
        :disabled="!isSingleGenre"
        placeholder="选择平台"
      />
      <Multiselect
        v-model="selectedPublisher"
        :options="publishers"
        :disabled="!isSingleGenre"
        placeholder="选择发行商"
      />
    </div>
    <div ref="chartRef" class="chart-box"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import * as echarts from 'echarts'
import Papa from 'papaparse'

const chartRef = ref(null)
let chartInstance = null
let rawData = []

const genres = ref([])
const platforms = ref([])
const publishers = ref([])

const selectedGenres = ref([])
const selectedPlatform = ref('')
const selectedPublisher = ref('')

const isSingleGenre = computed(() => selectedGenres.value.length <= 1)

function getSortedListByFrequency(list) {
  const freqMap = {}
  list.forEach(item => {
    const key = item?.trim()
    if (key) freqMap[key] = (freqMap[key] || 0) + 1
  })
  return Object.entries(freqMap).sort((a, b) => b[1] - a[1]).map(([key]) => key)
}

async function fetchData() {
  const res = await fetch(import.meta.env.BASE_URL + '/Video_Games.csv')
  const text = await res.text()
  const parsed = Papa.parse(text, { header: true })
  rawData = parsed.data

  genres.value = getSortedListByFrequency(rawData.map(r => r.genre))
  platforms.value = getSortedListByFrequency(rawData.map(r => r.platform))
  publishers.value = getSortedListByFrequency(rawData.map(r => r.publisher))

  updateChart()
}

function updateChart() {
  if (!chartRef.value) return
  if (!chartInstance) chartInstance = echarts.init(chartRef.value)

  const allYears = Array.from(new Set(rawData.map(r => parseInt(r.year)))).filter(y => !isNaN(y)).sort((a, b) => a - b)
  const grouped = {}

  selectedGenres.value.forEach(genre => {
    const yearMap = {}
    rawData.forEach(row => {
      const year = parseInt(row.year)
      const sales = parseFloat(row.total_sales)
      if (
        row.genre === genre &&
        (!selectedPlatform.value || row.platform === selectedPlatform.value) &&
        (!selectedPublisher.value || row.publisher === selectedPublisher.value) &&
        !isNaN(year) && !isNaN(sales)
      ) {
        yearMap[year] = (yearMap[year] || 0) + sales
      }
    })
    grouped[genre] = yearMap
  })

  const series = Object.entries(grouped).map(([genre, data]) => ({
    name: genre,
    type: 'line',
    data: allYears.map(y => +(data[y] || 0).toFixed(2)),
    smooth: false
  }))

  chartInstance.setOption({
    title: {
      text: '每年游戏总销量（按类型）',
      left: 'center',
      top: 8,
      textStyle: { fontSize: 13 }
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      textStyle: { fontSize: 10 }
    },
    xAxis: {
      type: 'category',
      data: allYears
    },
    yAxis: {
      type: 'value',
      name: '销量（百万）'
    },
    grid: {
      top: 35,
      bottom: 45,
      left: 40,
      right: 20
    },
    series
  })
}

watch([selectedGenres, selectedPlatform, selectedPublisher], updateChart, { deep: true })
onMounted(fetchData)
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  z-index: 10;
  position: relative;
}

.chart-box {
  flex: 1;
  width: 100%;
  height: 100%;
  min-height: 200px;
}

.multiselect__content-wrapper {
  max-height: 300px !important;
  overflow-y: auto !important;
}
</style>
