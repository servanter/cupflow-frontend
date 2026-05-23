<template>
  <view class="container">
    <!-- 标签筛选 -->
    <view class="filter-bar">
      <scroll-view scroll-x class="filter-scroll">
        <text
          class="filter-item"
          :class="{ active: currentTag === '' }"
          @tap="filterTag('')"
        >全部</text>
        <text
          v-for="tag in tags"
          :key="tag"
          class="filter-item"
          :class="{ active: currentTag === tag }"
          @tap="filterTag(tag)"
        >{{ tag }}</text>
      </scroll-view>
    </view>

    <!-- 资讯列表 -->
    <view class="list">
      <view class="news-card" v-for="item in newsList" :key="item.id" @tap="goDetail(item.id)">
        <view class="card-content">
          <view class="card-text">
            <text class="card-title">{{ item.title }}</text>
            <text class="card-summary">{{ item.summary }}</text>
            <view class="card-meta">
              <text class="card-tag" :class="'tag-' + tagIndex(item.tag)">{{ item.tag }}</text>
              <text class="card-date">{{ formatDate(item.created_at) }}</text>
            </view>
          </view>
          <image
            v-if="item.cover_url"
            :src="item.cover_url"
            class="card-cover"
            mode="aspectFill"
          />
        </view>
        <!-- #ifndef MP-WEIXIN -->
        <view v-if="item.video_url" class="card-video-badge">
          <text class="video-icon">▶</text>
          <text class="video-text">有视频</text>
        </view>
        <!-- #endif -->
      </view>
      <view v-if="newsList.length === 0 && !loading" class="empty">
        <text>暂无资讯</text>
      </view>
      <view v-if="loading" class="load-tip">
        <text>加载中...</text>
      </view>
      <view v-if="!hasMore && newsList.length > 0" class="load-tip">
        <text>没有更多了</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { onReachBottom } from "@dcloudio/uni-app";
import api from "@/api";
// #ifdef MP-WEIXIN
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
onShareAppMessage(() => ({ title: "CupFlow - 足球资讯", path: "/pages/news/index", imageUrl: "/static/logo.png" }));
onShareTimeline(() => ({ title: "CupFlow - 足球资讯", imageUrl: "/static/logo.png" }));
// #endif

const newsList = ref<any[]>([]);
const currentTag = ref("");
const tags = ["经典回顾", "球星故事", "历届盘点", "转会动态", "战术解析"];
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);

onMounted(() => {
  fetchNews();
});

const fetchNews = async (loadMore = false) => {
  if (loading.value) return;
  if (loadMore && !hasMore.value) return;
  loading.value = true;

  const curPage = loadMore ? page.value + 1 : 1;
  let params = `?page=${curPage}&pageSize=10`;
  if (currentTag.value) params += `&tag=${currentTag.value}`;

  const res = await api.get(`/api/news${params}`);
  if (res.code === 200) {
    const data = res.data;
    if (loadMore) {
      newsList.value = [...newsList.value, ...data.list];
    } else {
      newsList.value = data.list || [];
    }
    page.value = curPage;
    hasMore.value = data.hasMore;
  }
  loading.value = false;
};

onReachBottom(() => {
  fetchNews(true);
});

const filterTag = (tag: string) => {
  currentTag.value = tag;
  page.value = 1;
  hasMore.value = true;
  fetchNews();
};

const goDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/news-detail/index?id=${id}` });
};

const tagIndex = (tag: string) => {
  const idx = tags.indexOf(tag);
  return idx >= 0 ? idx : 0;
};

const formatDate = (date: string) => {
  if (!date) return "";
  return date.split("T")[0];
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}
.filter-bar {
  background: #fff;
  padding: 20rpx;
  position: sticky;
  top: 0;
  z-index: 10;
}
.filter-scroll {
  white-space: nowrap;
}
.filter-item {
  display: inline-block;
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  background: #f0f0f0;
  color: #666;
  margin-right: 16rpx;
}
.filter-item.active {
  background: #1a73e8;
  color: #fff;
}
.list {
  padding: 20rpx;
}
.news-card {
  background: #fff;
  border-radius: 12rpx;
  padding: 24rpx;
  margin-bottom: 16rpx;
  position: relative;
}
.card-content {
  display: flex;
  gap: 20rpx;
}
.card-text {
  flex: 1;
  min-width: 0;
}
.card-title {
  font-size: 30rpx;
  color: #333;
  font-weight: bold;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 10rpx;
}
.card-summary {
  font-size: 24rpx;
  color: #999;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 14rpx;
}
.card-cover {
  width: 200rpx;
  height: 140rpx;
  border-radius: 8rpx;
  flex-shrink: 0;
}
.card-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.card-tag {
  font-size: 20rpx;
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
  font-weight: 500;
}
.tag-0 { background: #ffebee; color: #c62828; }
.tag-1 { background: #e3f2fd; color: #1565c0; }
.tag-2 { background: #e8f5e9; color: #2e7d32; }
.tag-3 { background: #fff8e1; color: #f57f17; }
.tag-4 { background: #f3e5f5; color: #7b1fa2; }
.card-date {
  font-size: 22rpx;
  color: #bbb;
}
.card-video-badge {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  display: flex;
  align-items: center;
  background: rgba(26, 115, 232, 0.9);
  padding: 4rpx 14rpx;
  border-radius: 20rpx;
}
.video-icon {
  font-size: 18rpx;
  color: #fff;
  margin-right: 6rpx;
}
.video-text {
  font-size: 20rpx;
  color: #fff;
}
.empty {
  text-align: center;
  padding: 100rpx;
  color: #999;
  font-size: 28rpx;
}
.load-tip {
  text-align: center;
  padding: 30rpx;
  color: #bbb;
  font-size: 24rpx;
}
</style>
