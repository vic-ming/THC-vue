<template>
  <Layout>
    <div class="container">
      <!-- 全球地圖 -->
      <Transition :name="mapTransitionName" mode="out-in">
        <WorldMap
          v-if="selectedRegion === ''"
          key="world-map-interactive"
          :map-src="currentMap"
          :selected-region="selectedRegion"
          @region-click="handleRegionClick"
          class="map-img"
        />
        <RegionMap
          v-else
          :key="`region-map-${selectedRegion}`"
          :map-src="currentMap"
          :region="selectedRegion"
          :factories="currentRegionFactories"
          @factory-click="handleFactoryClick"
          class="map-img"
        />
      </Transition>

      <!-- 右側選單 -->
      <Transition name="slide-in-right" appear>
        <div class="filter-right-menu">
          <button class="home-button" @click="router.push('/home')">
            <img class="w-[40px] h-[40px] absolute right-[-14px] top-[-18px] " src="/icon/menu-home.svg" alt="home">
            {{ t('menu.home') }}
          </button>
          <div class="menu-inside">
            <div class="filter-box">
              <div class="filter-title" :class="{ '!text-[28px]': locale === 'en' }">
                {{ t('filter.productsAndServices') }}
                <span :class="{ '!text-[20px]': locale === 'en' }" @click="clearProductFilter">{{ t('filter.clearProductFilter') }}</span>
              </div>
              <div class="filter-list">
                <div 
                  class="filter-item" 
                  :class="{
                    'disabled': item.disabled,
                    'selected': selectedProducts.includes(item.value)
                  }" 
                  v-for="item in filterTypeList" 
                  :key="item.value" 
                  @click="toggleProduct(item)"
                >
                  {{ item.name }}
                </div>
              </div>
            </div>

            <div class="filter-box">
              <div class="filter-title" :class="{ '!text-[28px]': locale === 'en' }">
                {{ t('location.global') }}
                <span :class="{ '!text-[20px]': locale === 'en' }" @click="clearRegionFilter">{{ t('location.clean') }}</span>
              </div>
              <div class="region-list">
                <div 
                  class="region-item" 
                  :class="{'selected': selectedRegion === item.value, 'disabled': item.disabled}"
                  v-for="item in filterRegionList" 
                  :key="item.value"
                  @click="selectRegion(item)"
                >
                  <img v-if="selectedRegion === item.value" src="/icon/arrow-icon-active.svg" alt="arrow">
                  <img v-else src="/icon/arrow-icon.svg" alt="arrow">
                  <span>{{ item.name }}({{ item.amount }})</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Transition>

    </div>
  </Layout>
</template>
<script setup>
import { useRouter, useRoute } from 'vue-router'
import Layout from '../components/layout/layout.vue'
import WorldMap from '../components/WorldMap.vue'
import RegionMap from '../components/RegionMap.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref, watch } from 'vue'
import { useAppData } from '../composables/useAppData.js'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// 使用全局共享的應用數據
const { productServices, regions } = useAppData()

// 選中的產品（多選）
const selectedProducts = ref([])
// 選中的據點（單選）- 從 query 參數初始化
const selectedRegion = ref(route.query.region || '')
// 追蹤上一個選中的區域，用於判斷動畫類型
const previousRegion = ref(route.query.region || '')

const currentMap = computed(() => {
  if (selectedRegion.value === '') return '/map/world.svg'
  return `/map/${selectedRegion.value}.svg`
})

// 獲取當前選中區域的工廠列表
const currentRegionFactories = computed(() => {
  if (selectedRegion.value === '' || !regions.value) {
    return []
  }
  
  const selectedRegionData = regions.value.find(region => {
    const regionValue = (region.name.en || '').toLowerCase().replace(/\s+/g, '-')
    return regionValue === selectedRegion.value
  })
  
  return selectedRegionData?.factories || []
})


// 動態決定使用哪種動畫
// 世界地圖 -> 區域地圖：使用 zoom（小到大）
// 區域地圖 -> 世界地圖：使用 zoom-reverse（大到小）
// 區域地圖 <-> 區域地圖：使用 fade
const mapTransitionName = computed(() => {
  // 如果從世界地圖（空字串）切換到區域地圖，使用 zoom（小到大）
  if (previousRegion.value === '' && selectedRegion.value !== '') {
    return 'map-zoom'
  }
  // 如果從區域地圖切換回世界地圖，使用 zoom-reverse（大到小）
  if (previousRegion.value !== '' && selectedRegion.value === '') {
    return 'map-zoom-reverse'
  }
  // 區域地圖之間切換，使用 fade
  return 'map-fade'
})

const handleRegionClick = (region) => {
  console.log('Region clicked:', region)
  previousRegion.value = selectedRegion.value
  selectedRegion.value = region
}

// 處理工廠點擊事件
const handleFactoryClick = ({ factory, index }) => {
  console.log('Factory clicked:', factory.name, 'Index:', index)
  // 跳轉到 DetailView 並傳遞工廠 ID
  router.push({
    path: '/detail',
    query: { 
      region: selectedRegion.value,
      factoryId: factory.id 
    }
  })
}

