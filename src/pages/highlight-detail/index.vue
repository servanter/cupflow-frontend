<template>
  <view class="container">
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
      <view class="video-link" v-if="detail.video_url" @tap="openVideo">
        <text class="video-icon">▶️</text>
        <text class="video-text">观看视频回放</text>
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
import { ref, onMounted } from "vue";
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

const openVideo = () => {
  if (detail.value.video_url) {
    // #ifdef H5
    window.open(detail.value.video_url, "_blank");
    // #endif
    // #ifndef H5
    uni.setClipboardData({
      data: detail.value.video_url,
      success: () => uni.showToast({ title: "链接已复制", icon: "success" }),
    });
    // #endif
  }
};

const goLive = () => {
  uni.navigateTo({ url: `/pages/match-live/index?id=${detail.value.match_id}` });
};

const formatDate = (date: string) => date ? date.split("T")[0] : "";
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.detail-card { background: #fff; border-radius: 16rpx; padding: 30rpx; }
.match-info { margin-bottom: 20rpx; padding-bottom: 20rpx; border-bottom: 1rpx solid #f0f0f0; }
.match-teams { font-size: 28rpx; color: #333; font-weight: bold; display: block; }
.match-date { font-size: 24rpx; color: #999; margin-top: 8rpx; display: block; }
.title { font-size: 36rpx; font-weight: bold; color: #333; display: block; margin-bottom: 16rpx; }
.meta { display: flex; gap: 20rpx; margin-bottom: 20rpx; }
.type { font-size: 24rpx; background: #e3f2fd; color: #1565c0; padding: 6rpx 16rpx; border-radius: 6rpx; }
.time { font-size: 24rpx; color: #666; line-height: 48rpx; }
.description { font-size: 28rpx; color: #444; line-height: 1.6; margin-bottom: 24rpx; padding: 20rpx; background: #f8f9fa; border-radius: 8rpx; }
.video-link { display: flex; align-items: center; background: #1a73e8; padding: 24rpx; border-radius: 12rpx; margin-bottom: 20rpx; }
.video-icon { font-size: 36rpx; margin-right: 12rpx; }
.video-text { color: #fff; font-size: 28rpx; font-weight: bold; }
.action-bar { padding-top: 20rpx; border-top: 1rpx solid #f0f0f0; }
.action-btn { text-align: center; padding: 20rpx; background: #f5f5f5; border-radius: 8rpx; font-size: 26rpx; color: #1a73e8; }
</style>
