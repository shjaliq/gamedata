<template>
  <div class="app-container" ref="appContainer">
    <div class="page-section" ref="introSection">
      <Intro />
    </div>
    
    <div class="page-section" ref="dashboardSection">
      <div id="chart">
        <Dashboard />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Intro from './components/Intro.vue'
import Dashboard from './components/Dashboard.vue'

const appContainer = ref(null)
const introSection = ref(null)
const dashboardSection = ref(null)
let currentSection = ref(0)
let isScrolling = false

onMounted(() => {
  setupScrollObserver()
  setupScrollListeners()
  window.addEventListener('scroll-to-dashboard', () => {
    scrollToSection(1) // 滚动到dashboard部分
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleWheel, { passive: false })
  window.removeEventListener('touchstart', handleTouchStart, { passive: false })
  window.removeEventListener('touchmove', handleTouchMove, { passive: false })
})

function setupScrollObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target === introSection.value) {
          currentSection.value = 0
        } else if (entry.target === dashboardSection.value) {
          currentSection.value = 1
        }
      }
    })
  }, { threshold: 0.5 })
  
  observer.observe(introSection.value)
  observer.observe(dashboardSection.value)
}

function setupScrollListeners() {
  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('touchstart', handleTouchStart, { passive: false })
  window.addEventListener('touchmove', handleTouchMove, { passive: false })
}

let touchStartY = 0
function handleTouchStart(e) {
  touchStartY = e.touches[0].clientY
}

function handleTouchMove(e) {
  if (isScrolling) return
  
  const touchEndY = e.touches[0].clientY
  const deltaY = touchEndY - touchStartY
  
  // 向下滑动且当前在Intro部分
  if (deltaY < -50 && currentSection.value === 0) {
    scrollToSection(1)
  } 
  // 向上滑动且当前在Dashboard部分
  else if (deltaY > 50 && currentSection.value === 1) {
    scrollToSection(0)
  }
}

function handleWheel(e) {
  if (isScrolling) return
  
  // 向下滚动且当前在Intro部分
  if (e.deltaY > 50 && currentSection.value === 0) {
    scrollToSection(1)
    e.preventDefault()
  } 
  // 向上滚动且当前在Dashboard部分
  else if (e.deltaY < -50 && currentSection.value === 1) {
    scrollToSection(0)
    e.preventDefault()
  }
}

function scrollToSection(index) {
  isScrolling = true
  const section = index === 0 ? introSection.value : dashboardSection.value
  
  section.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  })
  
  setTimeout(() => {
    isScrolling = false
  }, 1000)
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  scroll-behavior: smooth;
}

.page-section {
  height: 100vh;
  width: 100vw;
  scroll-snap-align: start;
}

/* 平滑滚动容器 */
.app-container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
}
</style>
