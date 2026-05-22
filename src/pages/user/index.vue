<template>
  <view class="container">
    <!-- 未登录状态 -->
    <view v-if="!userStore.isLoggedIn" class="not-login">
      <view class="not-login-header">
        <view class="not-login-bg"></view>
        <view class="not-login-content">
          <view class="avatar-placeholder">
            <text class="avatar-icon">👤</text>
          </view>
          <text class="welcome-text">欢迎来到 CupFlow</text>
          <text class="welcome-desc">登录后解锁更多精彩功能</text>
        </view>
      </view>
      <view class="not-login-body">
        <view class="feature-list">
          <!-- #ifndef MP-WEIXIN -->
          <view class="feature-item">
            <text class="feature-icon">🎯</text>
            <view class="feature-info">
              <text class="feature-title">赛事竞猜</text>
              <text class="feature-desc">参与比赛预测，赢取积分排名</text>
            </view>
          </view>
          <!-- #endif -->
          <view class="feature-item">
            <text class="feature-icon">⚽</text>
            <view class="feature-info">
              <text class="feature-title">关注球队</text>
              <text class="feature-desc">关注喜爱的球队，获取最新动态</text>
            </view>
          </view>
          <view class="feature-item">
            <text class="feature-icon">🏆</text>
            <view class="feature-info">
              <text class="feature-title">冠军预测</text>
              <text class="feature-desc">预测最终冠军，展示你的眼光</text>
            </view>
          </view>
        </view>
        <view class="login-btn-wrap" @tap="goLogin">
          <text class="login-btn-text">登录 / 注册</text>
        </view>
        <text class="login-hint">登录即可体验全部功能</text>
      </view>
    </view>

    <!-- 已登录状态 -->
    <view v-else>
      <view class="user-header" @tap="goEditProfile">
        <view class="avatar">
          <image v-if="displayAvatarUrl" :src="displayAvatarUrl" class="avatar-img" mode="aspectFill" />
          <text v-else class="avatar-text">{{ userStore.nickname.charAt(0) }}</text>
        </view>
        <view class="user-info">
          <text class="nickname">{{ userStore.nickname }}</text>
          <!-- #ifndef MP-WEIXIN -->
          <text class="user-meta">积分: {{ profile.points || 0 }} | 排名: 第{{ profile.rank || '-' }}名</text>
          <!-- #endif -->
        </view>
        <text class="edit-arrow">编辑 〉</text>
      </view>

      <!-- 功能入口 -->
      <view class="menu-section">
        <!-- #ifndef MP-WEIXIN -->
        <view class="menu-item" @tap="navigateTo('/pages/guess/index')">
          <text class="menu-icon">🎯</text>
          <text class="menu-text">去竞猜</text>
          <text class="menu-arrow">〉</text>
        </view>
        <!-- #endif -->
        <view class="menu-item" @tap="navigateTo('/pages/teams/index')">
          <text class="menu-icon">⚽</text>
          <text class="menu-text">关注球队</text>
          <text class="menu-arrow">〉</text>
        </view>
        <!-- #ifndef MP-WEIXIN -->
        <view class="menu-item" @tap="navigateTo('/pages/rank/index')">
          <text class="menu-icon">🏆</text>
          <text class="menu-text">排行榜</text>
          <text class="menu-arrow">〉</text>
        </view>
        <!-- #endif -->
      </view>

      <!-- 我的关注 -->
      <view class="section">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-icon">⭐</text>
            <text class="section-title">我的关注</text>
          </view>
          <text class="section-action" @tap="navigateTo('/pages/teams/index')">去关注 〉</text>
        </view>
        <view class="follow-list" v-if="profile.follows?.length > 0">
          <view class="follow-item" v-for="f in previewFollows" :key="f.id" @tap="goTeam(f.team_id)">
            <image :src="f.flag_url" class="follow-flag" mode="aspectFit" />
            <text class="follow-name">{{ f.name }}</text>
            <text class="unfollow-btn" @tap.stop="unfollow(f.team_id)">取消关注</text>
          </view>
          <view class="more-btn" v-if="profile.follows.length > 3" @tap="navigateTo('/pages/my-follows/index')">
            <text class="more-text">查看全部关注 ({{ profile.follows.length }})</text>
            <text class="more-arrow">〉</text>
          </view>
        </view>
        <view v-else class="empty-block">
          <text class="empty-text">暂未关注球队</text>
          <text class="empty-tip">前往球队详情页点击「关注」按钮即可</text>
        </view>
      </view>

      <!-- #ifdef MP-WEIXIN -->
      <!-- 我的提醒 -->
      <view class="section">
        <view class="section-header">
          <view class="section-title-wrap">
            <text class="section-icon">🔔</text>
            <text class="section-title">我的提醒</text>
          </view>
          <text class="section-action" @tap="navigateTo('/pages/schedule/index')">去设置 〉</text>
        </view>
        <view class="reminder-preview-list" v-if="reminders.length > 0">
          <view class="reminder-preview-item" v-for="r in previewReminders" :key="r.id" @tap="goToMatch(r.match_id)">
            <view class="reminder-preview-left">
              <text class="reminder-preview-teams">{{ r.home_team_name }} vs {{ r.away_team_name }}</text>
              <text class="reminder-preview-time">{{ formatReminderTime(r.match_time) }}</text>
            </view>
            <view class="reminder-preview-badge" :class="reminderBadgeClass(r.status)">
              <text class="reminder-preview-status">{{ reminderStatusLabel(r.status) }}</text>
            </view>
          </view>
          <view class="more-btn" v-if="reminders.length > 3" @tap="navigateTo('/pages/my-reminders/index')">
            <text class="more-text">查看全部提醒 ({{ reminders.length }})</text>
            <text class="more-arrow">〉</text>
          </view>
        </view>
        <view v-else class="empty-block">
          <text class="empty-text">暂无比赛提醒</text>
          <text class="empty-tip">在赛程页设置提醒，开赛前推送通知</text>
        </view>
      </view>
      <!-- #endif -->

      <!-- #ifndef MP-WEIXIN -->
      <!-- 竞猜记录 -->
      <view class="section">
        <view class="section-header">
          <text class="section-title">竞猜记录</text>
          <text class="section-action" v-if="profile.guesses?.length > 0" @tap="navigateTo('/pages/guess/index')">
            去竞猜 〉
          </text>
          <text class="section-action" v-else @tap="navigateTo('/pages/guess/index')">去竞猜 〉</text>
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
            <text class="more-arrow">〉</text>
          </view>
        </view>
        <view v-else class="empty-block">
          <text class="empty-text">暂无竞猜记录</text>
          <text class="empty-tip">前往竞猜页面参与比赛预测</text>
        </view>
      </view>
      <!-- #endif -->

      <view class="logout-btn" @tap="handleLogout">退出登录</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import api from "@/api";
