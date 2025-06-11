<template>
  <div class="chart-wrapper">
    <div class="filters">
      <Multiselect
        v-model="selectedGenres"
        :options="genres"
        :multiple="true"
        placeholder="选择类型"
        @select="handleSelect('genre')"
        @remove="handleRemove('genre')"
      />
      <Multiselect
        v-model="selectedPlatform"
        :options="platforms"
        :multiple="true"
        placeholder="选择平台"
        @select="handleSelect('platform')"
        @remove="handleRemove('platform')"
      />
      <Multiselect
        v-model="selectedPublisher"
        :options="publishers"
        :multiple="true"
        placeholder="选择发行商"
        @select="handleSelect('publisher')"
        @remove="handleRemove('publisher')"
      />
    </div>
    <div ref="chartRef" class="chart-box"></div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
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
const selectedPlatform = ref([])
const selectedPublisher = ref([])

// 处理选择事件
function handleSelect(type) {
  if (type === 'genre' && selectedGenres.value.length > 1) {
    resetOthers('genre')
  } else if (type === 'platform' && selectedPlatform.value.length > 1) {
    resetOthers('platform')
  } else if (type === 'publisher' && selectedPublisher.value.length > 1) {
    resetOthers('publisher')
  }
}

// 处理移除事件
function handleRemove(type) {
  if (type === 'genre' && selectedGenres.value.length > 1) {
    resetOthers('genre')
  } else if (type === 'platform' && selectedPlatform.value.length > 1) {
    resetOthers('platform')
  } else if (type === 'publisher' && selectedPublisher.value.length > 1) {
    resetOthers('publisher')
  }
}

// 重置其他选择器
function resetOthers(currentType) {
  if (currentType !== 'genre' && selectedGenres.value.length > 1) {
    selectedGenres.value = selectedGenres.value.length > 0 
      ? [selectedGenres.value[0]] 
      : []
  }
  
  if (currentType !== 'platform' && selectedPlatform.value.length > 1) {
    selectedPlatform.value = selectedPlatform.value.length > 0 
      ? [selectedPlatform.value[0]] 
      : []
  }
  
  if (currentType !== 'publisher' && selectedPublisher.value.length > 1) {
    selectedPublisher.value = selectedPublisher.value.length > 0 
      ? [selectedPublisher.value[0]] 
      : []
  }
}

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

  // 默认选择游戏类型前三项
  selectedGenres.value = genres.value.slice(0, 3)
  
  updateChart()
}

// 获取当前分组维度
const currentGroupField = computed(() => {
  if (selectedGenres.value.length > 1) return 'genre'
  if (selectedPlatform.value.length > 1) return 'platform'
  if (selectedPublisher.value.length > 1) return 'publisher'
  return 'genre' // 默认按类型分组
})

function updateChart() {
  if (!chartRef.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(chartRef.value)

  const allYears = Array.from(new Set(rawData.map(r => parseInt(r.year)))).filter(y => !isNaN(y)).sort((a, b) => a - b)
  
  const grouped = {}
  const groupField = currentGroupField.value
  let groupItems = []
  let chartTitle = '每年游戏总销量'

  // 确定分组项目和图表标题
  switch (groupField) {
    case 'genre':
      groupItems = selectedGenres.value.length > 0 ? selectedGenres.value : genres.value.slice(0, 3)
      chartTitle = '每年游戏总销量（按类型）'
      break
    case 'platform':
      groupItems = selectedPlatform.value.length > 0 ? selectedPlatform.value : platforms.value.slice(0, 3)
      chartTitle = '每年游戏总销量（按平台）'
      break
    case 'publisher':
      groupItems = selectedPublisher.value.length > 0 ? selectedPublisher.value : publishers.value.slice(0, 3)
      chartTitle = '每年游戏总销量（按发行商）'
      break
  }

  // 处理数据
  groupItems.forEach(item => {
    const yearMap = {}
    rawData.forEach(row => {
      const year = parseInt(row.year)
      const sales = parseFloat(row.total_sales)
      
      // 检查是否符合所有筛选条件
      const genreMatch = selectedGenres.value.length === 0 || 
                         (groupField === 'genre' ? row.genre === item : selectedGenres.value.includes(row.genre))
      
      const platformMatch = selectedPlatform.value.length === 0 || 
                           (groupField === 'platform' ? row.platform === item : selectedPlatform.value.includes(row.platform))
      
      const publisherMatch = selectedPublisher.value.length === 0 || 
                            (groupField === 'publisher' ? row.publisher === item : selectedPublisher.value.includes(row.publisher))
      
      if (genreMatch && platformMatch && publisherMatch && !isNaN(year) && !isNaN(sales)) {
        if (row[groupField] === item) {
          yearMap[year] = (yearMap[year] || 0) + sales
        }
      }
    })
    grouped[item] = yearMap
  })

  const series = Object.entries(grouped).map(([item, data]) => ({
    name: item,
    type: 'line',
    data: allYears.map(y => +(data[y] || 0).toFixed(2)),
    smooth: false, // 直线
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { width: 2 }
  }))

  // 图表配置
  const option = {
    title: {
      text: chartTitle,
      left: 'center',
      top: 8,
      textStyle: { fontSize: 14 }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        let result = `年份: ${params[0].name}<br/>`
        params.forEach(item => {
          result += `${item.marker} ${item.seriesName}: ${item.value} 百万<br/>`
        })
        return result
      }
    },
    legend: {
      type: 'scroll',
      bottom: 0,
      textStyle: { fontSize: 10 },
      pageIconSize: 10,
      pageTextStyle: { fontSize: 10 }
    },
    grid: {
      top: 40,
      bottom: 45,
      left: 50,
      right: 30,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: allYears,
      axisLabel: { rotate: 45 },
      name: '年份',
      nameLocation: 'end'
    },
    yAxis: {
      type: 'value',
      name: '销量（百万）',
      nameTextStyle: { padding: [0, 30, 0, 0] }
    },
    series
  }

  chartInstance.setOption(option)
  
  // 响应式调整
  const resizeHandler = () => chartInstance.resize()
  window.addEventListener('resize', resizeHandler)
}

watch([selectedGenres, selectedPlatform, selectedPublisher], () => {
  nextTick(updateChart)
}, { deep: true })

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.5rem;
  box-sizing: border-box;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
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
  height: 110%;
  min-height: 300px;
}

.multiselect {
  flex: 1;
  min-width: 120px;
}

.multiselect__tags {
  min-height: 36px;
  font-size: 0.9rem;
}

.multiselect__content-wrapper {
  max-height: 300px !important;
  overflow-y: auto !important;
}
</style>
