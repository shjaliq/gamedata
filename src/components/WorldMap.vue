<template>
  <div ref="mapContainer" style="width: 100%; height: 100%;" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import * as d3 from 'd3'

const mapContainer = ref(null)

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

onMounted(async () => {
  const chart = echarts.init(mapContainer.value)

  const [mapJson, csvText] = await Promise.all([
    fetch(import.meta.env.BASE_URL + '/world.json').then(res => res.json()),
    fetch(import.meta.env.BASE_URL + '/Video_Games.csv').then(res => res.text())
  ])

  const parsed = d3.csvParse(csvText)
  const regionSales = processRegionData(parsed)
  const seriesData = generateMapSeries(mapJson, regionSales)
  const maxSales = Math.max(...seriesData.map(d => d.value))

  echarts.registerMap("world", mapJson)

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
      max: maxSales,
      calculable: true,
      inRange: {
        color: ["#ffcccc", "#ff9999", "#ff6666", "#ff3333", "#cc0000"]
      }
    },
    series: [{
      type: "map",
      map: "world",
      roam: true,
      data: seriesData,
      emphasis: {
        label: { show: false },
        itemStyle: {
          areaColor: "#ff6666"
          // 去掉描边：不写 borderColor 就行，或者设为 transparent/null
        }
      },
      itemStyle: {
        borderColor: "transparent"  // ← 原来是黑边，改成透明
      },
      select: {
        label: { show: false }
      }
    }]
  })
  chart.resize() 
})
</script>

<style scoped>
</style>
