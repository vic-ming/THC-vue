<template>
  <div class="w-full h-full bg-[#F0F8FF]">
    <img class="w-[235px] fixed top-[30px] left-[64px] z-[2]" src="/thc-logo.png" alt="">
    <slot />
    <!-- 底部 -->
    <div class="w-full fixed bottom-0 left-0 right-0 z-[1]">
        <img class="w-full absolute bottom-0" src="/curve.gif" alt="">
    </div>
  </div>
</template>

<style lang="scss">
</style>