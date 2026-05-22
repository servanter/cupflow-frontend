<template>
  <view class="container">
    <!-- Banner 轮播 -->
    <swiper
      v-if="banners.length > 0"
      class="banner-swiper"
      :autoplay="true"
      :interval="4000"
      :duration="500"
      :circular="true"
      indicator-dots
      indicator-color="rgba(255,255,255,0.5)"
      indicator-active-color="#ffffff"
    >
      <swiper-item v-for="item in banners" :key="item.id" @tap="onBannerTap(item)">
        <image :src="item.image_url" class="banner-img" mode="aspectFill" />
        <view v-if="item.title" class="banner-title-mask">
          <text class="banner-title-text">{{ item.title }}</text>
        </view>
      </swiper-item>
    </swiper>
    <!-- 无 banner 时的兜底静态背景 -->
    <view v-else class="banner-fallback">
      <text class="banner-fallback-title">2026 FIFA World Cup</text>
      <text class="banner-fallback-sub">美国·加拿大·墨西哥</text>
    </view>

    <!-- 最近赛程（卡片横滑样式） -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">最近赛程</text>
        <text class="section-more" @tap="goToMatches">全部赛程 〉</text>
      </view>
      <scroll-view scroll-x class="match-scroll" v-if="upcomingMatches.length > 0">
        <view class="match-card" v-for="match in upcomingMatches" :key="match.id" @tap="goToLive(match.id)">
          <view class="card-top">
            <view class="match-status" :class="statusClass(match.status)">{{ match.status }}</view>
            <text class="match-date">{{ formatMatchDate(match.match_date) }} {{ match.match_time }}</text>
          </view>
          <view class="match-teams">
            <view class="team">
              <image :src="match.home_flag" class="team-flag" mode="aspectFit" />
              <text class="team-name">{{ match.home_team_name }}</text>
            </view>
            <view class="score">
              <text class="score-text" v-if="match.status !== '未开始'">{{ match.home_score }} - {{ match.away_score }}</text>
              <text class="score-vs" v-else>VS</text>
            </view>
            <view class="team">
              <image :src="match.away_flag" class="team-flag" mode="aspectFit" />
              <text class="team-name">{{ match.away_team_name }}</text>
            </view>
          </view>
          <view class="card-bottom">
            <text class="match-stage">{{ match.stage }}</text>
          </view>
        </view>
      </scroll-view>
      <view v-else class="empty-tip">
        <text>暂无赛事安排</text>
      </view>
    </view>

    <!-- 参赛球队 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">参赛球队</text>
        <text class="section-more" @tap="goToAllTeams">全部球队 〉</text>
      </view>
      <scroll-view scroll-x class="team-scroll" v-if="hotTeams.length > 0">
        <view class="team-card" v-for="t in hotTeams" :key="t.id" @tap="goToTeamDetail(t.id)">
          <image :src="t.flag_url" class="tc-flag" mode="aspectFit" />
          <text class="tc-name">{{ t.name }}</text>
          <text class="tc-continent">{{ t.continent }}</text>
        </view>
      </scroll-view>
    </view>

    <!-- 射手榜 -->
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

    <!-- #ifndef MP-WEIXIN -->
    <!-- 快捷入口 -->
    <view class="quick-entry">
      <view class="entry-item" @tap="navigateTo('/pages/highlights/index')">
        <text class="entry-icon">🎬</text>
        <text class="entry-text">精彩回放</text>
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
    <!-- #endif -->
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
// #ifdef MP-WEIXIN
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
onShareAppMessage(() => ({
  title: "CupFlow - 2026世界杯赛事互动",
  path: "/pages/index/index",
  imageUrl: "/static/logo.png",
}));
onShareTimeline(() => ({
  title: "CupFlow - 2026世界杯赛事互动",
  imageUrl: "/static/logo.png",
}));
// #endif
import api from "@/api";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const upcomingMatches = ref<any[]>([]);
const hotTeams = ref<any[]>([]);
const topScorers = ref<any[]>([]);
const banners = ref<any[]>([]);

