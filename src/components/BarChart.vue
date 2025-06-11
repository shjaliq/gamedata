<template>
  <div ref="chartRef" style="width: 100%; height: 100%"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import * as d3 from 'd3'
import { chartState, loadRawData, updatePieData } from '@/utils/chartState'
import { useGameStore } from '@/stores/gameStore'
const gameStore = useGameStore()

const chartRef = ref()
let chart = null

function processData(viewType) {
  const data = chartState.rawData
  let groupKey, sortFn, filtered = data

  if (viewType === 'year') {
    groupKey = 'year'
    sortFn = (a, b) => a[0] - b[0]
  } else if (viewType === 'publisher') {
    filtered = data.filter((d) => d.year === chartState.currentYear)
    groupKey = 'publisher'
    sortFn = (a, b) => a[0].localeCompare(b[0])
  } else if (viewType === 'game') {
    filtered = data.filter(
      (d) => d.year === chartState.currentYear && d.publisher === chartState.currentPublisher
    )
    groupKey = 'name'
    sortFn = (a, b) => a[0].localeCompare(b[0])
  }

  const grouped = d3.rollup(
    filtered,
    (v) => d3.sum(v, (d) => d.total_sales),
    (d) => d[groupKey]
  )

  return Array.from(grouped)
    .sort(sortFn)
    .map(([key, value]) => ({
      name: groupKey === 'year' ? `${key}年` : key.toString(),
      value: parseFloat(value.toFixed(2)),
      rawKey: key
    }))
}

function renderBar(data, title) {
  if (!data || data.length === 0) return

  if (!chart && chartRef.value) {
    chart = echarts.init(chartRef.value)
  }

  const option = {
    xAxis: {
      type: 'category',
      data: data.map((d) => d.name),
      axisLabel: {
        rotate: 45,
        interval: 'auto', // 自动调整间隔，避免过密
        overflow: 'truncate', // 超出部分截断显示
        hideOverlap: true
      },
      axisTick: { alignWithLabel: true }
    },
    yAxis: {
      type: 'value',
      min: 0,
      minInterval: chartState.currentView === 'game' ? 0.1 : 1,
      axisLabel: {
        formatter: (val) => `${val.toFixed(0)} 万`
      },
      splitLine: {
        show: true,
        lineStyle: { type: 'dashed' }
      }
    },
    
    grid: {
      left: 60,
      right: 10,
      top: 50,
      bottom: chartState.currentView !== 'year' ? 80 : 50 // 为滑条预留空间
    },
    series: [
      {
        type: 'bar',
        data: data.map((d) => ({
          name: d.name,
          value: d.value
        })),
        itemStyle: {
          color: '#1890ff',
          borderRadius: [6, 6, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: ({ value }) => `${value.toFixed(1)}万`
        }
      }
    ],
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const p = params[0]
        const viewMap = { year: '年份', publisher: '厂商', game: '游戏' }
        return `${viewMap[chartState.currentView]}：${p.name}<br>销量：${p.value}万`
      }
    },
    title: {
      text: title,
      left: 'center'
    },
    grid: {
      left: 60,
      right: 10,
      top: 50,
      bottom: 50
    }
  }

  chart.setOption(option)

  chart.off('click')
  chart.on('click', ({ dataIndex }) => {
      const selected = data[dataIndex]
      if (!selected) return

      chartState.dataStack.push({
        data,
        title,
        viewType: chartState.currentView,
        currentYear: chartState.currentYear,
        currentPublisher: chartState.currentPublisher
      })

      if (chartState.currentView === 'year') {
        chartState.currentYear = selected.rawKey
        chartState.currentView = 'publisher'
      } else if (chartState.currentView === 'publisher') {
        chartState.currentPublisher = selected.rawKey
        chartState.currentView = 'game'
      } else if (chartState.currentView === 'game') {
        // ✅ 点击游戏时设置选中游戏
        gameStore.setSelectedGame(selected.rawKey)
      }

      const newData = processData(chartState.currentView)
      updatePieData()
      renderBar(newData, getChartTitle())
    })

  chart.getZr().off('contextmenu')
  chart.getZr().on('contextmenu', (e) => {
    e.event.preventDefault()
    if (!chartState.dataStack.length) return

    const prev = chartState.dataStack.pop()
    chartState.currentView = prev.viewType
    chartState.currentYear = prev.currentYear
    chartState.currentPublisher = prev.currentPublisher
    chartState.currentGameName = prev.currentGameName

    updatePieData()
    renderBar(prev.data, prev.title)
  })
}

function getChartTitle() {
  const { currentView, currentYear, currentPublisher } = chartState
  if (currentView === 'year') return '年度游戏销量总览'
  if (currentView === 'publisher') return `${currentYear}年厂商销量排行`
  if (currentView === 'game') return `${currentYear}年 ${currentPublisher} 游戏销量`
  return ''
}

onMounted(async () => {
  await loadRawData()
  chartState.currentView = 'year'
  const data = processData('year')
  updatePieData()
  renderBar(data, getChartTitle())

  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => {
  chart?.dispose()
})
</script>
