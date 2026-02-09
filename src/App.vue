<script setup>
import { onMounted } from 'vue'
import { useAppData } from './composables/useAppData.js'

const { loadAppData } = useAppData()

onMounted(async () => {
  // 在應用啟動時加載數據
  try {
    await loadAppData()
  } catch (error) {
    console.error('Failed to load app data on mount:', error)
  }


  // 禁止右鍵選單
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault()
  })

  // 禁止拖曳
  document.addEventListener('dragstart', (e) => {
    e.preventDefault()
  })

  // 禁止選取文字（防止長按選取）
  document.addEventListener('selectstart', (e) => {
    e.preventDefault()
  })

  // 禁止雙擊縮放（移動端）
  let lastTouchEnd = 0
  document.addEventListener('touchend', (e) => {
    const now = Date.now()
    if (now - lastTouchEnd <= 300) {
      e.preventDefault()
    }
    lastTouchEnd = now
  }, false)

  // 禁止多點觸控縮放手勢
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }, { passive: false })

  document.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }, { passive: false })

  // 禁止滾輪縮放（Ctrl + 滾輪）
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      e.preventDefault()
    }
  }, { passive: false })

  // 禁止鍵盤縮放（Ctrl + +/-/0）
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0' || e.key === '=')) {
      e.preventDefault()
    }
  })

  // iOS Safari 禁止手勢縮放
  document.addEventListener('gesturestart', (e) => {
    e.preventDefault()
  })
})
</script>

<template>
  <router-view />
</template>

<style lang="scss">
  html,body, #app{
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    
    // 禁止文字選取
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    
    // 禁止拖曳
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    
    // 禁止觸控時的長按選單（iOS）
    -webkit-touch-callout: none;
    
    // 禁止縮放
    touch-action: pan-x pan-y;
  }
  
  // 禁止圖片拖曳
  img {
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
    pointer-events: none;
  }
  
  // 允許地圖圖片的點擊事件
  .map-img {
    pointer-events: auto;
  }
  
  // 允許按鈕和連結的點擊事件
  button, a {
    pointer-events: auto;
  }
</style>