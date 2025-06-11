<template>
    <div class="dashboard">
      <!-- 左侧：钻取柱状图 + 热力图 -->
      <div class="left-panel">
        <div class="chart-box drill-chart">
          <BarChart />
        </div>
        <div class="chart-box heatmap-chart">
            <WorldMap />
        </div>
      </div>
  
      <!-- 右侧：上三图 + 下地图 -->
      <div class="right-panel">
        <div class="pie-row">
          <div class="chart-box pie-wrapper">
            <PieChart />
          </div>
          <div class="chart-box pie-wrapper">
            <GameCommentImage />
          </div>
          <div class="chart-box pie-wrapper">
            <GameWordcloudImage />
          </div>
        </div>
  
        <div class="chart-box map-chart">
          
          <YearlySalesChartMini />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
    import BarChart from './BarChart.vue'
    import YearlySalesChart from './YearlySalesChart.vue'
    import PieChart from './PieChart.vue'
    import WorldMap from './WorldMap.vue'
    import GameCommentImage from './GameCommentImage.vue'
    import GameWordcloudImage from './GameWordcloudImage.vue'
    import YearlySalesChartMini from './YearlySalesChartMini.vue'
</script>

  
  <style scoped>
  :root {
  --gap: 1.5rem;
  --max-width: 1600px;
}

body, html {
  margin: 0;
  padding: 0;
  height: 100%;
}

.dashboard {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100%;
  padding: var(--gap);
  box-sizing: border-box;
  background: #f5f6fa;
  justify-content: center;
}

.dashboard > .content {
  display: flex;
  flex-direction: row;
  gap: var(--gap);
  width: 100%;
  max-width: var(--max-width);
  height: 100%;
}

.left-panel {
  flex: 1.3;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.right-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.chart-box {
  background: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pie-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: var(--gap);
  flex: 1;
}

.pie-wrapper {
  flex: 1;
  aspect-ratio: 1 / 1;
  min-width: 0;
  min-height: 0;
  position: relative;
}

.map-chart {
  flex: 1.3;
  min-height: 0;
}

.drill-chart {
  flex: 3;
  min-height: 0;
}

.heatmap-chart {
  flex: 2;
  min-height: 0;
}

  
  
  
  
  
  </style>
  