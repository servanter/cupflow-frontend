<template>
  <view class="container">
    <!-- 未登录状态 -->
    <view v-if="!userStore.isLoggedIn" class="not-login">
      <text class="login-tip">请先登录查看个人中心</text>
      <view class="login-btn" @tap="goLogin">登录 / 注册</view>
    </view>

    <!-- 已登录状态 -->
    <view v-else>
      <view class="user-header">
        <view class="avatar">{{ userStore.nickname.charAt(0) }}</view>
        <view class="user-info">
          <text class="nickname">{{ userStore.nickname }}</text>
          <text class="user-meta">积分: {{ profile.points || 0 }} | 排名: 第{{ profile.rank || '-' }}名</text>
        </view>
      </view>

      <!-- 功能入口 -->
      <view class="menu-section">
        <view class="menu-item" @tap="navigateTo('/pages/guess/index')">
          <text class="menu-icon">🎯</text>
          <text class="menu-text">去竞猜</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @tap="navigateTo('/pages/teams/index')">
          <text class="menu-icon">⚽</text>
          <text class="menu-text">关注球队</text>
          <text class="menu-arrow">></text>
        </view>
        <view class="menu-item" @tap="navigateTo('/pages/rank/index')">
          <text class="menu-icon">🏆</text>
          <text class="menu-text">排行榜</text>
          <text class="menu-arrow">></text>
        </view>
      </view>

      <!-- 我的关注 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">我的关注</text>
          <text class="section-action" v-if="profile.follows?.length > 0" @tap="navigateTo('/pages/teams/index')">
            去关注 >
          </text>
          <text class="section-action" v-else @tap="navigateTo('/pages/teams/index')">去关注 ></text>
        </view>
        <view class="follow-list" v-if="profile.follows?.length > 0">
          <view class="follow-item" v-for="f in previewFollows" :key="f.id" @tap="goTeam(f.team_id)">
            <image :src="f.flag_url" class="follow-flag" mode="aspectFit" />
            <text class="follow-name">{{ f.name }}</text>
            <text class="unfollow-btn" @tap.stop="unfollow(f.team_id)">取消关注</text>
          </view>
          <view class="more-btn" v-if="profile.follows.length > 2" @tap="navigateTo('/pages/my-follows/index')">
            <text class="more-text">查看全部关注 ({{ profile.follows.length }})</text>
            <text class="more-arrow">></text>
          </view>
        </view>
        <view v-else class="empty-block">
          <text class="empty-text">暂未关注球队</text>
          <text class="empty-tip">前往球队详情页点击「关注」按钮即可</text>
        </view>
      </view>

      <!-- 竞猜记录 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">竞猜记录</text>
          <text class="section-action" v-if="profile.guesses?.length > 0" @tap="navigateTo('/pages/guess/index')">
            去竞猜 >
          </text>
        </view>
        <view class="guess-list" v-if="profile.guesses?.length > 0">
          <view class="guess-item" v-for="g in previewGuesses" :key="g.id">
            <view class="guess-match">
              <text class="guess-teams">{{ g.home_team_name }} vs {{ g.away_team_name }}</text>
              <text class="guess-date">{{ formatDate(g.create_time) }}</text>
            </view>
            <view class="guess-result">
              <text class="guess-choice">我选: {{ g.user_choose }}</text>
              <text class="guess-status" :class="{ right: g.is_right === 1, wrong: g.is_right === 0 }">
                {{ g.is_right === 1 ? '✓ 猜对 +10分' : g.is_right === 0 ? '✗ 猜错' : '⏳ 待开奖' }}
              </text>
            </view>
          </view>
          <view class="more-btn" v-if="profile.guesses.length > 2" @tap="navigateTo('/pages/my-guesses/index')">
            <text class="more-text">查看全部记录 ({{ profile.guesses.length }})</text>
            <text class="more-arrow">></text>
          </view>
        </view>
        <view v-else class="empty-block">
          <text class="empty-text">暂无竞猜记录</text>
          <text class="empty-tip">前往竞猜页面参与比赛预测</text>
        </view>
      </view>

      <view class="logout-btn" @tap="handleLogout">退出登录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import api from "@/api";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const profile = ref<any>({});

// 只显示前2条预览
const previewFollows = computed(() => (profile.value.follows || []).slice(0, 2));
const previewGuesses = computed(() => (profile.value.guesses || []).slice(0, 2));

