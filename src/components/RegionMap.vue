<template>
  <div class="interactive-region-map-container" ref="mapContainer">
    <object 
      ref="svgObject"
      :data="mapSrc" 
      type="image/svg+xml"
      class="interactive-region-map"
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
  region: {
    type: String,
    required: true
  },
  factories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['factory-click'])

const svgObject = ref(null)
const mapContainer = ref(null)
const svgDoc = ref(null)

const onMapLoad = () => {
  console.log('Region map loaded:', props.region)
  setTimeout(() => {
    initializeMap()
  }, 100)
}

// 特定區域的工廠對應表 (SVG filter ID -> Factory ID)
// 這裡可以手動設定每個地區的 SVG 元素與工廠 ID 的開發對應關係
const REGION_MAPPINGS = {
  'taiwan': {
  
  },
  'china': {
    // 'filter0': ID,
  },
  'indonesia': {
    'filter0': 27,
    'filter1': 31,
    'filter2': 30,
    'filter3': 28,
    'filter4': 25,
    'filter5': 26,
    'filter6': 29,
  },
  'vietnam': {
    // 'filter0': ID,
  },
  'thailand': {
    // 'filter0': ID,
  },
  'malaysia': {
    // 'filter0': ID,
  },
  'myanmar': {
    // 'filter0': ID,
  },
  'cambodia': {
    // 'filter0': ID,
  },
  'mozambique': {
    // 'filter0': ID,
  }
}

const initializeMap = () => {
  if (!svgObject.value) {
    console.error('SVG object not found')
    return
  }
  
  try {
    svgDoc.value = svgObject.value.contentDocument || svgObject.value.getSVGDocument()
    
    if (!svgDoc.value) {
      console.error('Cannot access SVG document')
      return
    }

    console.log('SVG document loaded successfully')
    
    // 找到所有帶有 filter 屬性的 <g> 元素
    const allGroups = svgDoc.value.querySelectorAll('g[filter]')
    
    // 過濾出藍色矩形標記（filter 包含 '_d_' 但不包含 '_dd_'）
    const blueRectGroups = Array.from(allGroups).filter(group => {
      const filterAttr = group.getAttribute('filter')
      return filterAttr && filterAttr.includes('_d_') && !filterAttr.includes('_dd_')
    })

    // --- 調試日誌開始 ---
    console.group(`[Mapping Debug] Region: ${props.region}`)
    console.log('Available Filters in SVG:', blueRectGroups.map(g => {
        const attr = g.getAttribute('filter')
        return attr?.match(/filter(\d+)/)?.[0]
    }))
    console.log('Available Factories in Data:', props.factories.map(f => `ID: ${f.id} - ${f.name.zh}`))
    console.groupEnd()
    // --- 調試日誌結束 ---
    
    // 根據藍色矩形的 Y 坐標排序（作為備用策略的基礎）
    const sortedByY = [...blueRectGroups].sort((a, b) => {
      const rectA = a.querySelector('rect')
      const rectB = b.querySelector('rect')
      if (!rectA || !rectB) return 0
      const yA = parseFloat(rectA.getAttribute('y') || 0)
      const yB = parseFloat(rectB.getAttribute('y') || 0)
      return yA - yB
    })
    
    console.log(`Region: ${props.region}, Found ${blueRectGroups.length} markers`)
    
    // 獲取當前區域的特定映射配置
    const regionConfig = REGION_MAPPINGS[props.region] || {}
    
    // 為每個藍色矩形標記分配工廠
    blueRectGroups.forEach((element, originalIndex) => {
      const filterAttr = element.getAttribute('filter')
      const filterIdStr = filterAttr?.match(/filter(\d+)/)?.[0] // 獲取 url(#filter0_d...) 中的 filter0
      const filterId = filterAttr?.match(/filter(\d+)/)?.[1]    // 獲取編號
      
      let factory = null
      
      // 策略 策略 1: 檢查是否有明確的 Filter ID 映射到 Factory ID
      const explicitId = regionConfig[`filter${filterId}`]
      if (explicitId) {
        factory = props.factories.find(f => String(f.id) === String(explicitId))
      }
      
      // 策略 2: 如果沒有明確映射，則使用 Y 軸排序後的順序（默認方案）
      if (!factory) {
        const sortedIndex = sortedByY.indexOf(element)
        factory = props.factories[sortedIndex]
      }
      
      if (factory) {
        element.style.cursor = 'pointer'
        element.setAttribute('data-factory-id', factory.id)
        element.setAttribute('data-factory-name', factory.name.zh || factory.name.en)
        
        // 添加點擊事件
        element.addEventListener('click', (e) => {
          e.stopPropagation()
          console.log(`Click: filter${filterId}, Factory: ${factory.name.zh}, ID: ${factory.id}`)
          handleFactoryClick(factory, originalIndex)
        }, { replace: true }) // 防重複
        
        // 添加懸停效果與調試信息
        element.addEventListener('mouseenter', () => {
          const rect = element.querySelector('rect')
          if (rect) {
            rect.style.fill = '#FFC936'
            rect.style.transition = 'all 0.3s ease'
          }
          console.log(`Hover: filter${filterId} | Factory: ${factory.name.zh} (ID:${factory.id}) | Y: ${element.querySelector('rect')?.getAttribute('y')}`)
        })
        
        element.addEventListener('mouseleave', () => {
          const rect = element.querySelector('rect')
          if (rect) {
            rect.style.fill = '#004EA2'
          }
        })
      }
    })
    
    console.log(`Initialized ${blueRectGroups.length} markers for ${props.region}`)
  } catch (error) {
    console.error('Error initializing region map:', error)
  }
}

const handleFactoryClick = (factory, index) => {
  console.log('Factory clicked:', factory.name, 'Index:', index)
  emit('factory-click', { factory, index })
}

onMounted(() => {
  if (svgObject.value) {
    const checkLoad = setInterval(() => {
      if (svgObject.value.contentDocument || svgObject.value.getSVGDocument()) {
        clearInterval(checkLoad)
        initializeMap()
      }
    }, 100)
    
    setTimeout(() => clearInterval(checkLoad), 10000)
  }
})

// 當工廠數據變化時重新初始化
watch(() => props.factories, () => {
  if (svgDoc.value) {
    initializeMap()
  }
}, { deep: true })
</script>

<style scoped>
.interactive-region-map-container {
  position: relative;
}

.interactive-region-map {
  width: 100%;
  height: 100%;
  pointer-events: all;
}
</style>
