//PieChart.vue
<template>
  <div class="pie-wrapper">
    <div class="chart-box pie-box">
      <div ref="pie1" class="pie" v-show="showType === 'genre'"></div>
      <div ref="pie2" class="pie" v-show="showType === 'platform'"></div>
      <button class="chart-switch" @click="switchChart">切换图表</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { chartState } from '@/utils/chartState'

const pie1 = ref(null)
const pie2 = ref(null)
const showType = ref('genre')

let chart1 = null
let chart2 = null

function switchChart() {
  showType.value = showType.value === 'genre' ? 'platform' : 'genre'
  nextTick(() => {
    chart1?.resize()
    chart2?.resize()
  })
}

function initCharts() {
  if (!pie1.value || !pie2.value) return

  chart1 = echarts.init(pie1.value)
  chart2 = echarts.init(pie2.value)

  renderCharts()
}

function renderCharts() {
  const baseOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      bottom: 5,
      orient: 'horizontal',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#666', fontSize: 12 }
    },
    series: [
      {
        type: 'pie',
        radius: ['0%', '60%'],
        center: ['50%', '50%'],
        label: { show: false },
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        }
      }
    ]
  }

  chart1.setOption({
    ...baseOption,
    title: { text: '游戏类型分布', left: 'center' },
    color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'],
    series: [{ ...baseOption.series[0], data: chartState.genreData }]
  })

  chart2.setOption({
    ...baseOption,
    title: { text: '平台分布', left: 'center' },
    color: ['#9a60b4', '#e7969c', '#7b4173', '#3182bd', '#756bb1'],
    series: [{ ...baseOption.series[0], data: chartState.platformData }]
  })

  chart1.resize()
  chart2.resize()
}

// 响应式更新
watch(
  () => [chartState.genreData, chartState.platformData],
  () => {
    if (chart1 && chart2) renderCharts()
  },
  { deep: true }
)

onMounted(() => {
  nextTick(() => {
    initCharts()
    window.addEventListener('resize', () => {
      chart1?.resize()
      chart2?.resize()
    })
  })
})

onBeforeUnmount(() => {
  chart1?.dispose()
  chart2?.dispose()
})
</script>

<style scoped>
.pie-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.pie-box {
  position: relative;
  width: 100%;
  height: 100%;
}

.pie {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.chart-switch {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.chart-switch:hover {
  background: #40a9ff;
}
</style>
