<template>
  <view class="container">
    <!-- #ifdef MP-WEIXIN -->
    <!-- 直链视频（.mp4 / .m3u8）：用原生 video 组件 -->
    <video
      v-if="isDirectVideo"
      :src="videoUrl"
      class="video"
      controls
      autoplay
      show-fullscreen-btn
      show-play-btn
      show-center-play-btn
      enable-play-gesture
    />
    <!-- B站 / 其他嵌入播放器：用 web-view -->
    <web-view v-else :src="videoUrl" />
    <!-- #endif -->

    <!-- #ifdef H5 -->
    <iframe :src="videoUrl" class="iframe" frameborder="0" allowfullscreen="true" />
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const videoUrl = ref('')

// 判断是否为直链视频文件
const isDirectVideo = computed(() => {
  const url = videoUrl.value
  return /\.(mp4|m3u8|flv|avi|mov|wmv)(\?.*)?$/i.test(url)
})

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1] as any
  const raw = currentPage.$page?.options?.url || currentPage.options?.url || ''
  videoUrl.value = decodeURIComponent(raw)
})
</script>

<style scoped>
.container {
  width: 100%;
  height: 100vh;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.video {
  width: 100%;
  height: 100vh;
}
.iframe {
  width: 100%;
  height: 100vh;
  border: none;
}
</style>
