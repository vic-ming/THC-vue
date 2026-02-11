<template>
  <div class="waves-container">
    <svg 
      class="waves" 
      xmlns="http://www.w3.org/2000/svg" 
      xmlns:xlink="http://www.w3.org/1999/xlink" 
      viewBox="0 24 150 28" 
      preserveAspectRatio="none" 
      shape-rendering="auto"
    >
      <defs>
        <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
      </defs>
      <g class="parallax">
        <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255, 199, 42, 0.7)" />
        <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255, 199, 42, 0.3)" />
        <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(33, 109, 196, 0.5)" />
        <use xlink:href="#gentle-wave" x="48" y="7" fill="#216dc4" />
      </g>
    </svg>
  </div>
</template>

<script setup>
// Using a multi-layered wave for a smoother, more organic effect like water.
// The fill colors use white with opacity adjustments.
// If the background is not blue/water, we can adjust via props later.
</script>

<style scoped>
.waves-container {
  width: 100%;
  height: 140px;
  /* Ensure it sits at the bottom if used in a specific layout */
}

.waves {
  position: relative;
  width: 100%;
  height: 100%;
  margin-bottom: -7px; /* Fix for gap */
}

/* Animation */
.parallax > use {
  animation: move-forever 25s cubic-bezier(.55,.5,.45,.5) infinite;
}
.parallax > use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 30s;
}
.parallax > use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 30s;
}
.parallax > use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 30s;
}
.parallax > use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 30s;
}

@keyframes move-forever {
  0% {
   transform: translate3d(-90px,0,0);
  }
  100% { 
    transform: translate3d(85px,0,0);
  }
}
</style>
