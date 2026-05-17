<template>
  <view class="container">
    <!-- 顶部赛事横幅 -->
    <view class="banner">
      <text class="banner-title">2026 FIFA World Cup</text>
      <text class="banner-subtitle">美国·加拿大·墨西哥</text>
    </view>

    <!-- 实时对阵看板 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">实时对阵</text>
        <text class="section-more" @tap="goToMatches">全部赛程 ></text>
      </view>
      <scroll-view scroll-x class="match-scroll">
        <view class="match-card" v-for="match in liveMatches" :key="match.id" @tap="goToLive(match.id)">
          <view class="match-status" :class="statusClass(match.status)">{{ match.status }}</view>
          <view class="match-teams">
            <view class="team">
              <image :src="match.home_flag" class="team-flag" mode="aspectFit" />
              <text class="team-name">{{ match.home_team_name }}</text>
            </view>
            <view class="score">
              <text class="score-text">{{ match.home_score }} - {{ match.away_score }}</text>
              <text class="match-time">{{ match.match_time }}</text>
            </view>
            <view class="team">
              <image :src="match.away_flag" class="team-flag" mode="aspectFit" />
              <text class="team-name">{{ match.away_team_name }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 今日赛程 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">今日赛程</text>
      </view>
      <view class="today-list">
        <view class="today-item" v-for="match in todayMatches" :key="match.id" @tap="goToLive(match.id)">
          <text class="today-time">{{ match.match_time }}</text>
          <view class="today-teams">
            <text>{{ match.home_team_name }}</text>
            <text class="today-vs">{{ match.status === '已结束' ? `${match.home_score} - ${match.away_score}` : 'VS' }}</text>
            <text>{{ match.away_team_name }}</text>
          </view>
          <text class="today-stage">{{ match.stage }}</text>
        </view>
        <view v-if="todayMatches.length === 0" class="empty-tip">
          <text>今日暂无赛事</text>
        </view>
      </view>
    </view>

    <!-- 积分榜入口 + 射手榜 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">射手榜</text>
      </view>
      <view class="scorer-list" v-if="topScorers.length > 0">
        <view class="scorer-item" v-for="(player, index) in topScorers" :key="player.id" @tap="goToPlayer(player.id)">
          <text class="scorer-rank">{{ index + 1 }}</text>
          <text class="scorer-name">{{ player.name }}</text>
          <image :src="player.flag_url" class="scorer-flag" mode="aspectFit" />
          <text class="scorer-goals">{{ player.goals }} 球</text>
        </view>
      </view>
      <view v-else class="empty-tip">
        <text>赛事未开始，暂无进球数据</text>
      </view>
    </view>

    <!-- 快捷入口 -->
    <view class="quick-entry">
      <view class="entry-item" @tap="navigateTo('/pages/teams/index')">
        <text class="entry-icon">🏟️</text>
        <text class="entry-text">参赛球队</text>
      </view>
      <view class="entry-item" @tap="navigateTo('/pages/rank/index')">
        <text class="entry-icon">🏆</text>
        <text class="entry-text">排行榜</text>
      </view>
      <view class="entry-item" @tap="navigateTo('/pages/standings/index')">
        <text class="entry-icon">📊</text>
        <text class="entry-text">积分榜</text>
      </view>
      <view class="entry-item" @tap="navigateTo('/pages/champion/index')">
        <text class="entry-icon">👑</text>
        <text class="entry-text">冠军预测</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/api";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const liveMatches = ref<any[]>([]);
const todayMatches = ref<any[]>([]);
const topScorers = ref<any[]>([]);

onMounted(() => {
  userStore.init();
  fetchMatches();
  fetchTodayMatches();
  fetchTopScorers();
});

const fetchMatches = async () => {
  const res = await api.get("/api/matches");
  if (res.code === 200) {
    // 优先显示进行中，然后未开始，然后已结束
    const all = res.data || [];
    const live = all.filter((m: any) => m.status === "进行中");
    const upcoming = all.filter((m: any) => m.status === "未开始").slice(0, 3);
    const finished = all.filter((m: any) => m.status === "已结束").slice(-2);
    liveMatches.value = [...live, ...upcoming, ...finished].slice(0, 5);
  }
};

const fetchTodayMatches = async () => {
  const res = await api.get("/api/matches/today");
  if (res.code === 200) {
    todayMatches.value = res.data || [];
  }
};

const fetchTopScorers = async () => {
  const res = await api.get("/api/players/top-scorers?limit=5");
  if (res.code === 200) {
    topScorers.value = res.data || [];
  }
};

const statusClass = (status: string) => {
  if (status === "进行中") return "status-live";
  if (status === "已结束") return "status-end";
  return "status-upcoming";
};

const goToLive = (matchId: number) => {
  uni.navigateTo({ url: `/pages/match-live/index?id=${matchId}` });
};

const goToMatches = () => {
  uni.navigateTo({ url: "/pages/teams/index" });
};

const goToPlayer = (playerId: number) => {
  uni.navigateTo({ url: `/pages/player-detail/index?id=${playerId}` });
};

const navigateTo = (url: string) => {
  if (url.includes("guess") || url.includes("highlights")) {
    uni.switchTab({ url });
  } else {
    uni.navigateTo({ url });
  }
};
</script>

<style scoped>
.container {
  padding-bottom: 30rpx;
}
.banner {
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  padding: 60rpx 30rpx;
  text-align: center;
  color: #fff;
}
.banner-title {
  font-size: 44rpx;
  font-weight: bold;
  display: block;
}
.banner-subtitle {
  font-size: 26rpx;
  opacity: 0.8;
  margin-top: 10rpx;
  display: block;
}
.section {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}
.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}
.section-more {
  font-size: 24rpx;
  color: #1a73e8;
}
.match-scroll {
  white-space: nowrap;
}
.match-card {
  display: inline-block;
  width: 500rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-right: 20rpx;
  vertical-align: top;
}
.match-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  display: inline-block;
  margin-bottom: 12rpx;
}
.status-live {
  background: #e8f5e9;
  color: #2e7d32;
}
.status-end {
  background: #e3f2fd;
  color: #1565c0;
}
.status-upcoming {
  background: #f5f5f5;
  color: #666;
}
.match-teams {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.team {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 150rpx;
}
.team-flag {
  width: 60rpx;
  height: 40rpx;
  margin-bottom: 8rpx;
}
.team-name {
  font-size: 24rpx;
  color: #333;
  text-align: center;
}
.score {
  text-align: center;
}
.score-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #333;
  display: block;
}
.match-time {
  font-size: 22rpx;
  color: #999;
}
.today-list {
  /* nothing */
}
.today-item {
  display: flex;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.today-time {
  font-size: 26rpx;
  color: #1a73e8;
  width: 100rpx;
  font-weight: bold;
}
.today-teams {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #333;
}
.today-vs {
  margin: 0 16rpx;
  color: #999;
  font-weight: bold;
}
.today-stage {
  font-size: 22rpx;
  color: #999;
  width: 120rpx;
  text-align: right;
}
.empty-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 26rpx;
}
.scorer-list {
  /* nothing */
}
.scorer-item {
  display: flex;
  align-items: center;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.scorer-rank {
  width: 50rpx;
  font-size: 28rpx;
  font-weight: bold;
  color: #1a73e8;
}
.scorer-name {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}
.scorer-flag {
  width: 40rpx;
  height: 28rpx;
  margin-right: 16rpx;
}
.scorer-goals {
  font-size: 26rpx;
  color: #e65100;
  font-weight: bold;
}
.quick-entry {
  display: flex;
  justify-content: space-around;
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx 0;
}
.entry-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.entry-icon {
  font-size: 48rpx;
  margin-bottom: 8rpx;
}
.entry-text {
  font-size: 24rpx;
  color: #666;
}
</style>