onMounted(() => {
  userStore.init();
  fetchBanners();
  fetchUpcomingMatches();
  fetchHotTeams();
  fetchTopScorers();
});

const fetchBanners = async () => {
  const res = await api.get("/api/banners");
  if (res.code === 200) banners.value = res.data || [];
};

const onBannerTap = (item: any) => {
  // #ifdef MP-WEIXIN
  const url = item.link_url_mp;
  if (!url) return;
  const tabPaths = ["/pages/index/index", "/pages/news/index", "/pages/highlights/index", "/pages/user/index"];
  tabPaths.includes(url) ? uni.switchTab({ url }) : uni.navigateTo({ url });
  // #endif

  // #ifdef H5
  const h5url = item.link_url_h5;
  if (!h5url) return;
  if (h5url.startsWith("http")) {
    window.open(h5url, "_blank");
  } else {
    const tabPaths = ["/pages/index/index", "/pages/news/index", "/pages/highlights/index", "/pages/user/index"];
    tabPaths.includes(h5url) ? uni.switchTab({ url: h5url }) : uni.navigateTo({ url: h5url });
  }
  // #endif
};

const fetchUpcomingMatches = async () => {
  const res = await api.get("/api/matches/today");
  if (res.code === 200 && res.data) {
    upcomingMatches.value = res.data.matches || [];
  }
};

const fetchHotTeams = async () => {
  const res = await api.get("/api/teams");
  if (res.code === 200) {
    hotTeams.value = (res.data || []).slice(0, 6);
  }
};

const fetchTopScorers = async () => {
  const res = await api.get("/api/players/top-scorers?limit=5");
  if (res.code === 200) {
    topScorers.value = res.data || [];
  }
};

const formatMatchDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
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
  uni.navigateTo({ url: "/pages/schedule/index" });
};

const goToAllTeams = () => {
  uni.navigateTo({ url: "/pages/teams/index" });
};

const goToTeamDetail = (id: number) => {
  uni.navigateTo({ url: `/pages/team-detail/index?id=${id}` });
};

const goToPlayer = (playerId: number) => {
  uni.navigateTo({ url: `/pages/player-detail/index?id=${playerId}` });
};

const navigateTo = (url: string) => {
  if (url.includes("guess") || url.includes("news") || url.includes("highlights")) {
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
/* Banner 轮播 */
.banner-swiper {
  width: 100%;
  height: 360rpx;
}
.banner-img {
  width: 100%;
  height: 360rpx;
  display: block;
}
.banner-title-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 24rpx;
  background: linear-gradient(to top, rgba(0,0,0,0.55), transparent);
}
.banner-title-text {
  color: #fff;
  font-size: 30rpx;
  font-weight: bold;
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
}
.banner-fallback {
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  height: 360rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.banner-fallback-title {
  font-size: 44rpx;
  font-weight: bold;
}
.banner-fallback-sub {
  font-size: 26rpx;
  opacity: 0.8;
  margin-top: 10rpx;
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
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.match-status {
  font-size: 22rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  display: inline-block;
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
.match-date {
  font-size: 22rpx;
  color: #999;
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
  width: 80rpx;
  height: 54rpx;
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
.score-vs {
  font-size: 32rpx;
  font-weight: bold;
  color: #bdbdbd;
}
.card-bottom {
  margin-top: 12rpx;
  text-align: center;
}
.match-stage {
  font-size: 22rpx;
  color: #999;
}
.remind-btn {
  display: flex;
  align-items: center;
  gap: 4rpx;
  background: #fff3e0;
  border-radius: 20rpx;
  padding: 4rpx 14rpx;
}
.remind-icon {
  font-size: 20rpx;
}
.remind-label {
  font-size: 20rpx;
  color: #e65100;
}
.team-scroll {
  white-space: nowrap;
}
.team-card {
  display: inline-block;
  width: 180rpx;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx 16rpx;
  margin-right: 16rpx;
  vertical-align: top;
  text-align: center;
}
.tc-flag {
  width: 80rpx;
  height: 54rpx;
  margin-bottom: 12rpx;
}
.tc-name {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 6rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tc-continent {
  display: block;
  font-size: 20rpx;
  color: #999;
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
