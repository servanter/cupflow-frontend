<template>
  <view class="container">

    <!-- 视频区域：有视频时展示在最顶部（直接当 mp4 播放） -->
    <view class="video-section" v-if="detail.video_url">
      <!-- #ifdef H5 -->
      <video
        :src="detail.video_url"
        class="video-player"
        controls
        autoplay
        playsinline
      />
      <!-- #endif -->

      <!-- #ifndef H5 -->
      <video
        :src="detail.video_url"
        class="video-player"
        controls
        autoplay
        show-fullscreen-btn
        show-center-play-btn
        enable-play-gesture
      />
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
      <!-- 描述：兼容图文混排 -->
      <view class="description" v-if="detail.description">
        <block v-for="(seg, index) in descriptionSegments" :key="index">
          <image
            v-if="seg.type === 'image'"
            :src="seg.content"
            class="desc-img"
            mode="widthFix"
            show-menu-by-longpress
          />
          <text v-else class="desc-text">{{ seg.content }}</text>
        </block>
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

// 描述内容图文混排解析（兼容 [img]xxx[/img] 标签）
const descriptionSegments = computed(() => {
  const raw = detail.value.description || "";
  const parts: { type: "text" | "image"; content: string }[] = [];
  const regex = /\[img\]([\s\S]*?)\[\/img\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const textBlock = raw.slice(lastIndex, match.index);
      textBlock.split(/\n+/).filter((p: string) => p.trim()).forEach((p: string) => {
        parts.push({ type: "text", content: p.trim() });
      });
    }
    parts.push({ type: "image", content: match[1].trim() });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < raw.length) {
    const tail = raw.slice(lastIndex);
    tail.split(/\n+/).filter((p: string) => p.trim()).forEach((p: string) => {
      parts.push({ type: "text", content: p.trim() });
    });
  }
  return parts;
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
.desc-text {
  font-size: 28rpx;
  color: #444;
  line-height: 1.8;
  display: block;
  margin-bottom: 16rpx;
}
.desc-img {
  width: 100%;
  border-radius: 10rpx;
  display: block;
  margin: 10rpx 0 20rpx;
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
