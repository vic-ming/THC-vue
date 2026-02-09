<template>
  <div class="video-wrapper">
    <div ref="container" class="video-360-container"></div>
    
    <!-- Controls Overlay -->
    <div class="controls">
      <button class="control-btn" @click="togglePlay">
        <svg v-if="isPlaying" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        <svg v-else fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
      
      <button class="control-btn" @click="toggleMute">
        <svg v-if="isMuted" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
        </svg>
        <svg v-else fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  autoplay: {
    type: Boolean,
    default: true
  },
  muted: {
    type: Boolean,
    default: false
  },
  loop: {
    type: Boolean,
    default: true
  }
})

const container = ref(null)
const isPlaying = ref(false)
const isMuted = ref(props.muted)

let scene, camera, renderer, controls, video, texture, mesh

const processedSrc = computed(() => {
    // In development, use proxy to bypass CORS if URL points to API server
    if (import.meta.env.DEV && props.src && props.src.startsWith('https://honchuan.vjinc.biz')) {
        const proxied = props.src.replace('https://honchuan.vjinc.biz', '')
        console.log('Video360: Using proxied URL:', proxied)
        return proxied
    }
    return props.src
})

const togglePlay = () => {
  if (!video) return
  if (video.paused) {
    video.play().catch(e => console.warn(e))
  } else {
    video.pause()
  }
}

const toggleMute = () => {
  if (!video) return
  video.muted = !video.muted
  isMuted.value = video.muted
}

const init = () => {
  if (!container.value) return

  // 1. Scene
  scene = new THREE.Scene()
  
  // 2. Camera
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  camera = new THREE.PerspectiveCamera(75, width / height, 1, 1100)
  camera.position.set(0, 0, 0.1) // Start inside the sphere

  // 3. Renderer
  renderer = new THREE.WebGLRenderer({ antialias: false }) // Performance: disable antialias
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) // Performance: cap at 2x
  renderer.setSize(width, height)
  container.value.appendChild(renderer.domElement)

  // 4. Video & Texture
  video = document.createElement('video')
  video.src = processedSrc.value // Use processedSrc
  video.crossOrigin = 'anonymous'
  video.loop = props.loop
  video.muted = props.muted
  video.playsInline = true
  video.preload = 'auto' // Hints to browser to buffer
  
  // Update state listeners
  video.addEventListener('play', () => isPlaying.value = true)
  video.addEventListener('pause', () => isPlaying.value = false)
  video.addEventListener('volumechange', () => isMuted.value = video.muted)
  
  console.log('Video360: Video created with src:', processedSrc.value)
  
  const startPlay = () => {
      video.play().then(() => {
          console.log('Video360: Play started successfully')
      }).catch(e => {
          console.warn('Video360: Auto-play failed', e)
          isPlaying.value = false
      })
  }

  if (props.autoplay) {
    startPlay()
  } else {
      console.log('Video360: Autoplay disabled')
      isPlaying.value = false
  }

  texture = new THREE.VideoTexture(video)
  texture.colorSpace = THREE.SRGBColorSpace; 
  texture.minFilter = THREE.LinearFilter // Performance: avoid mipmaps
  texture.magFilter = THREE.LinearFilter
  texture.generateMipmaps = false
  
  console.log('Video360: Texture created')

  // 5. Sphere Geometry (Inverted)
  const geometry = new THREE.SphereGeometry(500, 60, 40)
  // invert the geometry on the x-axis so that all of the faces point inward
  geometry.scale(-1, 1, 1)

  const material = new THREE.MeshBasicMaterial({ map: texture })
  mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  // 6. Controls
  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false 
  controls.enablePan = false
  controls.rotateSpeed = -0.5 
  
  // 7. Resize Handler
  window.addEventListener('resize', onWindowResize)
  
  // 8. Animation Loop
  animate()
}

const onWindowResize = () => {
  if (!container.value || !camera || !renderer) return
  
  const width = container.value.clientWidth
  const height = container.value.clientHeight
  
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  
  renderer.setSize(width, height)
}

const animate = () => {
  requestAnimationFrame(animate)
  if (controls) controls.update()
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

// Watch props
watch(() => props.src, () => {
  if (video) {
    video.src = processedSrc.value
    if (props.autoplay) video.play()
    else {
        video.pause()
        isPlaying.value = false
    }
  }
})

watch(() => props.muted, (newVal) => {
  if (video) {
      video.muted = newVal
      isMuted.value = newVal
  }
})

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
  
  // Stop video
  if (video) {
    video.pause()
    video.src = ''
    video.load()
  }
  
  // Dispose Three.js resources
  if (controls) controls.dispose()
  if (renderer) {
    renderer.dispose()
    if (container.value && renderer.domElement) {
        container.value.removeChild(renderer.domElement)
    }
  }
  if (texture) texture.dispose()
  if (mesh) {
    if (mesh.geometry) mesh.geometry.dispose()
    if (mesh.material) mesh.material.dispose()
  }
})
</script>

<style scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}

.video-360-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #000;
  cursor: grab;
}
.video-360-container:active {
  cursor: grabbing;
}

.controls {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 16px;
  background: rgba(0, 0, 0, 0.5);
  padding: 10px 20px;
  border-radius: 30px;
  backdrop-filter: blur(5px);
  z-index: 10;
}

.control-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  transition: background 0.2s;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