import { useUserStore } from "@/store/user";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string || "http://localhost:3000").replace(/\/$/, "");

const userStore = useUserStore();
const profile = ref<any>({});
const reminders = ref<any[]>([]);

// 头像完整 URL
const displayAvatarUrl = computed(() => {
  const url = userStore.avatarUrl;
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return BASE_URL + url;
});

// 只显示前3条预览
const previewFollows = computed(() => (profile.value.follows || []).slice(0, 3));
const previewGuesses = computed(() => (profile.value.guesses || []).slice(0, 2));
const previewReminders = computed(() => reminders.value.slice(0, 3));

// 使用 onShow 代替 onMounted，tabBar切换时也能刷新数据
onShow(() => {
  userStore.init();
  if (userStore.isLoggedIn) {
    fetchProfile();
    fetchReminders();
  }
});

const fetchProfile = async () => {
  const res = await api.get("/api/user/profile", true);
  if (res.code === 200) {
    profile.value = res.data;
    // 同步头像和昵称到 store
    if (res.data.avatar_url && res.data.avatar_url !== userStore.avatarUrl) {
      userStore.updateProfile(res.data.nickname || userStore.nickname, res.data.avatar_url);
    }
  }
};

const fetchReminders = async () => {
  try {
    const res = await api.get("/api/subscribe", true);
    if (res.code === 200) reminders.value = res.data || [];
  } catch {}
};

const goLogin = () => {
  uni.navigateTo({ url: "/pages/login/index" });
};

