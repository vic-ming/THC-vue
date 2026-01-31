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
  },
  selectedProducts: {
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
    'filter10': 7, // 可口可樂桃園廠 (In-house廠)
    'filter11': 6, // 統一瑞芳廠(In-house廠)
    'filter12': 1, // 集團總部 (總公司 / 台中一廠)
    'filter13': 3, // 台中無菌飲料一廠
    'filter14': 4, // 台中無菌飲料二廠
    'filter15': 2, // 台中二廠
    'filter16': 5, // 台中無菌飲料三廠
    'filter17': 8, // 光泉嘉義廠 (In-house廠)
    'filter18': 9, // 味丹沙鹿廠 (In-house廠)
    'filter19': 10, // 台中自貿廠園區
  },
  'china': {
    'filter14': 23, // 浙江衢州東鵬廠 (In-house廠)
    'filter15': 24, // 浙江常山廠 (In-house廠)
    'filter16': 19, // 安徽滁州宏全廠
    'filter17': 18, // 河南漯河廠
    'filter18': 20, // 安徽滁州東鵬廠 (In-house廠)
    'filter19': 11, // 蘇州宏全 (大陸總部)
    'filter20': 12, // 蘇州宏星廠
    'filter21': 13, // 湖南長沙廠
    'filter22': 14, // 山西太原廠
    'filter23': 15, // 山東濟南廠
    'filter24': 16, // 廣東清新無菌飲料廠
    'filter25': 17, // 福建漳州無菌飲料廠
    'filter26': 22, // 廣東佛山廠 (In-house廠)
    'filter27': 21, // 湖北仙桃無菌飲料廠 (In-house廠)
  },
  'indonesia': {
    'filter0': 27, // 印尼泗水無菌飲料廠
    'filter1': 31, // 印尼Pandeglang廠(In-house廠)
    'filter2': 30, // 印尼美娜多廠
    'filter3': 28, // 印尼Cibitung無菌飲料廠(In-house廠)
    'filter4': 25, // 印尼KIIC無菌飲料廠
    'filter5': 26, // 印尼總廠
    'filter6': 29, // 印尼Futami廠(In-house廠)
  },
  'vietnam': {
    'filter5': 32, // 越南總廠
    'filter6': 33, // 越南VSIP 2A 廠
    'filter7': 34, // 越南Masan北部廠
    'filter8': 35, // 越南Masan南部廠(In-house廠)
    'filter9': 36, // 越南Masan西部廠(In-house廠)
  },
  'thailand': {
    'filter4': 37, // 泰國總廠
    'filter6': 39, // 泰國宏信無菌飲料廠
    'filter7': 41, // 泰國 Foodstar 廠
    'filter8': 38, // 泰國宏福廠
    'filter9': 40, // 泰國佛統廠(In-house廠)
  },
  'malaysia': {
    'filter0': 43, // 馬來西亞Cocoaland廠(In-house廠)
    'filter1': 42, // 馬來西亞總廠
  },
  'myanmar': {
    'filter0': 44, // 緬甸總廠
    'filter5': 45, // 緬甸宏佳廠
    'filter6': 46, // 緬甸
    'filter7': 47, // 緬甸聯通廠
  },
  'cambodia': {
    'filter0': 48, // 柬埔寨宏全廠
  },
  'mozambique': {
    'filter2': 49, // 莫三比克宏正廠
    'filter3': 50, // 莫三比克Shimada廠
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
        // 檢查是否應該顯示這個按鈕（根據產品篩選）
        let shouldShow = true
        
        if (props.selectedProducts.length > 0) {
          // 如果有篩選條件，檢查工廠是否提供這些產品服務
          const factoryServices = factory.product_services?.map(s => s.name.zh) || []
          shouldShow = props.selectedProducts.some(product => 
            factoryServices.includes(product)
          )
        }
        
        // 根據 shouldShow 來設置顯示/隱藏（帶淡入淡出效果）
        if (shouldShow) {
          // 淡入效果
          element.style.display = 'block'
          element.style.transition = 'opacity 0.4s ease-in-out'
          element.style.opacity = '0'
          
          // 使用 requestAnimationFrame 確保過渡效果生效
          requestAnimationFrame(() => {
            element.style.opacity = '1'
          })
          
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
        } else {
          // 淡出效果
          element.style.transition = 'opacity 0.4s ease-in-out'
          element.style.opacity = '0'
          
          // 等待淡出動畫完成後再隱藏
          setTimeout(() => {
            element.style.display = 'none'
          }, 400) // 與 transition 時間一致
        }
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

// 當產品篩選變化時重新初始化（即時更新）
watch(() => props.selectedProducts, () => {
  if (svgDoc.value) {
    console.log('Product filter changed, re-initializing map with filters:', props.selectedProducts)
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