const handleMapClick = () => {
  console.log('handleMapClick')
  if (selectedRegion.value !== '') {
    router.push({
      path: '/detail',
      query: { region: selectedRegion.value }
    })
  }
}

// 切換產品選擇（多選）
const toggleProduct = (item) => {
  if (item.disabled) return
  
  const index = selectedProducts.value.indexOf(item.value)
  if (index > -1) {
    // 已選中，則取消選中
    selectedProducts.value.splice(index, 1)
  } else {
    // 未選中，則添加到選中列表
    selectedProducts.value.push(item.value)
  }
  console.log('Selected products:', selectedProducts.value)
}

// 選擇據點（單選）
const selectRegion = (item) => {
  if (item.disabled) return
  previousRegion.value = selectedRegion.value
  selectedRegion.value = item.value
  console.log('Selected region:', selectedRegion.value)
}

// 清除產品篩選
const clearProductFilter = () => {
  selectedProducts.value = []
  console.log('Cleared product filter')
}

// 清除據點篩選
const clearRegionFilter = () => {
  previousRegion.value = selectedRegion.value
  selectedRegion.value = ''
  console.log('Cleared region filter')
}

// 監聽選中區域的變化，自動清除該區域沒有的已選產品
watch(selectedRegion, (newRegion) => {
  if (newRegion !== '') {
    // 獲取當前區域可用的產品服務
    const availableServices = new Set()
    const selectedRegionData = regions.value?.find(region => {
      const regionValue = (region.name.en || '').toLowerCase().replace(/\s+/g, '-')
      return regionValue === newRegion
    })
    
    if (selectedRegionData && selectedRegionData.factories) {
      selectedRegionData.factories.forEach(factory => {
        if (factory.product_services && Array.isArray(factory.product_services)) {
          factory.product_services.forEach(service => {
            if (service.name && service.name.zh) {
              availableServices.add(service.name.zh)
            }
          })
        }
      })
    }
    
    // 過濾掉該區域沒有的已選產品
    selectedProducts.value = selectedProducts.value.filter(product => 
      availableServices.has(product)
    )
  }
})

// 從 API 數據生成產品服務列表
const filterTypeList = computed(() => {
  if (!productServices.value || productServices.value.length === 0) {
    // 如果 API 數據還沒加載，返回空數組
    return []
  }
  
  // 如果選中了區域，需要檢查該區域的工廠提供哪些產品服務
  let availableProductServices = new Set()
  
  if (selectedRegion.value !== '') {
    // 找到選中的區域
    const selectedRegionData = regions.value?.find(region => {
      const regionValue = (region.name.en || '').toLowerCase().replace(/\s+/g, '-')
      return regionValue === selectedRegion.value
    })
    
    if (selectedRegionData && selectedRegionData.factories) {
      // 收集該區域所有工廠的產品服務
      selectedRegionData.factories.forEach(factory => {
        if (factory.product_services && Array.isArray(factory.product_services)) {
          factory.product_services.forEach(service => {
            // 使用產品服務的中文名稱作為標識
            if (service.name && service.name.zh) {
              availableProductServices.add(service.name.zh)
            }
          })
        }
      })
    }
  }
  
  return productServices.value.map(service => {
    const serviceName = service.name.zh
    
    // 如果選中了區域，檢查該服務是否在該區域可用
    const isDisabled = selectedRegion.value !== '' && !availableProductServices.has(serviceName)
    
    return {
      name: locale.value === 'zh-TW' ? service.name.zh : service.name.en,
      value: serviceName, // 使用中文名稱作為 value
      id: service.id,
      disabled: isDisabled
    }
  })
})

// 從 API 數據生成區域列表
const filterRegionList = computed(() => {
  if (!regions.value || regions.value.length === 0) {
    return []
  }
  
  return regions.value.map(region => {
    const factoryCount = region.factories ? region.factories.length : 0
    // 將區域名稱轉換為小寫英文作為 value（用於路由）
    const regionValue = (region.name.en || '').toLowerCase().replace(/\s+/g, '-')
    
    return {
      name: locale.value === 'zh-TW' ? region.name.zh : region.name.en,
      value: regionValue,
      amount: factoryCount,
      id: region.id,
      disabled: factoryCount === 0
    }
  })
})

</script>
<style scoped>
.map-zoom-enter-active,
.map-zoom-leave-active {
  transition: all 1.2s ease-in-out;
}

.map-zoom-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.map-zoom-leave-to {
  opacity: 0;
  transform: scale(1.2);
}

/* 區域地圖之間切換使用淡入淡出 */
.map-fade-enter-active,
.map-fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.map-fade-enter-from,
.map-fade-leave-to {
  opacity: 0;
}

/* 區域地圖返回世界地圖：區域地圖淡出，世界地圖從大到小縮放進入 */
.map-zoom-reverse-enter-active,
.map-zoom-reverse-leave-active {
  transition: all 1.2s ease-in-out;
}

.map-zoom-reverse-enter-from {
  opacity: 0;
  transform: scale(1.2);
}

.map-zoom-reverse-leave-to {
  opacity: 0;
}

.slide-in-right-enter-active {
  transition: all 0.8s ease-out;
}

.slide-in-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
</style>
