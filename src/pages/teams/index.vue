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
.team-grid { display: flex; flex-wrap: wrap; gap: 16rpx; }
.team-card { width: calc(33.33% - 11rpx); background: #fff; border-radius: 12rpx; padding: 24rpx 10rpx; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
.team-flag { width: 80rpx; height: 54rpx; margin-bottom: 12rpx; }
.team-name { font-size: 26rpx; color: #333; text-align: center; font-weight: 500; }
</style>
