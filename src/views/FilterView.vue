<template>
  <Layout>
    <div class="container">
      <!-- 全球地圖 -->
      <Transition name="map-zoom" mode="out-in" >
        <img 
          :key="currentMap"
          class="map-img" 
          :class="{ 'cursor-pointer': selectedRegion !== '' }"
          :src="currentMap" 
          alt="map" 
          @click="handleMapClick"
        >
      </Transition>

      <!-- 右側選單 -->
      <Transition name="slide-in-right" appear>
        <div class="filter-right-menu">
          <button class="home-button" @click="router.push('/')">
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
import { useRouter } from 'vue-router'
import Layout from '../components/layout/layout.vue'
import { useI18n } from 'vue-i18n'
import { computed, ref } from 'vue'

const router = useRouter()
const { t, locale } = useI18n()

// 選中的產品（多選）
const selectedProducts = ref([])
// 選中的據點（單選）
const selectedRegion = ref('')

const currentMap = computed(() => {
  if (selectedRegion.value === '') return '/map/world.svg'
  return `/map/${selectedRegion.value}.svg`
})

const handleMapClick = () => {
  console.log('handleMapClick')
  if (selectedRegion.value !== '') {
    router.push('/detail')
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
  selectedRegion.value = ''
  console.log('Cleared region filter')
}

const filterTypeList = computed(() => [
  {'name': t('products.lugCap'), 'value': '爪蓋', 'disabled': true},
  {'name': t('products.aluminumCap'), 'value': '鋁蓋', 'disabled': false},
  {'name': t('products.plasticCap'), 'value': '塑蓋', 'disabled': false},
  {'name': t('products.label'), 'value': '標籤', 'disabled': false},
  {'name': t('products.petBottle'), 'value': 'PET寶特瓶', 'disabled': false},
  {'name': t('products.preform'), 'value': '瓶胚', 'disabled': false},
  {'name': t('products.asepticFilling'), 'value': '無菌充填', 'disabled': false},
  {'name': t('products.hotFilling'), 'value': '熱充填', 'disabled': false},
  {'name': t('products.waterFilling'), 'value': '水充填', 'disabled': false},
  {'name': t('products.coldHighPressureFilling'), 'value': '冷高壓充填', 'disabled': false},
])
const filterRegionList = computed(() => [
  {'name': t('regions.taiwan'), 'value': 'taiwan', amount: 10, disabled: false },
  {'name': t('regions.china'), 'value': 'china', amount: 14, disabled: false },
  {'name': t('regions.indonesia'), 'value': 'indonesia', amount: 7, disabled: false },
  {'name': t('regions.vietnam'), 'value': 'vietnam', amount: 5, disabled: false },
  {'name': t('regions.thailand'), 'value': 'thailand', amount: 5, disabled: false },
  {'name': t('regions.malaysia'), 'value': 'malaysia', amount: 2, disabled: false },
  {'name': t('regions.myanmar'), 'value': 'myanmar', amount: 1, disabled: false },
  {'name': t('regions.cambodia'), 'value': 'cambodia', amount: 1, disabled: false },
  {'name': t('regions.mozambique'), 'value': 'mozambique', amount: 0, disabled: true },
])


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

.slide-in-right-enter-active {
  transition: all 0.8s ease-out;
}

.slide-in-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
</style>
