<template>
  <view class="container">
    <view v-if="loading" class="loading-tip">
      <text>加载中...</text>
    </view>

    <view v-else-if="reminders.length === 0" class="empty-state">
      <text class="empty-icon">🔔</text>
      <text class="empty-title">暂无提醒</text>
      <text class="empty-desc">在赛程页设置比赛提醒，开赛前 1 小时推送通知</text>
      <view class="go-schedule-btn" @tap="goSchedule">
        <text class="go-schedule-text">去赛程页 〉</text>
      </view>
    </view>

    <view v-else class="reminder-list">
      <view
        class="reminder-item"
        v-for="item in reminders"
        :key="item.id"
        @tap="goToMatch(item.match_id)"
      >
        <view class="reminder-left">
          <view class="team-flags" v-if="item.home_team_name">
            <text class="teams-text">{{ item.home_team_name }} vs {{ item.away_team_name }}</text>
          </view>
          <text class="reminder-title">{{ item.title }}</text>
          <text class="reminder-time">比赛时间：{{ formatTime(item.match_time) }}</text>
          <text class="reminder-sendtime">提醒时间：{{ formatTime(item.send_time) }}</text>
        </view>
        <view class="reminder-right">
          <view class="status-badge" :class="statusClass(item.status)">
            <text class="status-text">{{ statusLabel(item.status) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import api from "@/api";

const loading = ref(true);
const reminders = ref<any[]>([]);

onShow(() => {
  fetchReminders();
});

const fetchReminders = async () => {
  loading.value = true;
  try {
    const res = await api.get("/api/subscribe", true);
    if (res.code === 200) {
      reminders.value = res.data || [];
    }
  } catch (e) {
    // ignore
  } finally {
    loading.value = false;
  }
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return "";
  const d = new Date(timeStr);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${month}月${day}日 ${hour}:${min}`;
};

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    pending: "待发送",
    sent: "已推送",
    failed: "发送失败",
  };
  return map[status] || status;
};

const statusClass = (status: string) => {
  if (status === "sent") return "badge-sent";
  if (status === "failed") return "badge-failed";
  return "badge-pending";
};

const goToMatch = (matchId: number | null) => {
  if (!matchId) return;
  uni.navigateTo({ url: `/pages/match-live/index?id=${matchId}` });
};

const goSchedule = () => {
  uni.navigateTo({ url: "/pages/schedule/index" });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.loading-tip {
  text-align: center;
  padding: 120rpx 0;
  color: #999;
  font-size: 28rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx 60rpx;
}
.empty-icon {
  font-size: 100rpx;
  margin-bottom: 24rpx;
}
.empty-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}
.empty-desc {
  font-size: 26rpx;
  color: #999;
  text-align: center;
  line-height: 1.6;
  margin-bottom: 48rpx;
}
.go-schedule-btn {
  background: #1a73e8;
  border-radius: 40rpx;
  padding: 20rpx 60rpx;
}
.go-schedule-text {
  color: #fff;
  font-size: 28rpx;
  font-weight: bold;
}

.reminder-list {
  /* nothing */
}
.reminder-item {
  background: #fff;
  border-radius: 16rpx;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.reminder-left {
  flex: 1;
  margin-right: 20rpx;
}
.teams-text {
  font-size: 26rpx;
  color: #1a73e8;
  font-weight: bold;
  display: block;
  margin-bottom: 6rpx;
}
.reminder-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}
.reminder-time {
  font-size: 24rpx;
  color: #666;
  display: block;
  margin-bottom: 6rpx;
}
.reminder-sendtime {
  font-size: 22rpx;
  color: #999;
  display: block;
}
.reminder-right {
  flex-shrink: 0;
}
.status-badge {
  padding: 8rpx 20rpx;
  border-radius: 20rpx;
}
.status-text {
  font-size: 22rpx;
}
.badge-pending {
  background: #fff3e0;
  color: #e65100;
}
.badge-sent {
  background: #e8f5e9;
  color: #2e7d32;
}
.badge-failed {
  background: #ffebee;
  color: #c62828;
}
</style>
