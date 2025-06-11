// chartState.js
import { reactive } from 'vue'
import * as d3 from 'd3'

export const chartState = reactive({
  dataStack: [],
  rawData: [],
  currentView: 'year',
  currentYear: null,
  currentPublisher: null,
  chartInstance: null,
  genreData: [],
  platformData: [],
})

export async function loadRawData(csvPath = import.meta.env.BASE_URL +'/Video_Games.csv') {
  const rawData = await d3.csv(csvPath, (d) => ({
    year: +d.year,
    total_sales: +d.total_sales || 0,
    publisher: (d.publisher || '未知厂商').trim(),
    name: d.name || '未知游戏',
    genre: d.genre || '未分类',
    platform: d.platform || '未知平台',
    na_sales: +d.na_sales || 0,
    jp_sales: +d.jp_sales || 0,
    pal_sales: +d.pal_sales || 0,
    other_sales: +d.other_sales || 0,
  }))

  chartState.rawData = rawData.filter((d) => !isNaN(d.year) && d.year >= 1980)
  updatePieData()
}

export function updatePieData() {
  const { genreData, platformData } = getDynamicPieData()
  chartState.genreData = genreData
  chartState.platformData = platformData
}

function getDynamicPieData() {
  let filtered = chartState.rawData

  if (chartState.currentView === 'publisher') {
    filtered = filtered.filter((d) => d.year === chartState.currentYear)
  } else if (chartState.currentView === 'game') {
    filtered = filtered.filter(
      (d) =>
        d.year === chartState.currentYear &&
        d.publisher === chartState.currentPublisher
    )
  }

  const genreData = Array.from(
    d3.rollup(filtered, (v) => v.length, (d) => d.genre.trim()),
    ([name, value]) => ({ name, value })
  ).sort((a, b) => b.value - a.value)

  const platformData = Array.from(
    d3.rollup(filtered, (v) => d3.sum(v, (d) => d.total_sales), (d) => d.platform.trim()),
    ([name, value]) => ({ name, value: +value.toFixed(2) })
  ).sort((a, b) => b.value - a.value)

  return { genreData, platformData }
}
