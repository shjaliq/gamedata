//WorldMap.vue
<template>
  <div ref="mapContainer" style="width: 100%; height: 100%;" />
</template>

<script setup>
import { ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import { chartState } from '@/utils/chartState' // 确保路径正确

const mapContainer = ref(null)
let chart = null

// 判断欧洲国家的函数保持不变
function isEuropeanCountry(country) {
  const europeanCountries = new Set([
    "Albania", "Andorra", "Austria", "Belarus", "Belgium", "Bosnia and Herzegovina",
    "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia",
    "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland",
    "Italy", "Kosovo", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg",
    "Malta", "Moldova", "Monaco", "Montenegro", "Netherlands", "North Macedonia",
    "Norway", "Poland", "Portugal", "Romania", "Russia", "San Marino", "Serbia",
    "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine",
    "United Kingdom", "Vatican City", "Turkey"
  ])
  return europeanCountries.has(country)
}

// 处理区域销售数据的函数
function processRegionData(data) {
  const sales = {
    "North America": { sales: 0, color: "#ff9999" },
    "Japan": { sales: 0, color: "#99ccff" },
    "Europe": { sales: 0, color: "#99ff99" },
    "Others": { sales: 0, color: "#dddddd" }
  }

  for (const row of data) {
    sales["North America"].sales += parseFloat(row.na_sales || 0)
    sales["Japan"].sales += parseFloat(row.jp_sales || 0)
    sales["Europe"].sales += parseFloat(row.pal_sales || 0)
    sales["Others"].sales += parseFloat(row.other_sales || 0)
  }

  return sales
}

// 生成地图系列数据
function generateMapSeries(geoJSON, regionSales) {
  return geoJSON.features.map((feature) => {
    const country = feature.properties?.name || "Unknown"
    let regionKey

    if (country === "Japan") {
      regionKey = "Japan"
    } else if (["United States", "Canada", "Mexico"].includes(country)) {
      regionKey = "North America"
    } else if (isEuropeanCountry(country)) {
      regionKey = "Europe"
    } else {
      regionKey = "Others"
    }

    const value = regionSales[regionKey]?.sales * 100 || 0

    return {
      name: country,
      value,
      region: regionKey,
      itemStyle: {
        areaColor: regionSales[regionKey]?.color || "#cccccc"
      }
    }
  })
}

// 更新地图数据
async function updateMap() {
  if (!chart || !window.worldGeoJSON) return
  
  // 根据当前视图过滤数据
  let filteredData = chartState.rawData
  
  if (chartState.currentView === 'publisher') {
    filteredData = filteredData.filter(d => d.year === chartState.currentYear)
  } else if (chartState.currentView === 'game') {
    filteredData = filteredData.filter(d => 
      d.year === chartState.currentYear && 
      d.publisher === chartState.currentPublisher
    )
  }

  const regionSales = processRegionData(filteredData)
  const seriesData = generateMapSeries(window.worldGeoJSON, regionSales)
  const maxSales = Math.max(...seriesData.map(d => d.value), 1) // 防止为0

  chart.setOption({
    title: {
      text: `全球游戏销售区域分布（单位：百万美元）${getTitleSuffix()}`
    },
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        if (!params.data) return ''
        return `${params.name}: ${params.data.value.toFixed(2)}M`
      }
    },
    visualMap: {
      min: 0,
      max: maxSales,
    },
    series: [{
      data: seriesData
    }]
  })
}

// 获取标题后缀
function getTitleSuffix() {
  if (chartState.currentView === 'publisher') {
    return ` - ${chartState.currentYear}年`
  } else if (chartState.currentView === 'game') {
    return ` - ${chartState.currentPublisher} (${chartState.currentYear})`
  }
  return ''
}

// 初始化地图
async function initMap() {
  if (!mapContainer.value) return
  
  // 加载地图数据（只加载一次）
  if (!window.worldGeoJSON) {
    window.worldGeoJSON = await fetch(import.meta.env.BASE_URL + '/world.json').then(res => res.json())
    echarts.registerMap("world", window.worldGeoJSON)
  }
  
  // 初始化图表
  chart = echarts.init(mapContainer.value)
  chart.setOption({
    title: {
      text: "全球游戏销售区域分布（单位：百万美元）",
      left: "center"
    },
    tooltip: {
      trigger: "item",
      formatter: function (params) {
        if (!params.data) return ''
        return `${params.name}: ${params.data.value.toFixed(2)}M`
      }
    },
    visualMap: {
      type: "continuous",
      min: 0,
      max: 100,
      calculable: true,
      inRange: {
        color: ["#ffcccc", "#ff9999", "#ff6666", "#ff3333", "#cc0000"]
      }
    },
    series: [{
      type: "map",
      map: "world",
      roam: true,
      emphasis: {
        label: { show: false },
        itemStyle: {
          areaColor: "#ff6666"
        }
      },
      itemStyle: {
        borderColor: "transparent"
      },
      select: {
        label: { show: false }
      }
    }]
  })
  
  // 初始更新
  updateMap()
}

// 监听相关状态变化
watch(
  () => [
    chartState.rawData, 
    chartState.currentView,
    chartState.currentYear,
    chartState.currentPublisher
  ],
  () => {
    if (chart) {
      nextTick(updateMap)
    }
  },
  { deep: true }
)

onMounted(() => {
  initMap()
  window.addEventListener('resize', () => chart?.resize())
})

onBeforeUnmount(() => {
  chart?.dispose()
  window.removeEventListener('resize', () => chart?.resize())
})
</script>

<style scoped>
</style>
