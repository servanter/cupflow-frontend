<template>
  <view class="container">
    <view class="page-title">冠军预测投票</view>
    <view class="tip">投出你心中的冠军球队</view>

    <view class="team-list">
      <view class="team-item" v-for="(item, index) in predictions" :key="item.team_id" @tap="vote(item.team_id)">
        <view class="rank-badge" :class="{ gold: index === 0, silver: index === 1, bronze: index === 2 }">
          {{ index + 1 }}
        </view>
        <image :src="item.flag_url" class="team-flag" mode="aspectFit" />
        <text class="team-name">{{ item.name }}</text>
        <view class="vote-info">
          <view class="vote-bar-bg">
            <view class="vote-bar-fill" :style="{ width: getPercent(item.votes) + '%' }"></view>
          </view>
          <text class="vote-count">{{ item.votes }}票</text>
        </view>
      </view>
    </view>

    <view v-if="predictions.length === 0" class="empty">
      <text>暂无投票数据</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "@/api";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const predictions = ref<any[]>([]);

onMounted(() => {
  userStore.init();
  fetchPredictions();
});

const fetchPredictions = async () => {
  const res = await api.get("/api/vote/champion");
  if (res.code === 200) predictions.value = res.data || [];
};

const totalVotes = computed(() => {
  return predictions.value.reduce((sum: number, p: any) => sum + p.votes, 0);
});

const getPercent = (votes: number) => {
  if (totalVotes.value === 0) return 0;
  return Math.round((votes / totalVotes.value) * 100);
};

const vote = async (teamId: number) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  const res = await api.post("/api/vote/champion", { teamId }, true);
  if (res.code === 200) {
    uni.showToast({ title: "投票成功！", icon: "success" });
    fetchPredictions();
  } else {
    uni.showToast({ title: res.message || "投票失败", icon: "none" });
  }
};
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.page-title { font-size: 36rpx; font-weight: bold; color: #333; }
.tip { font-size: 24rpx; color: #999; margin-bottom: 24rpx; }
.team-list { /* nothing */ }
.team-item { display: flex; align-items: center; background: #fff; border-radius: 12rpx; padding: 20rpx; margin-bottom: 12rpx; gap: 16rpx; }
.rank-badge { width: 44rpx; height: 44rpx; border-radius: 50%; background: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 24rpx; font-weight: bold; color: #666; line-height: 44rpx; text-align: center; }
.rank-badge.gold { background: #fff3e0; color: #e65100; }
.rank-badge.silver { background: #f5f5f5; color: #616161; }
.rank-badge.bronze { background: #fbe9e7; color: #bf360c; }
.team-flag { width: 48rpx; height: 32rpx; flex-shrink: 0; }
.team-name { font-size: 28rpx; color: #333; font-weight: 500; width: 160rpx; }
.vote-info { flex: 1; display: flex; align-items: center; gap: 12rpx; }
.vote-bar-bg { flex: 1; height: 16rpx; background: #f0f0f0; border-radius: 8rpx; overflow: hidden; }
.vote-bar-fill { height: 100%; background: linear-gradient(90deg, #1a73e8, #4fc3f7); border-radius: 8rpx; min-width: 4rpx; transition: width 0.3s; }
.vote-count { font-size: 22rpx; color: #999; width: 80rpx; text-align: right; }
.empty { text-align: center; padding: 100rpx; color: #999; font-size: 28rpx; }
</style>
