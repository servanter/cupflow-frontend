<template>
  <view class="container">
    <view class="page-title">竞猜积分排行榜</view>

    <view class="rank-list">
      <view class="rank-header">
        <text class="col-rank">排名</text>
        <text class="col-name">昵称</text>
        <text class="col-correct">猜对</text>
        <text class="col-points">积分</text>
      </view>
      <view class="rank-item" v-for="(user, index) in rankings" :key="user.id" :class="{ top3: index < 3 }">
        <text class="col-rank rank-num">
          {{ index < 3 ? ['🥇','🥈','🥉'][index] : index + 1 }}
        </text>
        <text class="col-name">{{ user.nickname }}</text>
        <text class="col-correct">{{ user.correct_count }}场</text>
        <text class="col-points points-value">{{ user.points }}</text>
      </view>
      <view v-if="rankings.length === 0" class="empty">
        <text>暂无排名数据</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/api";

const rankings = ref<any[]>([]);

onMounted(() => {
  fetchRank();
});

const fetchRank = async () => {
  const res = await api.get("/api/rank?limit=20");
  if (res.code === 200) rankings.value = res.data || [];
};
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.page-title { font-size: 36rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }
.rank-list { background: #fff; border-radius: 12rpx; padding: 20rpx; }
.rank-header { display: flex; padding: 16rpx 0; border-bottom: 2rpx solid #f0f0f0; }
.rank-header text { font-size: 24rpx; color: #999; font-weight: bold; }
.rank-item { display: flex; align-items: center; padding: 20rpx 0; border-bottom: 1rpx solid #f8f8f8; }
.rank-item.top3 { background: #fffde7; }
.col-rank { width: 80rpx; text-align: center; }
.col-name { flex: 1; font-size: 28rpx; color: #333; }
.col-correct { width: 100rpx; font-size: 24rpx; color: #666; text-align: center; }
.col-points { width: 100rpx; text-align: right; }
.rank-num { font-size: 28rpx; }
.points-value { font-size: 30rpx; font-weight: bold; color: #e65100; }
.empty { text-align: center; padding: 60rpx; color: #999; font-size: 26rpx; }
</style>
