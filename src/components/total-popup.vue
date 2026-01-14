<template>
  <div class="total-popup">
    <div class="popup-mask"></div>
    <div class="popup-content">
      <div class="total-list">
        <div v-for="item in totalItems" :key="item.name" class="total-item">
            <div class="flex-1 flex items-end justify-center">
                <img :src="item.icon" :alt="item.name">
            </div>
             <div class="total-item-name" :class="locale === 'en' ? '!text-[24px]' : 'text-[26px]'">{{ item.value }}</div>
            <div class="total-item-value" :class="locale === 'en' ? '!text-[20px]' : 'text-[24px]'">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <img class="close-icon" src="/icon/close-icon.svg" alt="Close" @click="close">
  </div>
</template>
<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
const emit = defineEmits(['close'])
const { t, locale } = useI18n()

const close = () => {
  emit('close')
}
const totalItems = computed(() => [
  {name: t('stats.employees'), value: t('stats.employeeCount'), icon: '/icon/total-icon-1.svg'},
  {name: t('stats.productionBases'), value: '51', icon: '/icon/total-icon-2.svg'},
  {name: t('stats.revenue2024'), value: t('stats.revenueAmount'), icon: '/icon/total-icon-3.svg'},
  {name: t('stats.annualCapacity'), value: t('stats.plasticCaps'), icon: '/icon/total-icon-4.svg'},
  {name: t('stats.annualCapacity'), value: t('stats.preforms'), icon: '/icon/total-icon-5.svg'},
  {name: t('stats.annualCapacity'), value: t('stats.clawCaps'), icon: '/icon/total-icon-6.svg'},
  {name: t('stats.annualCapacity'), value: t('stats.aluminumCaps'), icon: '/icon/total-icon-7.svg'},
  {name: t('stats.annualCapacity'), value: t('stats.bottles'), icon: '/icon/total-icon-8.svg'},
  {name: t('stats.annualCapacity'), value: t('stats.beverageFilling'), icon: '/icon/total-icon-9.svg'},
  {name: t('stats.annualCapacity'), value: t('stats.labels'), icon: '/icon/total-icon-10.svg'}
])
</script>

<style lang="scss" scoped>
.total-popup {
  @apply fixed top-[112px] left-[35px] w-[1651px] h-[894px] z-[2] flex items-center justify-between gap-[16px];
  
  .popup-content {
    @apply relative z-[2] h-full w-[1577px] border-[8px] border-[#FFC936] rounded-[32px] flex items-center justify-center;
    box-shadow: 2px 0px 8px 0px #00000066;
    background-color: #C6E0F1;
    background-image: url('/total-bg.svg');
    background-size: cover;
    background-position: center;
  }

  .total-list {
    @apply grid grid-cols-5 gap-[32px];
    .total-item {
      @apply bg-[#C6E0F1] w-[240px] h-[240px] rounded-[48px] overflow-hidden flex flex-col;
      box-shadow: 4px 4px 4px 0px #00000040;
      .total-item-name{
        @apply flex items-center justify-center h-[68px] text-[26px] text-[#2B74C6] font-[700];
      }
      .total-item-value {
        @apply flex items-center justify-center bg-[#2B74C6] h-[60px] text-[24px] text-white font-[700];
      }
    }
  }

  .close-icon {
    @apply relative z-[2];
  }

  .popup-mask {
    @apply fixed top-0 left-0 w-full h-full z-[1];
    background-color: rgba(0, 0, 0, 0.5);
  }
}

/* 淡入淡出過渡動畫 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-active .popup-content,
.fade-leave-active .popup-content {
  transition: opacity 0.3s ease, transform 0.3s ease;
}


.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-from .popup-content,
.fade-leave-to .popup-content {
  opacity: 0;
  transform: scale(0.95);
}

.total-item {
  @apply relative z-[2];
}

</style>