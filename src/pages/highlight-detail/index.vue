<template>
  <view class="container">

    <!-- ===== 小程序端：图文混排（无视频） ===== -->
    <!-- #ifdef MP-WEIXIN -->

    <!-- 顶部封面：两队国旗 + 比分 -->
    <view class="cover-card">
      <view class="cover-teams">
        <view class="cover-team">
          <image class="cover-flag" :src="detail.home_flag_url" mode="aspectFit" />
          <text class="cover-team-name">{{ detail.home_team_name }}</text>
        </view>
        <view class="cover-score">
          <text class="score-text">{{ detail.home_score ?? '-' }} : {{ detail.away_score ?? '-' }}</text>
          <text class="score-date">{{ formatDate(detail.match_date) }}</text>
        </view>
        <view class="cover-team">
          <image class="cover-flag" :src="detail.away_flag_url" mode="aspectFit" />
          <text class="cover-team-name">{{ detail.away_team_name }}</text>
        </view>
      </view>
    </view>

    <!-- 事件标签 + 时间 -->
    <view class="event-bar">
      <view class="event-type-badge" :class="typeClass">
        <text class="event-icon">{{ typeIcon }}</text>
        <text class="event-type-text">{{ detail.type }}</text>
      </view>
      <text class="event-time">⏱ {{ detail.occur_time }}</text>
    </view>

    <!-- 标题 -->
    <view class="title-card">
      <text class="title-text">{{ detail.title }}</text>
    </view>

    <!-- 正文描述（图文混排） -->
    <view class="desc-card" v-if="detail.description">
      <view class="desc-header">
        <text class="desc-header-text">📝 赛事描述</text>
      </view>
      <view class="desc-body">
        <block v-for="(seg, index) in descSegments" :key="index">
          <image
            v-if="seg.type === 'image'"
            :src="seg.content"
            class="desc-img"
            mode="widthFix"
            show-menu-by-longpress
          />
          <text v-else class="desc-para">{{ seg.content }}</text>
        </block>
      </view>
    </view>

    <!-- 跳转文字直播 -->
    <view class="action-card" @tap="goLive">
      <text>📡 查看本场文字直播</text>
    </view>

    <!-- #endif -->

    <!-- ===== H5 端：原样保留视频 ===== -->
    <!-- #ifndef MP-WEIXIN -->

    <!-- 视频区域 -->
    <view class="video-section" v-if="detail.video_url">
      <iframe
        :src="embedUrl"
        class="video-player"
        frameborder="0"
        scrolling="no"
        allowfullscreen="true"
      />
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

    <!-- #endif -->

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

// 事件类型 → 图标
const typeIconMap: Record<string, string> = {
  进球: "⚽",
  扑救: "🧤",
  红牌: "🟥",
  黄牌: "🟨",
  点球: "🎯",
  助攻: "🅰️",
  换人: "🔄",
};
const typeColorMap: Record<string, string> = {
  进球: "type-goal",
  扑救: "type-save",
  红牌: "type-red",
  黄牌: "type-yellow",
  点球: "type-penalty",
  助攻: "type-assist",
  换人: "type-sub",
};

const typeIcon = computed(() => typeIconMap[detail.value.type] || "🏅");
const typeClass = computed(() => typeColorMap[detail.value.type] || "type-default");

// 描述解析：支持 [img]url[/img] 图文混排
const descSegments = computed(() => {
  const raw = detail.value.description || "";
  const parts: { type: "text" | "image"; content: string }[] = [];
  const regex = /\[img\]([\s\S]*?)\[\/img\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(raw)) !== null) {
    // 图片前的文字段落
    if (match.index > lastIndex) {
      const textBlock = raw.slice(lastIndex, match.index);
      textBlock.split(/\n+/).filter((p) => p.trim()).forEach((p) => {
        parts.push({ type: "text", content: p.trim() });
      });
    }
    // 图片
    parts.push({ type: "image", content: match[1].trim() });
    lastIndex = regex.lastIndex;
  }
  // 末尾剩余文字
  if (lastIndex < raw.length) {
    const tail = raw.slice(lastIndex);
    tail.split(/\n+/).filter((p) => p.trim()).forEach((p) => {
      parts.push({ type: "text", content: p.trim() });
    });
  }
  return parts;
});

// H5 embed URL（B站转嵌入地址）
const embedUrl = computed(() => {
  const url = detail.value.video_url;
  if (!url) return "";
  const bvMatch = url.match(/bilibili\.com\/video\/(BV[\w]+)/);
  if (bvMatch) return `https://player.bilibili.com/player.html?bvid=${bvMatch[1]}&high_quality=1&autoplay=1`;
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

const goLive = () => {
  uni.navigateTo({ url: `/pages/match-live/index?id=${detail.value.match_id}` });
};

const formatDate = (date: string) => (date ? date.split("T")[0] : "");
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f0f2f5;
}

/* ========== 小程序端样式 ========== */

/* 封面卡 */
.cover-card {
  background: linear-gradient(135deg, #1a3a6b 0%, #1a73e8 100%);
  padding: 40rpx 30rpx 50rpx;
}
.cover-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.cover-team {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}
.cover-flag {
  width: 100rpx;
  height: 70rpx;
  border-radius: 8rpx;
}
.cover-team-name {
  font-size: 24rpx;
  color: rgba(255,255,255,0.9);
  text-align: center;
  line-height: 1.3;
}
.cover-score {
  flex: 0 0 180rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
}
.score-text {
  font-size: 56rpx;
  font-weight: bold;
  color: #fff;
  letter-spacing: 4rpx;
}
.score-date {
  font-size: 22rpx;
  color: rgba(255,255,255,0.7);
}

/* 事件标签栏 */
.event-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 30rpx;
  background: #fff;
  margin-bottom: 2rpx;
}
.event-type-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
}
.event-icon { font-size: 30rpx; }
.event-type-text { font-weight: bold; }
.type-goal   { background: #e8f5e9; color: #2e7d32; }
.type-save   { background: #e3f2fd; color: #1565c0; }
.type-red    { background: #ffebee; color: #c62828; }
.type-yellow { background: #fff8e1; color: #f57f17; }
.type-penalty{ background: #fff3e0; color: #e65100; }
.type-assist { background: #f3e5f5; color: #6a1b9a; }
.type-sub    { background: #e0f7fa; color: #00695c; }
.type-default{ background: #f5f5f5; color: #555; }
.event-time {
  font-size: 26rpx;
  color: #888;
  margin-left: auto;
}

/* 标题卡 */
.title-card {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 2rpx;
}
.title-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #1a1a1a;
  line-height: 1.5;
}

/* 描述卡 */
.desc-card {
  background: #fff;
  margin-bottom: 2rpx;
  overflow: hidden;
}
.desc-header {
  padding: 24rpx 30rpx 16rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.desc-header-text {
  font-size: 26rpx;
  color: #888;
  font-weight: bold;
}
.desc-body {
  padding: 20rpx 30rpx 30rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}
.desc-para {
  font-size: 29rpx;
  color: #333;
  line-height: 1.8;
  display: block;
}
.desc-img {
  width: 100%;
  border-radius: 10rpx;
  display: block;
  margin: 10rpx 0;
}

/* 跳转文字直播 */
.action-card {
  margin: 20rpx 20rpx 0;
  background: #fff;
  border-radius: 12rpx;
  padding: 28rpx;
  text-align: center;
  font-size: 28rpx;
  color: #1a73e8;
}

/* ========== H5 端样式 ========== */
.video-section {
  width: 100%;
  background: #000;
}
.video-player {
  width: 100%;
  height: 420rpx;
  display: block;
}
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
