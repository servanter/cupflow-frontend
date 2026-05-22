<template>
  <view class="container">

    <!-- 视频区域：有视频时展示在最顶部 -->
    <view class="video-section" v-if="detail.video_url">
      <!-- H5: iframe 内嵌播放 -->
      <!-- #ifdef H5 -->
      <iframe
        :src="embedUrl"
        class="video-player"
        frameborder="0"
        scrolling="no"
        allowfullscreen="true"
      />
      <!-- #endif -->

      <!-- 小程序: 直链 MP4 → video 组件；B站 → 封面 + 点击全屏 -->
      <!-- #ifndef H5 -->
      <video
        v-if="isDirectVideo"
        :src="detail.video_url"
        class="video-player"
        controls
        autoplay
        show-fullscreen-btn
        show-center-play-btn
        enable-play-gesture
      />
      <view v-else class="video-fallback" @tap="openVideoFullscreen">
        <view class="play-overlay">
          <view class="play-btn">
            <text class="play-icon">▶</text>
          </view>
          <text class="play-tip">点击全屏播放</text>
        </view>
      </view>
      <!-- #endif -->
    </view>

    <!-- 详情内容 -->
    <view class="detail-card">
      <view class="match-info">
        <text class="match-teams">{{ detail.home_team_name }} {{ detail.home_score }}-{{ detail.away_score }} {{ detail.away_team_name }}</text>
        <text class="match-date">{{ formatDate(detail.match_date) }}</text>
      </view>
      <text class="title">{{ detail.title }}</text>
      <view class="meta">
        <text class="type">{{ detail.type }}</text>
        <text class="time">场上时间: {{ detail.occur_time }}</text>
      </view>
      <view class="description" v-if="detail.description">
        <text>{{ detail.description }}</text>
      </view>
      <view class="action-bar">
        <view class="action-btn" @tap="goLive">
          <text>📡 查看本场文字直播</text>
        </view>
      </view>
    </view>

  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/api";

const detail = ref<any>({});
const highlightId = ref(0);

// #ifdef MP-WEIXIN
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
onShareAppMessage(() => ({
  title: detail.value.title ? `${detail.value.title} - 精彩回放` : "CupFlow - 精彩回放",
  path: `/pages/highlight-detail/index?id=${highlightId.value}`,
  imageUrl: "/static/logo.png",
}));
onShareTimeline(() => ({
  title: detail.value.title ? `${detail.value.title} - 精彩回放` : "CupFlow - 精彩回放",
  imageUrl: "/static/logo.png",
}));
// #endif

// 是否为直链视频文件（.mp4 / .m3u8 等）
const isDirectVideo = computed(() =>
  /\.(mp4|m3u8|flv|mov|avi)(\?.*)?$/i.test(detail.value.video_url || "")
);

// 将 B站链接转为嵌入播放器地址（H5 iframe 用）
const embedUrl = computed(() => {
  const url = detail.value.video_url;
  if (!url) return "";
  const bvMatch = url.match(/bilibili\.com\/video\/(BV[\w]+)/);
  if (bvMatch) {
    return `https://player.bilibili.com/player.html?bvid=${bvMatch[1]}&high_quality=1&autoplay=1`;
  }
  if (url.includes("player.bilibili.com")) return url;
  return url;
});

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  highlightId.value = Number(currentPage.$page?.options?.id || currentPage.options?.id || 0);
  fetchDetail();
});

const fetchDetail = async () => {
  const res = await api.get(`/api/highlights/${highlightId.value}`);
  if (res.code === 200) detail.value = res.data;
};

// 小程序 B站视频：跳转全屏播放页
const openVideoFullscreen = () => {
  if (!detail.value.video_url) return;
  let playUrl = detail.value.video_url;
  const bvMatch = playUrl.match(/bilibili\.com\/video\/(BV[\w]+)/);
  if (bvMatch) {
    playUrl = `https://player.bilibili.com/player.html?bvid=${bvMatch[1]}&high_quality=1&autoplay=1`;
  }
  uni.navigateTo({
    url: `/pages/video-player/index?url=${encodeURIComponent(playUrl)}`,
  });
};

const goLive = () => {
  uni.navigateTo({ url: `/pages/match-live/index?id=${detail.value.match_id}` });
};

const formatDate = (date: string) => (date ? date.split("T")[0] : "");
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 视频区域 */
.video-section {
  width: 100%;
  background: #000;
}
.video-player {
  width: 100%;
  height: 420rpx;
  display: block;
}
.video-fallback {
  position: relative;
  width: 100%;
  height: 420rpx;
  background: #111;
}
.play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.play-btn {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16rpx;
}
.play-icon {
  font-size: 44rpx;
  color: #1a73e8;
  margin-left: 8rpx;
}
.play-tip {
  font-size: 24rpx;
  color: #fff;
}

/* 详情卡片 */
.detail-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 20rpx;
}
.match-info {
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.match-teams {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  display: block;
}
.match-date {
  font-size: 24rpx;
  color: #999;
  margin-top: 8rpx;
  display: block;
}
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}
.meta {
  display: flex;
  gap: 20rpx;
  margin-bottom: 20rpx;
}
.type {
  font-size: 24rpx;
  background: #e3f2fd;
  color: #1565c0;
  padding: 6rpx 16rpx;
  border-radius: 6rpx;
}
.time {
  font-size: 24rpx;
  color: #666;
  line-height: 48rpx;
}
.description {
  font-size: 28rpx;
  color: #444;
  line-height: 1.6;
  margin-bottom: 24rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}
.action-bar {
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}
.action-btn {
  text-align: center;
  padding: 20rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #1a73e8;
}
</style>
