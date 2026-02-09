<template>
  <div class="interactive-map-container" ref="mapContainer">
    <object 
      ref="svgObject"
      :data="mapSrc" 
      type="image/svg+xml"
      class="interactive-map"
      :data-ready="isMapReady"
      @load="onMapLoad"
    ></object>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  mapSrc: {
    type: String,
    required: true
  },
  selectedRegion: {
    type: String,
    default: ''
  },
  regionData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['region-click'])

const svgObject = ref(null)
const mapContainer = ref(null)
const isHoverDisabled = ref(false)
const svgDoc = ref(null)
const isMapReady = ref(false)

// 增加 textX, textY 用於顯示數字
// expandDirection: 'left' (cursor on right, expand left), 'right' (cursor on left, expand right)
const regionMarkers = {
  'taiwan': { selector: 'g[filter="url(#filter8_d_1497_16647)"]', x: 616, y: 396, textX: 661, textY: 423, expandDirection: 'right' },
  'china': { selector: 'g[filter="url(#filter9_d_1497_16647)"]', x: 385, y: 312, textX: 430, textY: 339, expandDirection: 'left' },
  'mozambique': { selector: 'g[filter="url(#filter10_d_1497_16647)"]', x: 264, y: 573, textX: 309, textY: 600, expandDirection: 'right' },
  'malaysia': { selector: 'g[filter="url(#filter11_d_1497_16647)"]', x: 376, y: 505, textX: 421, textY: 532, expandDirection: 'left' },
  'myanmar': { selector: 'g[filter="url(#filter12_d_1497_16647)"]', x: 383, y: 371, textX: 428, textY: 398, expandDirection: 'left' },
  'indonesia': { selector: 'g[filter="url(#filter13_d_1497_16647)"]', x: 567, y: 524, textX: 612, textY: 551, expandDirection: 'right' },
  'vietnam': { selector: 'g[filter="url(#filter14_d_1497_16647)"]', x: 562, y: 439, textX: 607, textY: 466, expandDirection: 'right' },
  'cambodia': { selector: 'g[filter="url(#filter15_d_1497_16647)"]', x: 399, y: 460, textX: 444, textY: 487, expandDirection: 'left' },
  'thailand': { selector: 'g[filter="url(#filter16_d_1497_16647)"]', x: 402, y: 416, textX: 447, textY: 443, expandDirection: 'left' }
}

const rectCache = ref({}) // Cache original rect dimensions { id: { x, width } }

const onMapLoad = () => {
  console.log('Map loaded')
  // 等待 SVG 完全加載
  setTimeout(() => {
    initializeMap()
  }, 100)
}

