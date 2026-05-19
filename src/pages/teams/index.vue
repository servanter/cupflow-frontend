<template>
  <view class="container">
    <view class="continent-group" v-for="(teamList, continent) in groupedTeams" :key="continent">
      <view class="continent-title">{{ continent }}</view>
      <view class="team-grid">
        <view class="team-card" v-for="team in teamList" :key="team.id" @tap="goDetail(team.id)">
          <image :src="team.flag_url" class="team-flag" mode="aspectFit" />
          <text class="team-name">{{ team.name }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import api from "@/api";
// #ifdef MP-WEIXIN
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
onShareAppMessage(() => ({ title: "2026世界杯参赛球队", path: "/pages/teams/index", imageUrl: "/static/logo.png" }));
onShareTimeline(() => ({ title: "2026世界杯参赛球队", imageUrl: "/static/logo.png" }));
// #endif

const teams = ref<any[]>([]);

onMounted(() => {
  fetchTeams();
});

const fetchTeams = async () => {
  const res = await api.get("/api/teams");
  if (res.code === 200) teams.value = res.data || [];
};

const groupedTeams = computed(() => {
  const grouped: Record<string, any[]> = {};
  for (const team of teams.value) {
    if (!grouped[team.continent]) grouped[team.continent] = [];
    grouped[team.continent].push(team);
  }
  return grouped;
});

const goDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/team-detail/index?id=${id}` });
};
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.continent-group { margin-bottom: 30rpx; }
.continent-title { font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 16rpx; padding-left: 10rpx; border-left: 6rpx solid #1a73e8; }
.team-grid { display: flex; flex-wrap: wrap; justify-content: space-between; }
.team-card { width: 32%; background: #fff; border-radius: 12rpx; padding: 24rpx 10rpx; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; margin-bottom: 16rpx; }
.team-flag { width: 80rpx; height: 54rpx; margin-bottom: 12rpx; }
.team-name { font-size: 26rpx; color: #333; text-align: center; font-weight: 500; }
</style>
