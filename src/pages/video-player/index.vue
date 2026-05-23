<template>
  <view class="container">
    <!-- #ifdef H5 -->
    <iframe :src="videoUrl" class="iframe" frameborder="0" allowfullscreen="true" />
    <!-- #endif -->

    <!-- #ifdef MP-WEIXIN -->
    <!-- 小程序端不支持视频服务，此页面不应被跳转 -->
    <view class="unsupported">
      <text class="unsupported-icon">📺</text>
      <text class="unsupported-text">请复制链接到浏览器观看</text>
      <view class="copy-btn" @tap="copyLink">复制链接</view>
    </view>
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const videoUrl = ref('')

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

const copyLink = () => {
  uni.setClipboardData({
    data: videoUrl.value,
    success: () => uni.showToast({ title: '链接已复制', icon: 'none' }),
  })
}
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
.iframe {
  width: 100%;
  height: 100vh;
  border: none;
}
.unsupported {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24rpx;
  padding: 60rpx;
}
.unsupported-icon {
  font-size: 80rpx;
}
.unsupported-text {
  font-size: 30rpx;
  color: #fff;
}
.copy-btn {
  margin-top: 10rpx;
  padding: 18rpx 60rpx;
  background: #1a73e8;
  color: #fff;
  border-radius: 50rpx;
  font-size: 28rpx;
}
</style>