const initializeMap = () => {
  if (!svgObject.value) return
  
  try {
    // 獲取 SVG 文檔
    svgDoc.value = svgObject.value.contentDocument || svgObject.value.getSVGDocument()
    
    if (!svgDoc.value) {
      console.error('Cannot access SVG document')
      return
    }

    // 為每個區域標記添加點擊事件和樣式
    Object.entries(regionMarkers).forEach(([region, config]) => {
      const element = svgDoc.value.querySelector(config.selector)
      
      if (element) {
        // 擴大濾鏡範圍以防止按鈕延伸時被裁切
        const filterUrl = element.getAttribute('filter')
        if (filterUrl) {
          const filterId = filterUrl.replace('url(#', '').replace(')', '')
          const filterEl = svgDoc.value.getElementById(filterId)
          if (filterEl) {
            // 設定足夠大的範圍，避免內容被裁切
            filterEl.setAttribute('x', '-50%')
            filterEl.setAttribute('y', '-50%')
            filterEl.setAttribute('width', '200%')
            filterEl.setAttribute('height', '200%')
          }
        }

        // 綁定事件到具體的 rect 元素，避免因濾鏡範圍擴大導致點擊區域過大
        const rect = element.querySelector('rect')
        if (rect) {
          // 添加點擊事件
          rect.style.cursor = 'pointer'
          // 確保 rect 可以接收事件 (雖然預設就是 visiblePainted)
          rect.style.pointerEvents = 'all'

          rect.addEventListener('click', (e) => {
            e.stopPropagation() // 防止冒泡
            handleRegionClick(region)
          })
          
          // 添加懸停效果
          rect.addEventListener('mouseenter', (e) => {
            if (isHoverDisabled.value) return
            rect.style.fill = '#FFC936'
            rect.style.transition = 'all 0.3s ease'
          })
          
          rect.addEventListener('mouseleave', () => {
            if (props.selectedRegion !== region) {
              rect.style.fill = '#004EA2'
            }
          })
        }
        
        // 設置初始選中狀態
        updateRegionStyle(region)
      } else {
        console.warn(`Region marker not found: ${region}`)
      }
    })
    
    // 初始化數字顯示
    renderRegionCounts()
    
    console.log('Map initialized with clickable regions')
    
    // 初始化完成後顯示地圖
    isMapReady.value = true
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

// ... (previous code)

const renderRegionCounts = () => {
  if (!svgDoc.value || !props.regionData.length) return

  Object.entries(regionMarkers).forEach(([regionKey, config]) => {
    const regionInfo = props.regionData.find(r => r.value === regionKey)
    if (!regionInfo) return
    const count = regionInfo.amount
    
    const group = svgDoc.value.querySelector(config.selector)
    if (!group) return

    // 1. 隱藏所有原始路徑 (包含文字、箭頭、數字)
    const paths = group.querySelectorAll('path')
    paths.forEach(path => {
      path.style.display = 'none'
    })
    
    // 2. 找到背景 Rect
    const rect = group.querySelector('rect')
    
    if (rect) {
      // 緩存原始尺寸以作為變更的基準
      if (!rectCache.value[regionKey]) {
        const origX = parseFloat(rect.getAttribute('x'))
        const origW = parseFloat(rect.getAttribute('width'))
        if (!isNaN(origX) && !isNaN(origW)) {
          rectCache.value[regionKey] = { x: origX, width: origW }
        } else {
             // Fallback to config if DOM attrs are missing/invalid
             rectCache.value[regionKey] = { x: config.x, width: 90 } // Assuming default width 90
        }
      }
    }
    
    const { x: baseX, width: baseWidth } = rectCache.value[regionKey] || { x: config.x, width: 90 }
    
    // 3. 創建或更新文本元素
    let textId = `count-text-${regionKey}`
    let textEl = svgDoc.value.getElementById(textId)

    if (!textEl) {
      textEl = document.createElementNS("http://www.w3.org/2000/svg", "text")
      textEl.setAttribute("id", textId)
      textEl.setAttribute("fill", "#FEFBF9") 
      textEl.setAttribute("dominant-baseline", "middle")
      textEl.setAttribute("text-anchor", "middle")
      textEl.setAttribute("font-size", "16") 
      textEl.setAttribute("font-weight", "bold")
      textEl.setAttribute("pointer-events", "none")
      textEl.style.userSelect = "none"
      
      group.appendChild(textEl)
    }
    
    // 設置文字內容以便計算寬度
    textEl.textContent = `${regionInfo.name} (${count})`
    
    // 使用 requestAnimationFrame 確保在計算寬度前 DOM 已更新
    requestAnimationFrame(() => {
        let requiredWidth = baseWidth
        try {
          const bbox = textEl.getComputedTextLength()
          const padding = 40 // 增加 padding 避免太擠
          if (bbox + padding > baseWidth) {
            requiredWidth = bbox + padding
          }
        } catch (e) {
          console.warn('Cannot measure text length', e)
          // Fallback based on char count
          const estimatedWidth = textEl.textContent.length * 10 + 40
          if (estimatedWidth > baseWidth) requiredWidth = estimatedWidth
        }

        // 根據擴展方向調整 rect 的 x 坐標
        let newX = baseX
        if (config.expandDirection === 'left') {
          // 向左擴展：右邊界固定 (baseX + baseWidth)
          // newX = (baseX + baseWidth) - requiredWidth
          newX = (baseX + baseWidth) - requiredWidth
        } else {
          // 向右擴展：左邊界固定 (baseX)
          // newX = baseX
          newX = baseX
        }
        
        if (rect) {
          rect.setAttribute('width', requiredWidth)
          rect.setAttribute('x', newX)
          if (regionKey === 'taiwan') {
          }
        }
        
        // 更新文字位置 (居中於新的 rect)
        const centerX = newX + requiredWidth / 2
        
        // 如果 rect 存在，嘗試從 rect 獲取高度以計算 centerY
        let finalCenterY = config.y + 20
        if (rect) {
            const h = parseFloat(rect.getAttribute('height'))
            const ry = parseFloat(rect.getAttribute('y'))
            if (!isNaN(h) && !isNaN(ry)) {
                finalCenterY = ry + h / 2
            }
        }

        textEl.setAttribute("x", centerX)
        textEl.setAttribute("y", finalCenterY)
    })
  })
}

// ... (rest of the code)

const handleRegionClick = (region) => {
  console.log('Region clicked:', region)
  emit('region-click', region)
}

const updateRegionStyle = (region) => {
  if (!svgDoc.value) return
  
  console.log('DEBUG: updateRegionStyle called. props.selectedRegion:', props.selectedRegion)

  Object.entries(regionMarkers).forEach(([r, config]) => {
    const element = svgDoc.value.querySelector(config.selector)
    if (element) {
      const rect = element.querySelector('rect')
      if (rect) {
        if (r === props.selectedRegion) {
          console.log(`DEBUG: Matching region ${r} - applying highlight`)
          rect.style.fill = '#FFC936'
          rect.style.stroke = '#FFD700'
          rect.style.strokeWidth = '2'
        } else {
          // console.log(`DEBUG: Non-matching region ${r} - clearing highlight`)
          rect.style.fill = '#004EA2'
          rect.style.stroke = 'none'
        }
      }
    }
  })
}

// 監聽選中區域的變化
watch(() => props.selectedRegion, (newRegion) => {
  if (svgDoc.value) {
    // 模式切換或區域選擇時，禁用懸停以防誤觸
    isHoverDisabled.value = true
    setTimeout(() => {
      isHoverDisabled.value = false
    }, 1200)
    
    console.log(`DEBUG: selectedRegion changed to ${newRegion}, triggering style update`)
    updateRegionStyle(newRegion)
  }
})

// 監聽區域數據變化，更新數字
watch(() => props.regionData, () => {
  if (svgDoc.value) {
    // 數據變更時（如模式切換），暫時禁用懸停效果，避免按鈕消失後誤觸下方地圖元素
    // 增加延遲時間以覆蓋過場動畫 (按鈕淡出約需 0.5s)
    isHoverDisabled.value = true
    setTimeout(() => {
      isHoverDisabled.value = false
    }, 1200)

    renderRegionCounts()
    // 確保在 DOM 更新後強制應用樣式，避免被重置或覆蓋
    setTimeout(() => {
      updateRegionStyle()
    }, 50)
  }
}, { deep: true })

onMounted(() => {
  // 如果 SVG 已經加載，初始化地圖
  if (svgObject.value) {
    const checkLoad = setInterval(() => {
      if (svgObject.value.contentDocument || svgObject.value.getSVGDocument()) {
        clearInterval(checkLoad)
        initializeMap()
      }
    }, 100)
    
    // 10秒後停止檢查
    setTimeout(() => clearInterval(checkLoad), 10000)
  }
})

onBeforeUnmount(() => {
  isHoverDisabled.value = true
})
</script>

<style scoped>
.interactive-map-container {
  /* width: 100%;
  height: 100%; */
  position: relative;
}

.interactive-map {
  width: 100%;
  height: 100%;
  pointer-events: all;
  opacity: 0;
  transition: opacity 0.5s ease;
}

.interactive-map[data-ready="true"] {
  opacity: 1;
}
</style>
