<template>
  <view class="container">
    <view class="player-card">
      <image :src="player.photo_url" class="player-photo" mode="aspectFill" />
      <view class="player-info">
        <text class="player-name">{{ player.name }}</text>
        <view class="info-row">
          <image :src="player.team_flag" class="mini-flag" mode="aspectFit" />
          <text class="info-text" @tap="goTeam">{{ player.team_name }}</text>
        </view>
        <text class="info-label">位置: {{ player.position }}</text>
        <text class="info-label">身高: {{ player.height }}</text>
        <text class="info-label">出生: {{ formatDate(player.birth_date) }}</text>
        <text class="info-label">俱乐部: {{ player.club }}</text>
      </view>
    </view>

    <view class="stats-card">
      <text class="stats-title">本届世界杯数据</text>
      <view class="stats-row">
        <view class="stat-item">
          <text class="stat-value">{{ player.goals || 0 }}</text>
          <text class="stat-label">进球</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ player.assists || 0 }}</text>
          <text class="stat-label">助攻</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/api";

const player = ref<any>({});

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  const id = currentPage.$page?.options?.id || currentPage.options?.id;
  fetchPlayer(id);
});

const fetchPlayer = async (id: string) => {
  const res = await api.get(`/api/players/${id}`);
  if (res.code === 200) player.value = res.data;
};

const goTeam = () => {
  if (player.value.team_id) {
    uni.navigateTo({ url: `/pages/team-detail/index?id=${player.value.team_id}` });
  }
};

const formatDate = (d: string) => d ? d.split("T")[0] : "";
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.player-card { background: #fff; border-radius: 16rpx; padding: 30rpx; display: flex; gap: 24rpx; margin-bottom: 20rpx; }
.player-photo { width: 180rpx; height: 220rpx; border-radius: 12rpx; background: #f0f0f0; }
.player-info { flex: 1; }
.player-name { font-size: 36rpx; font-weight: bold; color: #333; display: block; margin-bottom: 12rpx; }
.info-row { display: flex; align-items: center; gap: 8rpx; margin-bottom: 8rpx; }
.mini-flag { width: 36rpx; height: 24rpx; }
.info-text { font-size: 26rpx; color: #1a73e8; }
.info-label { font-size: 24rpx; color: #666; display: block; margin-top: 6rpx; }
.stats-card { background: #fff; border-radius: 16rpx; padding: 30rpx; }
.stats-title { font-size: 30rpx; font-weight: bold; color: #333; display: block; margin-bottom: 20rpx; }
.stats-row { display: flex; justify-content: space-around; }
.stat-item { text-align: center; }
.stat-value { font-size: 48rpx; font-weight: bold; color: #1a73e8; display: block; }
.stat-label { font-size: 24rpx; color: #666; }
</style>