// 使用 onShow 代替 onMounted，tabBar切换时也能刷新数据
onShow(() => {
  userStore.init();
  if (userStore.isLoggedIn) {
    fetchProfile();
  }
});

const fetchProfile = async () => {
  const res = await api.get("/api/user/profile", true);
  if (res.code === 200) profile.value = res.data;
};

const goLogin = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};

const goTeam = (teamId: number) => {
  uni.navigateTo({ url: `/pages/team-detail/index?id=${teamId}` });
};

const navigateTo = (url: string) => {
  if (url.includes("/pages/guess/") || url.includes("/pages/highlights/")) {
    uni.switchTab({ url });
  } else {
    uni.navigateTo({ url });
  }
};

const unfollow = async (teamId: number) => {
  const res = await api.delete(`/api/user/follows?teamId=${teamId}`, true);
  if (res.code === 200) {
    uni.showToast({ title: "已取消关注", icon: "success" });
    fetchProfile();
  }
};

const handleLogout = () => {
  userStore.logout();
  profile.value = {};
  uni.showToast({ title: "已退出登录", icon: "success" });
};

const formatDate = (time: string) => {
  if (!time) return "";
  const d = new Date(time);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; }
.not-login { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 200rpx 0; }
.login-tip { font-size: 28rpx; color: #999; margin-bottom: 30rpx; }
.login-btn { background: #1a73e8; color: #fff; padding: 20rpx 60rpx; border-radius: 40rpx; font-size: 30rpx; }
.user-header { background: linear-gradient(135deg, #1a73e8, #0d47a1); padding: 50rpx 40rpx; display: flex; align-items: center; gap: 24rpx; }
.avatar { width: 110rpx; height: 110rpx; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 44rpx; color: #fff; font-weight: bold; line-height: 110rpx; text-align: center; }
.user-info { flex: 1; }
.nickname { font-size: 36rpx; font-weight: bold; color: #fff; display: block; }
.user-meta { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 10rpx; display: block; }
.menu-section { margin: 20rpx; background: #fff; border-radius: 12rpx; overflow: hidden; }
.menu-item { display: flex; align-items: center; padding: 28rpx 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 36rpx; margin-right: 16rpx; }
.menu-text { flex: 1; font-size: 28rpx; color: #333; }
.menu-arrow { font-size: 26rpx; color: #ccc; }
.section { margin: 20rpx; background: #fff; border-radius: 12rpx; padding: 24rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title { font-size: 30rpx; font-weight: bold; color: #333; }
.section-action { font-size: 24rpx; color: #1a73e8; }
.section-count { font-size: 22rpx; color: #999; }
.follow-list { /* nothing */ }
.follow-item { display: flex; align-items: center; padding: 16rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.follow-item:last-child { border-bottom: none; }
.follow-flag { width: 48rpx; height: 32rpx; margin-right: 16rpx; }
.follow-name { flex: 1; font-size: 28rpx; color: #333; }
.unfollow-btn { font-size: 22rpx; color: #f44336; padding: 8rpx 20rpx; border: 1rpx solid #f44336; border-radius: 6rpx; }
.guess-list { /* nothing */ }
.guess-item { padding: 16rpx 0; border-bottom: 1rpx solid #f5f5f5; }
.guess-item:last-child { border-bottom: none; }
.guess-match { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; }
.guess-teams { font-size: 28rpx; color: #333; font-weight: 500; }
.guess-date { font-size: 22rpx; color: #999; }
.guess-result { display: flex; justify-content: space-between; }
.guess-choice { font-size: 24rpx; color: #666; }
.guess-status { font-size: 24rpx; color: #ff9800; }
.guess-status.right { color: #4caf50; }
.guess-status.wrong { color: #f44336; }
.empty-block { padding: 20rpx 0; text-align: center; }
.empty-text { font-size: 26rpx; color: #999; display: block; }
.empty-tip { font-size: 22rpx; color: #ccc; display: block; margin-top: 8rpx; }
.more-btn { display: flex; align-items: center; justify-content: center; padding: 20rpx 0; margin-top: 8rpx; border-top: 1rpx solid #f0f0f0; }
.more-text { font-size: 26rpx; color: #1a73e8; }
.more-arrow { font-size: 24rpx; color: #1a73e8; margin-left: 6rpx; }
.logout-btn { margin: 40rpx 20rpx; text-align: center; padding: 24rpx; background: #fff; border-radius: 12rpx; color: #f44336; font-size: 28rpx; }
</style>
