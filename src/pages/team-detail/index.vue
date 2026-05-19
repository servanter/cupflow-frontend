<template>
  <view class="container">
    <view class="team-header">
      <image :src="team.flag_url" class="team-flag" mode="aspectFit" />
      <view class="team-info">
        <text class="team-name">{{ team.name }}</text>
        <text class="team-meta">{{ team.continent }} | 参赛{{ team.world_cup_appearances }}次</text>
        <text class="team-meta">最佳成绩: {{ team.best_result }}</text>
        <text class="team-meta">主教练: {{ team.coach }}</text>
      </view>
      <view class="follow-btn" :class="{ followed: isFollowed }" @tap="toggleFollow">
        <text>{{ isFollowed ? '已关注' : '+ 关注' }}</text>
      </view>
    </view>

    <!-- 球员阵容 -->
    <view class="section">
      <text class="section-title">参赛阵容</text>
      <view class="player-group" v-for="pos in positions" :key="pos">
        <text class="pos-title">{{ pos }}</text>
        <view class="player-list">
          <view class="player-item" v-for="p in getPlayersByPosition(pos)" :key="p.id" @tap="goPlayer(p.id)">
            <text class="player-name">{{ p.name }}</text>
            <text class="player-stats" v-if="p.goals > 0 || p.assists > 0">
              {{ p.goals > 0 ? `${p.goals}球` : '' }} {{ p.assists > 0 ? `${p.assists}助` : '' }}
            </text>
          </view>
          <view class="player-item" v-if="getPlayersByPosition(pos).length === 0">
            <text class="player-name placeholder">未公布</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 赛程 -->
    <view class="section">
      <text class="section-title">赛程</text>
      <view class="match-item" v-for="m in team.matches" :key="m.id" @tap="goLive(m.id)">
        <text class="m-date">{{ formatDate(m.match_date) }}</text>
        <text class="m-info">{{ m.home_team_name }} {{ m.home_score }}-{{ m.away_score }} {{ m.away_team_name }}</text>
        <text class="m-status" :class="m.status === '进行中' ? 'live' : ''">{{ m.status }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/api";
import { useUserStore } from "@/store/user";
// #ifdef MP-WEIXIN
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
onShareAppMessage(() => ({
  title: team.value.name ? `${team.value.name} - 2026世界杯` : "CupFlow - 球队详情",
  path: `/pages/team-detail/index?id=${teamId.value}`,
  imageUrl: "/static/logo.png",
}));
onShareTimeline(() => ({
  title: team.value.name ? `${team.value.name} - 2026世界杯` : "CupFlow - 球队详情",
  imageUrl: "/static/logo.png",
}));
// #endif

const userStore = useUserStore();
const team = ref<any>({ players: [], matches: [] });
const positions = ["门将", "后卫", "中场", "前锋"];
const isFollowed = ref(false);
const teamId = ref("");

onMounted(() => {
  userStore.init();
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  teamId.value = currentPage.$page?.options?.id || currentPage.options?.id;
  fetchTeam(teamId.value);
  checkFollowStatus();
});

const fetchTeam = async (id: string) => {
  const res = await api.get(`/api/teams/${id}`);
  if (res.code === 200) team.value = res.data;
};

const checkFollowStatus = async () => {
  if (!userStore.isLoggedIn) return;
  const res = await api.get("/api/user/follows", true);
  if (res.code === 200) {
    const follows = res.data || [];
    isFollowed.value = follows.some((f: any) => f.team_id === Number(teamId.value));
  }
};

const toggleFollow = async () => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  if (isFollowed.value) {
    const res = await api.delete(`/api/user/follows?teamId=${teamId.value}`, true);
    if (res.code === 200) {
      isFollowed.value = false;
      uni.showToast({ title: "已取消关注", icon: "success" });
    }
  } else {
    const res = await api.post("/api/user/follows", { teamId: Number(teamId.value) }, true);
    if (res.code === 200) {
      isFollowed.value = true;
      uni.showToast({ title: "关注成功", icon: "success" });
    } else {
      uni.showToast({ title: res.message || "操作失败", icon: "none" });
    }
  }
};

const getPlayersByPosition = (pos: string) => {
  return (team.value.players || []).filter((p: any) => p.position === pos);
};

const goPlayer = (id: number) => {
  uni.navigateTo({ url: `/pages/player-detail/index?id=${id}` });
};

const goLive = (id: number) => {
  uni.navigateTo({ url: `/pages/match-live/index?id=${id}` });
};

const formatDate = (d: string) => d ? d.split("T")[0] : "";
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; }
.team-header { background: #fff; padding: 30rpx; display: flex; align-items: center; gap: 24rpx; }
.team-flag { width: 120rpx; height: 80rpx; }
.team-info { flex: 1; }
.team-name { font-size: 36rpx; font-weight: bold; color: #333; display: block; }
.follow-btn { padding: 12rpx 24rpx; border-radius: 30rpx; background: #1a73e8; }
.follow-btn text { font-size: 24rpx; color: #fff; }
.follow-btn.followed { background: #f0f0f0; }
.follow-btn.followed text { color: #999; }
.team-meta { font-size: 24rpx; color: #666; display: block; margin-top: 6rpx; }
.section { margin: 20rpx; background: #fff; border-radius: 12rpx; padding: 24rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; display: block; margin-bottom: 16rpx; }
.pos-title { font-size: 26rpx; color: #1a73e8; font-weight: bold; margin: 12rpx 0 8rpx; display: block; }
.player-list { /* nothing */ }
.player-item { display: flex; justify-content: space-between; padding: 12rpx 16rpx; border-bottom: 1rpx solid #f5f5f5; }
.player-name { font-size: 26rpx; color: #333; }
.player-name.placeholder { color: #999; font-style: italic; }
.player-stats { font-size: 24rpx; color: #e65100; }
.match-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.m-date { font-size: 24rpx; color: #999; width: 150rpx; }
.m-info { flex: 1; font-size: 26rpx; color: #333; }
.m-status { font-size: 22rpx; color: #666; }
.m-status.live { color: #4caf50; font-weight: bold; }
</style>
