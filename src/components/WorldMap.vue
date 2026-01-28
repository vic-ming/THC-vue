<template>
  <div class="interactive-map-container" ref="mapContainer">
    <object 
      ref="svgObject"
      :data="mapSrc" 
      type="image/svg+xml"
      class="interactive-map"
      @load="onMapLoad"
    ></object>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineProps, defineEmits } from 'vue'

const props = defineProps({
  mapSrc: {
    type: String,
    required: true
  },
  selectedRegion: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['region-click'])

const svgObject = ref(null)
const mapContainer = ref(null)
const svgDoc = ref(null)

// 區域標記的配置（根據 SVG 中的 rect 位置）
const regionMarkers = {
  'taiwan': { selector: 'g[filter="url(#filter8_d_1497_16647)"]', x: 616, y: 396 },
  'china': { selector: 'g[filter="url(#filter9_d_1497_16647)"]', x: 385, y: 312 },
  'mozambique': { selector: 'g[filter="url(#filter10_d_1497_16647)"]', x: 264, y: 573 },
  'malaysia': { selector: 'g[filter="url(#filter11_d_1497_16647)"]', x: 376, y: 505 },
  'myanmar': { selector: 'g[filter="url(#filter12_d_1497_16647)"]', x: 383, y: 371 },
  'indonesia': { selector: 'g[filter="url(#filter13_d_1497_16647)"]', x: 567, y: 524 },
  'vietnam': { selector: 'g[filter="url(#filter14_d_1497_16647)"]', x: 562, y: 439 },
  'cambodia': { selector: 'g[filter="url(#filter15_d_1497_16647)"]', x: 399, y: 460 },
  'thailand': { selector: 'g[filter="url(#filter16_d_1497_16647)"]', x: 402, y: 416 }
}

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
        // 添加點擊事件
        element.style.cursor = 'pointer'
        element.addEventListener('click', () => handleRegionClick(region))
        
        // 添加懸停效果
        element.addEventListener('mouseenter', () => {
          const rect = element.querySelector('rect')
          if (rect) {
            rect.style.fill = '#FFC936'
            rect.style.transition = 'all 0.3s ease'
          }
        })
        
        element.addEventListener('mouseleave', () => {
          if (props.selectedRegion !== region) {
            const rect = element.querySelector('rect')
            if (rect) {
              rect.style.fill = '#004EA2'
            }
          }
        })
        
        // 設置初始選中狀態
        updateRegionStyle(region)
      } else {
        console.warn(`Region marker not found: ${region}`)
      }
    })
    
    console.log('Map initialized with clickable regions')
  } catch (error) {
    console.error('Error initializing map:', error)
  }
}

const handleRegionClick = (region) => {
  console.log('Region clicked:', region)
  emit('region-click', region)
}

const updateRegionStyle = (region) => {
  if (!svgDoc.value) return
  
  Object.entries(regionMarkers).forEach(([r, config]) => {
    const element = svgDoc.value.querySelector(config.selector)
    if (element) {
      const rect = element.querySelector('rect')
      if (rect) {
        if (r === region && props.selectedRegion === region) {
          rect.style.fill = '#FFC936'
          rect.style.stroke = '#FFD700'
          rect.style.strokeWidth = '2'
        } else {
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
    updateRegionStyle(newRegion)
  }
})

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
}
</style>
