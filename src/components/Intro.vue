<template>
  <div class="intro-page" ref="introRef">
    <!-- 装饰元素 -->
    <div class="decoration gamepad-1">🎮</div>
    <div class="decoration gamepad-2">🕹️</div>
    
    <!-- 主要内容 -->
    <div class="content">
      <h1 class="title">🎮 GameData <span>游戏销量可视化</span></h1>
      <p class="tip">↓ 向下滑动或点击按钮进入 ↓</p>
      <button @click="scrollToChart" class="scroll-btn">
        探索数据
        <svg class="arrow-icon" viewBox="0 0 24 24">
          <path d="M12 17.414l-5.707-5.707 1.414-1.414L12 14.586l4.293-4.293 1.414 1.414L12 17.414z"/>
        </svg>
      </button>
    </div>
    
    <!-- 底部波纹效果 -->
    <div class="wave"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

const introRef = ref(null)
let scrolled = ref(false)

const scrollToChart = () => {
  if (scrolled.value) return
  scrolled.value = true
  const chartSection = document.getElementById('chart')
  if (chartSection) {
    chartSection.scrollIntoView({ behavior: 'smooth' })
  }
}

// 修复：使用 IntersectionObserver 检测是否返回顶部
let observer = null

onMounted(() => {
  // 添加滚轮/触摸事件
  window.addEventListener('wheel', handleScrollTrigger, { passive: true })
  window.addEventListener('touchstart', handleScrollTrigger, { passive: true })
  
  // 创建 IntersectionObserver 检测是否返回顶部
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.9) {
        scrolled.value = false
      }
    })
  }, { threshold: 0.9 })
  
  if (introRef.value) {
    observer.observe(introRef.value)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', handleScrollTrigger)
  window.removeEventListener('touchstart', handleScrollTrigger)
  if (observer && introRef.value) {
    observer.unobserve(introRef.value)
  }
})

// 优化滚动触发逻辑
const handleScrollTrigger = (e) => {
  // 检查是否已经滚动过
  if (scrolled.value) return
  
  // 检查滚动方向（只允许向下滚动触发）
  const deltaY = e.deltaY || e.touches?.[0]?.clientY || 0
  if (deltaY > 10) {
    scrollToChart()
  }
}
</script>

<style scoped>
.intro-page {
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #1a2a6c, #2c3e50, #3498db);
  background-size: 400% 400%;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: relative;
  animation: gradientBG 15s ease infinite;
}

.content {
  z-index: 2;
  text-align: center;
  padding: 20px;
}

.title {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  animation: fadeInDown 1s ease;
}

.title span {
  display: block;
  font-size: 2rem;
  margin-top: 0.5rem;
  color: #f1c40f;
}

.tip {
  margin-top: 1.5rem;
  font-size: 1.3rem;
  opacity: 0.9;
  animation: fadeIn 2s ease;
}

.scroll-btn {
  margin-top: 3rem;
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: white;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.4s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  animation: float 3s ease-in-out infinite;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.scroll-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.arrow-icon {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

/* 装饰元素 */
.decoration {
  position: absolute;
  font-size: 5rem;
  opacity: 0.15;
  z-index: 1;
}

.gamepad-1 {
  top: 20%;
  left: 15%;
  animation: float 6s ease-in-out infinite;
}

.gamepad-2 {
  bottom: 25%;
  right: 15%;
  animation: float 8s ease-in-out infinite 1s;
}

/* 波浪效果 */
.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 1200 120" xmlns="http://www.w3.org/2000/svg" fill="rgba(255,255,255,0.1)"><path d="M0 0v46.29c47.79 22.2 103.59 32.17 158 28 70.36-5.37 136.33-33.31 206.8-37.5 73.84-4.36 147.54 16.88 218.2 35.26 69.27 18 138.3 24.88 209.4 13.08 36.15-6 69.85-17.84 104.45-29.34C989.49 25 1113-14.29 1200 52.47V0z"/></svg>');
  background-size: 1200px 100px;
  animation: wave 12s linear infinite;
}

/* 动画定义 */
@keyframes gradientBG {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes wave {
  0% { background-position-x: 0; }
  100% { background-position-x: 1200px; }
}
</style>
