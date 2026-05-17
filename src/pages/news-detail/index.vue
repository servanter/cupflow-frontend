<template>
  <view class="container">
    <view class="detail-card" v-if="detail.id">
      <!-- 封面图 -->
      <image
        v-if="detail.cover_url"
        :src="detail.cover_url"
        class="cover-image"
        mode="aspectFill"
      />

      <!-- 标签 + 日期 -->
      <view class="meta">
        <text class="detail-tag" :class="'tag-' + tagIndex(detail.tag)">{{ detail.tag }}</text>
        <text class="detail-date">{{ formatDate(detail.created_at) }}</text>
      </view>

      <!-- 标题 -->
      <text class="detail-title">{{ detail.title }}</text>

      <!-- 摘要 -->
      <view class="summary-box" v-if="detail.summary">
        <text class="summary-text">{{ detail.summary }}</text>
      </view>

      <!-- 正文 -->
      <view class="content-box" v-if="detail.content">
        <text class="content-text">{{ detail.content }}</text>
      </view>

      <!-- 视频链接 -->
      <view class="video-link" v-if="detail.video_url" @tap="openVideo">
        <text class="video-play">▶️</text>
        <text class="video-label">观看视频</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/api";

const detail = ref<any>({});
const newsId = ref(0);
const tags = ["经典回顾", "球星故事", "历届盘点", "转会动态", "战术解析"];

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  newsId.value = Number(currentPage.$page?.options?.id || currentPage.options?.id || 0);
  if (newsId.value) fetchDetail();
});

const fetchDetail = async () => {
  const res = await api.get(`/api/news/${newsId.value}`);
  if (res.code === 200) detail.value = res.data;
};

const tagIndex = (tag: string) => {
  const idx = tags.indexOf(tag);
  return idx >= 0 ? idx : 0;
};

const formatDate = (date: string) => {
  if (!date) return "";
  return date.split("T")[0];
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
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}
.detail-card {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.cover-image {
  width: 100%;
  height: 360rpx;
}
.meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 24rpx 24rpx 0;
}
.detail-tag {
  font-size: 22rpx;
  padding: 6rpx 16rpx;
  border-radius: 20rpx;
  font-weight: 500;
}
.tag-0 { background: #ffebee; color: #c62828; }
.tag-1 { background: #e3f2fd; color: #1565c0; }
.tag-2 { background: #e8f5e9; color: #2e7d32; }
.tag-3 { background: #fff8e1; color: #f57f17; }
.tag-4 { background: #f3e5f5; color: #7b1fa2; }
.detail-date {
  font-size: 22rpx;
  color: #999;
}
.detail-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  padding: 20rpx 24rpx;
  line-height: 1.5;
}
.summary-box {
  margin: 0 24rpx 20rpx;
  padding: 20rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  border-left: 6rpx solid #1a73e8;
}
.summary-text {
  font-size: 26rpx;
  color: #666;
  line-height: 1.6;
}
.content-box {
  padding: 0 24rpx 24rpx;
}
.content-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.8;
}
.video-link {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 24rpx 24rpx;
  padding: 24rpx;
  background: #1a73e8;
  border-radius: 12rpx;
}
.video-play {
  font-size: 32rpx;
  margin-right: 12rpx;
}
.video-label {
  font-size: 28rpx;
  color: #fff;
  font-weight: bold;
}
</style>
