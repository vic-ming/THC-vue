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

// 黃色圖標映射表 (SVG filter ID -> Yellow Icon Index)
// 用於隱藏/顯示對應的黃色工廠圖標
const ICON_MAPPINGS = {
  'taiwan': {},
  'china': {},
  'indonesia': {},
  'vietnam': {},
  'thailand': {},
  'malaysia': {},
  'myanmar': {},
  'cambodia': {},
  'mozambique': {}
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
    
    // 收集所有圖標組（包含光暈、黃色圖標、白色圓圈）
    // 這些圖標組使用 filter*_dd_* 標識（dd 表示 double drop shadow，用於光暈效果）
    const allIconGroups = svgDoc.value.querySelectorAll('g[filter]')
    const iconGroups = Array.from(allIconGroups).filter(group => {
      const filterAttr = group.getAttribute('filter')
      return filterAttr && filterAttr.includes('_dd_') // 光暈效果的圖標組
    })
    
    console.log(`Found ${iconGroups.length} icon groups (with glow effects) in ${props.region}`)
    
    // 收集所有箭頭線條（從按鈕指向圖標的藍色箭頭）
    // 這些箭頭是獨立的 path 元素，fill="#004EA2" (需要處理大小寫和 style 屬性)
    const allPaths = svgDoc.value.querySelectorAll('path')
    const arrowPaths = Array.from(allPaths).filter(path => {
      // 1. 檢查顏色是否為藍色 (處理 fill 屬性, style 屬性, 大小寫)
      const fillAttr = path.getAttribute('fill')
      const styleAttr = path.getAttribute('style') || ''
      
      let isBlue = false
      if (fillAttr && fillAttr.toUpperCase() === '#004EA2') isBlue = true
      if (styleAttr.toUpperCase().includes('FILL:#004EA2') || styleAttr.toUpperCase().includes('FILL: #004EA2')) isBlue = true
      
      if (!isBlue) return false
      
      // 2. 排除按鈕內的矩形（按鈕在 filter group 內）
      let parent = path.parentElement
      while (parent && parent !== svgDoc.value.documentElement) {
        if (parent.tagName === 'g' && parent.getAttribute('filter')) {
          return false // 在 filter group 內，不是箭頭
        }
        parent = parent.parentElement
      }
      return true // 不在 filter group 內，是箭頭
    })
    
    console.log(`Found ${arrowPaths.length} arrow paths in ${props.region}`)
    
    
    
    
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
    const iconConfig = ICON_MAPPINGS[props.region] || {}
    
    // 為每個藍色矩形標記分配工廠
    blueRectGroups.forEach((element, originalIndex) => {
      const filterAttr = element.getAttribute('filter')
      const filterIdStr = filterAttr?.match(/filter(\d+)/)?.[0] // 獲取 url(#filter0_d...) 中的 filter0
      const filterId = filterAttr?.match(/filter(\d+)/)?.[1]    // 獲取編號
      
      // 自動尋找與此按鈕接觸的箭頭
      let associatedArrow = null
      
      // 獲取按鈕的邊界框 (兼容 rect 和 path)
      let box = null
      const rectElement = element.querySelector('rect')
      
      if (rectElement) {
        const x = parseFloat(rectElement.getAttribute('x'))
        const y = parseFloat(rectElement.getAttribute('y'))
        const width = parseFloat(rectElement.getAttribute('width'))
        const height = parseFloat(rectElement.getAttribute('height'))
        const buffer = 20
        box = {
          left: x - buffer,
          right: x + width + buffer,
          top: y - buffer,
          bottom: y + height + buffer,
          centerX: x + width / 2,
          centerY: y + height / 2
        }
      } else {
        // 如果沒有 rect，嘗試使用 getBBox 或解析路徑
        try {
          if (typeof element.getBBox === 'function') {
             const bbox = element.getBBox()
             const buffer = 20
             box = {
               left: bbox.x - buffer,
               right: bbox.x + bbox.width + buffer,
               top: bbox.y - buffer,
               bottom: bbox.y + bbox.height + buffer,
               centerX: bbox.x + bbox.width / 2,
               centerY: bbox.y + bbox.height / 2
             }
          }
        } catch (e) {
          console.warn('getBBox failed', e)
        }
        
        // 如果 getBBox 失敗，嘗試解析所有 path 的坐標並計算聯合邊界
        if (!box) {
           const paths = element.querySelectorAll('path')
           if (paths.length > 0) {
             let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
             let found = false
             
             paths.forEach(path => {
               const d = path.getAttribute('d')
               // 解析所有數字對 [x, y, x, y...]
               const coords = d ? d.match(/[+-]?(\d*\.\d+|\d+)/g) : null
               if (coords) {
                 for (let i = 0; i < coords.length; i += 2) {
                   const x = parseFloat(coords[i])
                   const y = parseFloat(coords[i+1])
                   if (!isNaN(x) && !isNaN(y)) {
                     if (x < minX) minX = x
                     if (y < minY) minY = y
                     if (x > maxX) maxX = x
                     if (y > maxY) maxY = y
                     found = true
                   }
                 }
               }
             })
             
             if (found) {
               const buffer = 20
               box = {
                 left: minX - buffer,
                 right: maxX + buffer,
                 top: minY - buffer,
                 bottom: maxY + buffer,
                 centerX: (minX + maxX) / 2,
                 centerY: (minY + maxY) / 2
               }
               // console.log(`Calculated Union BBox for non-rect button:`, box)
             }
           }
        }
      }

      if (box) {
        // 檢查哪個箭頭的路徑點在邊界框內
        associatedArrow = arrowPaths.find(path => {
          const d = path.getAttribute('d')
          if (!d) return false
          
          const coords = d.match(/[+-]?(\d*\.\d+|\d+)/g) // 改進的正則，支持 .5 格式
          
          if (coords) {
             for (let i = 0; i < coords.length; i += 2) {
               const px = parseFloat(coords[i])
               const py = parseFloat(coords[i+1])
               
               if (!isNaN(px) && !isNaN(py)) {
                 if (px >= box.left && px <= box.right && py >= box.top && py <= box.bottom) {
                   return true // 發現接觸點
                 }
               }
             }
          }
          return false
        })
      }
      
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
        
        // 自動尋找關聯的圖標組 (通過箭頭)
        let iconGroup = null
        
        if (associatedArrow) {
          // 如果有箭頭，尋找離箭頭路徑最近的圖標組
          const d = associatedArrow.getAttribute('d')
          const coords = d ? d.match(/-?\d+(\.\d+)?/g) : []
          
          if (coords && coords.length > 0) {
            let minDistance = Infinity
            let closestGroup = null
            
            // 遍歷所有圖標組
            iconGroups.forEach(group => {
              // 找到圖標組內的黃色圖標作為中心點參考
              const yellowIcon = group.querySelector('path[fill="#FFC936"]')
              if (yellowIcon) {
                // 獲取黃色圖標路徑的第一個點作為近似位置 (因為沒有簡單的 getBBox 在這裡)
                // 假設路徑以 M x y 開頭
                const dIcon = yellowIcon.getAttribute('d')
                const iconCoords = dIcon ? dIcon.match(/-?\d+(\.\d+)?/g) : null
                
                if (iconCoords && iconCoords.length >= 2) {
                  const iconX = parseFloat(iconCoords[0])
                  const iconY = parseFloat(iconCoords[1])
                  
                  // 計算箭頭上所有點到此圖標的距離，取最小值
                  for (let i = 0; i < coords.length; i += 2) {
                    const arrowX = parseFloat(coords[i])
                    const arrowY = parseFloat(coords[i+1])
                    
                    if (!isNaN(arrowX) && !isNaN(arrowY)) {
                      const dist = Math.sqrt(Math.pow(arrowX - iconX, 2) + Math.pow(arrowY - iconY, 2))
                      if (dist < minDistance) {
                        minDistance = dist
                        closestGroup = group
                      }
                    }
                  }
                }
              }
            })
            
            // 如果最近距離在合理範圍內 (放寬至 100px)，則認為是關聯圖標
            if (minDistance < 100 && closestGroup) {
              iconGroup = closestGroup
              console.log(`Auto-linked arrow to icon for filter${filterId} (dist: ${minDistance.toFixed(1)})`)
            }
          }
        }
        
        // Fallback: 如果沒有箭頭，或者箭頭沒有成功關聯到圖標，嘗試直接尋找最近的圖標組
        if (!iconGroup && box) {
             const btnX = box.centerX
             const btnY = box.centerY
             
             let minDistance = Infinity
             let closestGroup = null
             
             iconGroups.forEach(group => {
                const yellowIcon = group.querySelector('path[fill="#FFC936"]')
                if (yellowIcon) {
                  const dIcon = yellowIcon.getAttribute('d')
                  const iconCoords = dIcon ? dIcon.match(/[+-]?(\d*\.\d+|\d+)/g) : null
                  if (iconCoords && iconCoords.length >= 2) {
                    const iconX = parseFloat(iconCoords[0])
                    const iconY = parseFloat(iconCoords[1])
                    const dist = Math.sqrt(Math.pow(btnX - iconX, 2) + Math.pow(btnY - iconY, 2))
                    
                    if (dist < minDistance) {
                      minDistance = dist
                      closestGroup = group
                    }
                  }
                }
             })
             
             // 距離閾值設為 300px (進一步放寬以適應某些工廠的布局)
             // 確保即使沒有箭頭，只要在合理範圍內都能關聯
             if (minDistance < 300 && closestGroup) {
               iconGroup = closestGroup
               console.log(`Auto-linked button directly to icon for filter${filterId} (dist: ${minDistance.toFixed(1)})`)
             }
        }

        
        // Fallback 2: 嘗試基於 Filter ID 匹配 (同名匹配)
        // 例如：按鈕是 filter2_d... -> 尋找 filter2_dd... 的圖標
        // 這能解決距離檢測失敗且沒有手動映射的情況 (如 China ID 20)
        if (!iconGroup) {
           const targetIconFilter = `filter${filterId}_dd`
           iconGroup = iconGroups.find(g => {
             const f = g.getAttribute('filter')
             return f && f.includes(targetIconFilter)
           })
           if (iconGroup) {
             console.log(`Auto-linked button to icon by Filter ID: filter${filterId}`)
           }
        }
        
        // Fallback 3: 針對特定已知問題的硬編碼修復
        // China ID 20 (與 filter2_dd 關聯，但自動檢測失敗)
        if (!iconGroup && props.region === 'china' && factory.id === 20) {
           iconGroup = iconGroups.find(g => {
             const f = g.getAttribute('filter')
             return f && f.includes('filter2_dd')
           })
           if (iconGroup) console.log('Hardcoded fix applied for China ID 20')
        }

        // 如果自動檢測失敗，嘗試使用手動映射 (最後的後備方案)
        if (!iconGroup) {
            const iconIndex = iconConfig[`filter${filterId}`]
            iconGroup = (iconIndex !== null && iconIndex !== undefined) ? iconGroups[iconIndex] : null
        }
        
        // --- FORCE OVERRIDE FOR CHINA ID 20 ---
        // 放在最後以覆蓋任何之前的錯誤匹配
        if (props.region === 'china' && factory.id == 20) {
             // 強制關聯圖標
             const manualIcon = iconGroups.find(g => {
               const f = g.getAttribute('filter')
               return f && f.includes('filter2_dd')
             })
             if (manualIcon) {
               iconGroup = manualIcon
               console.log('FORCE OVERRIDE: Linked Icon filter2_dd for ID 20')
             }
             
             // 強制關聯箭頭 (通過路徑特徵)
             // d="M699.25 583..."
             const manualArrow = arrowPaths.find(p => {
               const d = p.getAttribute('d')
               return d && d.startsWith('M699.25 583')
             })
             if (manualArrow) {
               associatedArrow = manualArrow
               console.log('FORCE OVERRIDE: Linked Arrow M699 for ID 20')
             }
        }

        // --- FORCE OVERRIDE FOR INDONESIA ID 25 ---
        if (props.region === 'indonesia' && factory.id == 25) {
             // 強制關聯箭頭 (d="M517.75 583...")
             const manualArrow = arrowPaths.find(p => {
               const d = p.getAttribute('d')
               return d && d.startsWith('M517.75 583')
             })
             if (manualArrow) {
               associatedArrow = manualArrow
               console.log('FORCE OVERRIDE: Linked Arrow M517 for ID 25')
             }

             // 強制關聯圖標 (尋找位於 arrow 終點 476, 508 附近的圖標)
             // 這樣比猜測 filter ID 更安全
             let bestIcon = null
             let bestDist = Infinity
             const targetX = 476
             const targetY = 508
             
             iconGroups.forEach(g => {
                const yellowIcon = g.querySelector('path[fill="#FFC936"]')
                if (yellowIcon) {
                   const d = yellowIcon.getAttribute('d')
                   const coords = d ? d.match(/[+-]?(\d*\.\d+|\d+)/g) : null
                   if (coords && coords.length >= 2) {
                      const x = parseFloat(coords[0])
                      const y = parseFloat(coords[1])
                      const dist = Math.sqrt(Math.pow(x - targetX, 2) + Math.pow(y - targetY, 2))
                      if (dist < bestDist) {
                        bestDist = dist
                        bestIcon = g
                      }
                   }
                }
             })
             
             if (bestIcon && bestDist < 100) {
                iconGroup = bestIcon
                console.log(`FORCE OVERRIDE: Linked Icon for ID 25 (dist: ${bestDist.toFixed(1)})`)
             }
        }

        // --- FORCE OVERRIDE FOR VIETNAM ID 33 ---
        if (props.region === 'vietnam' && factory.id == 33) {
             const manualIcon = iconGroups.find(g => {
                const yellowIcon = g.querySelector('path[fill="#FFC936"]')
                if (yellowIcon) {
                   const d = yellowIcon.getAttribute('d')
                   return d && d.startsWith('M772.256 663.019')
                }
                return false
             })
             
             if (manualIcon) {
                iconGroup = manualIcon
                console.log('FORCE OVERRIDE: Linked Icon for Vietnam ID 33')
             }
        }

        // --- FORCE OVERRIDE FOR THAILAND ID 40 ---
        if (props.region === 'thailand' && factory.id == 40) {
             const manualIcon = iconGroups.find(g => {
                const yellowIcon = g.querySelector('path[fill="#FFC936"]')
                if (yellowIcon) {
                   const d = yellowIcon.getAttribute('d')
                   return d && d.startsWith('M719.256 348.019')
                }
                return false
             })
             
             if (manualIcon) {
                iconGroup = manualIcon
                console.log('FORCE OVERRIDE: Linked Icon for Thailand ID 40')
             }
        }
        
        // 收集需要一起顯示/隱藏的元素
        const elementsToToggle = [element] // 藍色按鈕
        if (iconGroup) {
          elementsToToggle.push(iconGroup) // 整個圖標組（包含所有子元素）
        }
        if (associatedArrow) {
          elementsToToggle.push(associatedArrow) // 自動檢測到的箭頭線條
        }
        
        // 根據 shouldShow 來設置顯示/隱藏（帶淡入淡出效果）
        if (shouldShow) {
          elementsToToggle.forEach(el => {
            // 取消之前可能存在的隱藏定時器
            if (el._hideTimeout) {
              clearTimeout(el._hideTimeout)
              el._hideTimeout = null
            }
            
            // 淡入效果
            // 對於 SVG 元素,使用空字符串恢復默認 display 值
            el.style.display = ''
            el.style.transition = 'opacity 0.4s ease-in-out'
            el.style.opacity = '0'
            
            // 使用 requestAnimationFrame 確保過渡效果生效
            requestAnimationFrame(() => {
              el.style.opacity = '1'
            })
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
          elementsToToggle.forEach(el => {
            // 取消之前可能存在的隱藏定時器
            if (el._hideTimeout) {
              clearTimeout(el._hideTimeout)
              el._hideTimeout = null
            }
            
            // 淡出效果
            el.style.transition = 'opacity 0.4s ease-in-out'
            el.style.opacity = '0'
            
            // 等待淡出動畫完成後再隱藏,並保存 timeout ID
            el._hideTimeout = setTimeout(() => {
              el.style.display = 'none'
              el._hideTimeout = null
            }, 400) // 與 transition 時間一致
          })
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
