<template>
  <view class="container">
    <view class="detail-card" v-if="detail.id">
      <!-- 视频播放器（有视频时显示在最顶部） -->
      <view class="video-section" v-if="detail.video_url">
        <!-- H5: 使用iframe嵌入B站播放器 -->
        <!-- #ifdef H5 -->
        <iframe
          v-if="embedUrl"
          :src="embedUrl"
          class="video-player"
          scrolling="no"
          frameborder="0"
          allowfullscreen="true"
        ></iframe>
        <!-- #endif -->
        <!-- 非H5: 显示封面+跳转提示 -->
        <!-- #ifndef H5 -->
        <view class="video-fallback" @tap="openVideo">
          <image v-if="detail.cover_url" :src="detail.cover_url" class="video-poster" mode="aspectFill" />
          <view class="play-overlay">
            <view class="play-btn">
              <text class="play-icon">▶</text>
            </view>
            <text class="play-tip">点击播放视频</text>
          </view>
        </view>
        <!-- #endif -->
      </view>

      <!-- 没视频时显示封面图 -->
      <image
        v-if="!detail.video_url && detail.cover_url"
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
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/api";

const detail = ref<any>({});
const newsId = ref(0);

// #ifdef MP-WEIXIN
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
onShareAppMessage(() => ({
  title: detail.value.title || "CupFlow - 足球资讯",
  path: `/pages/news-detail/index?id=${newsId.value}`,
  imageUrl: "/static/logo.png",
}));
onShareTimeline(() => ({
  title: detail.value.title || "CupFlow - 足球资讯",
  imageUrl: "/static/logo.png",
}));
// #endif
const tags = ["经典回顾", "球星故事", "历届盘点", "转会动态", "战术解析"];

// 将B站链接转为嵌入播放器地址
const embedUrl = computed(() => {
  const url = detail.value.video_url;
  if (!url) return "";
  // B站链接: https://www.bilibili.com/video/BVxxxxxx
  const bvMatch = url.match(/bilibili\.com\/video\/(BV[\w]+)/);
  if (bvMatch) {
    return `https://player.bilibili.com/player.html?bvid=${bvMatch[1]}&high_quality=1&autoplay=0`;
  }
  // 如果已经是嵌入链接
  if (url.includes("player.bilibili.com")) {
    return url;
  }
  // 其他视频源直接返回
  return url;
});

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
    // #ifndef H5
    uni.setClipboardData({
      data: detail.value.video_url,
      success: () => uni.showToast({ title: "链接已复制，请在浏览器打开", icon: "none" }),
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

/* 视频播放器 */
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
}
.video-poster {
  width: 100%;
  height: 420rpx;
}
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
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
</style>
