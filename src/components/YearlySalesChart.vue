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
        v-model="selectedPlatforms"
        :options="platforms"
        :multiple="true"
        placeholder="选择平台"
      />
      <Multiselect
        v-model="selectedPublishers"
        :options="publishers"
        :multiple="true"
        placeholder="选择发行商"
      />

    </div>

    <div ref="chartRef" class="chart-box"></div>
  </div>
</template>

<script setup>
import Multiselect from 'vue-multiselect'
import 'vue-multiselect/dist/vue-multiselect.min.css'
import { ref, watch, onMounted } from 'vue'
import * as echarts from 'echarts'
import Papa from 'papaparse'

const chartRef = ref(null)
let rawData = []

const genres = ref([])
const platforms = ref([])
const publishers = ref([])

const selectedGenres = ref([])
const selectedPlatform = ref('')
const selectedPublisher = ref('')

// 自动限制其他为单选
watch(selectedGenres, (val) => {
  if (val.length > 1) {
    selectedPlatform.value = ''
    selectedPublisher.value = ''
  }
})

// 获取频率排序的字段值
function getSortedListByFrequency(list) {
  const freqMap = {}
  list.forEach(item => {
    const key = item?.trim()
    if (key) freqMap[key] = (freqMap[key] || 0) + 1
  })
  return Object.entries(freqMap).sort((a, b) => b[1] - a[1]).map(([key]) => key)
}

async function fetchData() {
  const response = await fetch(import.meta.env.BASE_URL + '/Video_Games.csv')
  const csvText = await response.text()
  const parsed = Papa.parse(csvText, { header: true })
  rawData = parsed.data

  genres.value = getSortedListByFrequency(rawData.map(r => r.genre))
  platforms.value = getSortedListByFrequency(rawData.map(r => r.platform))
  publishers.value = getSortedListByFrequency(rawData.map(r => r.publisher))

  updateChart()
}

function updateChart() {
  const chart = echarts.init(chartRef.value)

  const grouped = {}
  const allYears = Array.from(new Set(rawData.map(r => parseInt(r.year)))).filter(y => !isNaN(y)).sort((a, b) => a - b)

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
    data: allYears.map(y => parseFloat((data[y] || 0).toFixed(2))),
    smooth: false
  }))

  chart.setOption({
    title: { text: '每年游戏总销量（按类型）' },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const year = params[0]?.axisValue
        const lines = params.map(p => `${p.marker} ${p.seriesName}: ${p.data.toFixed(2)} M`).join('<br/>')
        return `<strong>${year}</strong><br/>${lines}`
      }
    },
    legend: { data: selectedGenres.value },
    xAxis: { type: 'category', data: allYears },
    yAxis: { type: 'value', name: '销量（百万）' },
    series
  })

  window.addEventListener('resize', () => chart.resize())
}

watch([selectedGenres, selectedPlatform, selectedPublisher], updateChart)
onMounted(fetchData)
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0.75rem;
  box-sizing: border-box;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  max-height: 6rem;
  overflow-y: auto;
}

.chart-box {
  flex: 1;
  width: 100%;
  height: 100%;
}

</style>
