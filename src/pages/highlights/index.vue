<template>
  <view class="container">
    <!-- 分类筛选 -->
    <view class="filter-bar">
      <view class="filter-item" :class="{ active: currentType === '' }" @tap="filterType('')">全部</view>
      <view class="filter-item" :class="{ active: currentType === '进球' }" @tap="filterType('进球')">进球</view>
      <view class="filter-item" :class="{ active: currentType === '扑救' }" @tap="filterType('扑救')">扑救</view>
      <view class="filter-item" :class="{ active: currentType === '红牌' }" @tap="filterType('红牌')">红牌</view>
      <view class="filter-item" :class="{ active: currentType === '点球' }" @tap="filterType('点球')">点球</view>
    </view>

    <!-- 回放列表 -->
    <view class="list">
      <view class="highlight-card" v-for="item in highlights" :key="item.id" @tap="goDetail(item.id)">
        <view class="card-header">
          <view class="card-type" :class="typeClass(item.type)">
            <text class="type-icon">{{ getTypeIcon(item.type) }}</text>
            <text class="type-label">{{ item.type }}</text>
          </view>
          <text class="card-time">{{ item.occur_time }}</text>
        </view>
        <text class="card-title">{{ item.title }}</text>
        <view class="card-match">
          <text>{{ item.home_team_name }} vs {{ item.away_team_name }}</text>
          <text class="card-date">{{ formatDate(item.match_date) }}</text>
        </view>
      </view>
      <view v-if="highlights.length === 0 && !loading" class="empty">
        <text>暂无精彩回放</text>
      </view>
      <view v-if="loading" class="load-tip">
        <text>加载中...</text>
      </view>
      <view v-if="!hasMore && highlights.length > 0" class="load-tip">
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
onShareAppMessage(() => ({ title: "2026世界杯精彩回放", path: "/pages/highlights/index", imageUrl: "/static/logo.png" }));
onShareTimeline(() => ({ title: "2026世界杯精彩回放", imageUrl: "/static/logo.png" }));
// #endif

const highlights = ref<any[]>([]);
const currentType = ref("");
const page = ref(1);
const hasMore = ref(true);
const loading = ref(false);

onMounted(() => {
  fetchHighlights();
});

const fetchHighlights = async (loadMore = false) => {
  if (loading.value) return;
  if (loadMore && !hasMore.value) return;
  loading.value = true;

  const curPage = loadMore ? page.value + 1 : 1;
  let params = `?page=${curPage}&pageSize=10`;
  if (currentType.value) params += `&type=${currentType.value}`;

  const res = await api.get(`/api/highlights${params}`);
  if (res.code === 200) {
    const data = res.data;
    if (loadMore) {
      highlights.value = [...highlights.value, ...data.list];
    } else {
      highlights.value = data.list || [];
    }
    page.value = curPage;
    hasMore.value = data.hasMore;
  }
  loading.value = false;
};

onReachBottom(() => {
  fetchHighlights(true);
});

const filterType = (type: string) => {
  currentType.value = type;
  page.value = 1;
  hasMore.value = true;
  fetchHighlights();
};

const goDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/highlight-detail/index?id=${id}` });
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = { "进球": "⚽", "扑救": "🧤", "红牌": "🟥", "点球": "🎯" };
  return icons[type] || "🏟️";
};

const typeClass = (type: string) => {
  const map: Record<string, string> = { "进球": "type-goal", "扑救": "type-save", "红牌": "type-red", "点球": "type-penalty" };
  return map[type] || "type-default";
};

const formatDate = (date: string) => {
  if (!date) return "";
  return date.split("T")[0];
};
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; }
.filter-bar { display: flex; background: #fff; padding: 20rpx; gap: 16rpx; position: sticky; top: 0; z-index: 10; }
.filter-item { padding: 12rpx 24rpx; border-radius: 30rpx; font-size: 26rpx; background: #f0f0f0; color: #666; }
.filter-item.active { background: #1a73e8; color: #fff; }
.list { padding: 20rpx; }
.highlight-card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10rpx; }
.card-type { display: flex; align-items: center; gap: 10rpx; padding: 6rpx 18rpx; border-radius: 20rpx; background: #e8f0fe; }
.type-icon { font-size: 30rpx; line-height: 1; }
.type-label { font-size: 24rpx; color: #1a73e8; font-weight: bold; }
.type-goal { background: #e8f5e9; } .type-goal .type-label { color: #2e7d32; }
.type-save { background: #e3f2fd; } .type-save .type-label { color: #1565c0; }
.type-red  { background: #ffebee; } .type-red  .type-label { color: #c62828; }
.type-penalty { background: #fff8e1; } .type-penalty .type-label { color: #f57f17; }
.type-default { background: #f3e5f5; } .type-default .type-label { color: #7b1fa2; }
.card-time { font-size: 22rpx; color: #999; }
.card-title { font-size: 30rpx; color: #333; font-weight: bold; display: block; margin-bottom: 10rpx; }
.card-match { display: flex; justify-content: space-between; font-size: 24rpx; color: #666; }
.card-date { color: #999; }
.empty { text-align: center; padding: 100rpx; color: #999; font-size: 28rpx; }
.load-tip { text-align: center; padding: 30rpx; color: #bbb; font-size: 24rpx; }
</style>