const goEditProfile = () => {
  uni.navigateTo({ url: "/pages/edit-profile/index" });
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

const formatReminderTime = (timeStr: string) => {
  if (!timeStr) return "";
  const d = new Date(timeStr);
  return `${d.getMonth() + 1}月${d.getDate()}日 ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const reminderStatusLabel = (status: string) => {
  const map: Record<string, string> = { pending: "待发送", sent: "已推送", failed: "发送失败" };
  return map[status] || status;
};

const reminderBadgeClass = (status: string) => {
  if (status === "sent") return "badge-sent";
  if (status === "failed") return "badge-failed";
  return "badge-pending";
};

const goToMatch = (matchId: number | null) => {
  if (!matchId) return;
  uni.navigateTo({ url: `/pages/match-live/index?id=${matchId}` });
};
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; }

/* 未登录状态 */
.not-login { min-height: 100vh; background: #f0f4f8; }
.not-login-header {
  position: relative;
  height: 400rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.not-login-bg {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: -40rpx;
  background: linear-gradient(160deg, #0d47a1 0%, #1a73e8 50%, #42a5f5 100%);
  border-radius: 0 0 50rpx 50rpx;
}
.not-login-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.avatar-placeholder {
  width: 140rpx;
  height: 140rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 4rpx dashed rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
}
.avatar-icon {
  font-size: 64rpx;
}
.welcome-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}
.welcome-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 10rpx;
}

.not-login-body {
  margin: -20rpx 32rpx 0;
  position: relative;
  z-index: 2;
}
.feature-list {
  background: #fff;
  border-radius: 20rpx;
  padding: 16rpx 32rpx;
  box-shadow: 0 4rpx 24rpx rgba(0, 0, 0, 0.06);
}
.feature-item {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.feature-item:last-child {
  border-bottom: none;
}
.feature-icon {
  font-size: 48rpx;
  margin-right: 24rpx;
}
.feature-info {
  flex: 1;
}
.feature-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
}
.feature-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 6rpx;
  display: block;
}

.login-btn-wrap {
  margin-top: 40rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(26, 115, 232, 0.35);
}
.login-btn-wrap:active {
  opacity: 0.85;
  transform: scale(0.98);
}
.login-btn-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  letter-spacing: 4rpx;
}
.login-hint {
  display: block;
  text-align: center;
  margin-top: 24rpx;
  font-size: 22rpx;
  color: #bbb;
}
.user-header { background: linear-gradient(135deg, #1a73e8, #0d47a1); padding: 50rpx 40rpx; display: flex; align-items: center; gap: 24rpx; }
.avatar { width: 110rpx; height: 110rpx; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 44rpx; color: #fff; font-weight: bold; overflow: hidden; }
.avatar-img { width: 110rpx; height: 110rpx; border-radius: 50%; }
.avatar-text { font-size: 44rpx; color: #fff; font-weight: bold; line-height: 110rpx; text-align: center; }
.user-info { flex: 1; }
.nickname { font-size: 36rpx; font-weight: bold; color: #fff; display: block; }
.user-meta { font-size: 24rpx; color: rgba(255,255,255,0.8); margin-top: 10rpx; display: block; }
.edit-arrow { font-size: 24rpx; color: rgba(255,255,255,0.8); }
.menu-section { margin: 20rpx; background: #fff; border-radius: 12rpx; overflow: hidden; }
.menu-item { display: flex; align-items: center; padding: 28rpx 24rpx; border-bottom: 1rpx solid #f5f5f5; }
.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 36rpx; margin-right: 16rpx; }
.menu-text { flex: 1; font-size: 28rpx; color: #333; }
.menu-arrow { font-size: 26rpx; color: #ccc; }
.section { margin: 20rpx; background: #fff; border-radius: 12rpx; padding: 24rpx; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16rpx; }
.section-title-wrap { display: flex; align-items: center; gap: 16rpx; }
.section-icon { font-size: 32rpx; }
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
.more-btn { display: flex; align-items: center; justify-content: center; padding: 20rpx 0; margin-top: 8rpx; }
.more-text { font-size: 26rpx; color: #1a73e8; }
.more-arrow { font-size: 24rpx; color: #1a73e8; margin-left: 6rpx; }
.logout-btn { margin: 40rpx 20rpx; text-align: center; padding: 24rpx; background: #fff; border-radius: 12rpx; color: #f44336; font-size: 28rpx; }

/* 提醒预览 */
.reminder-preview-list { /* nothing */ }
.reminder-preview-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.reminder-preview-item:last-child { border-bottom: none; }
.reminder-preview-left { flex: 1; margin-right: 16rpx; }
.reminder-preview-teams { font-size: 28rpx; color: #333; font-weight: 500; display: block; margin-bottom: 6rpx; }
.reminder-preview-time { font-size: 22rpx; color: #999; display: block; }
.reminder-preview-badge { padding: 6rpx 16rpx; border-radius: 20rpx; flex-shrink: 0; }
.reminder-preview-status { font-size: 22rpx; }
.badge-pending { background: #fff3e0; color: #e65100; }
.badge-sent { background: #e8f5e9; color: #2e7d32; }
.badge-failed { background: #ffebee; color: #c62828; }
</style>
