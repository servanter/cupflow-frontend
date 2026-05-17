<template>
  <view class="container">
    <view class="guess-list" v-if="guesses.length > 0">
      <view class="guess-card" v-for="g in guesses" :key="g.id">
        <view class="guess-top">
          <text class="guess-teams">{{ g.home_team_name }} vs {{ g.away_team_name }}</text>
          <text
            class="guess-badge"
            :class="{ right: g.is_right === 1, wrong: g.is_right === 0, pending: g.is_right === null }"
          >
            {{ g.is_right === 1 ? '猜对' : g.is_right === 0 ? '猜错' : '待开奖' }}
          </text>
        </view>
        <view class="guess-bottom">
          <text class="guess-choice">我的选择: {{ g.user_choose }}</text>
          <text class="guess-date">{{ formatDate(g.create_time) }}</text>
        </view>
        <view class="guess-score" v-if="g.is_right !== null">
          <text :class="{ 'score-plus': g.is_right === 1 }">
            {{ g.is_right === 1 ? '+10 积分' : '+0 积分' }}
          </text>
        </view>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">🎯</text>
      <text class="empty-text">暂无竞猜记录</text>
      <text class="empty-tip">前往竞猜页面参与比赛预测</text>
      <view class="empty-btn" @tap="goGuess">去竞猜</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import api from "@/api";

const guesses = ref<any[]>([]);

onShow(() => {
  fetchGuesses();
});

const fetchGuesses = async () => {
  const res = await api.get("/api/user/profile", true);
  if (res.code === 200) {
    guesses.value = res.data.guesses || [];
  }
};

const goGuess = () => {
  uni.switchTab({ url: "/pages/guess/index" });
};

const formatDate = (time: string) => {
  if (!time) return "";
  const d = new Date(time);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.guess-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.guess-card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.guess-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14rpx;
}

.guess-teams {
  font-size: 30rpx;
  color: #333;
  font-weight: 600;
}

.guess-badge {
  font-size: 22rpx;
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  color: #fff;
}

.guess-badge.right {
  background: #4caf50;
}

.guess-badge.wrong {
  background: #f44336;
}

.guess-badge.pending {
  background: #ff9800;
}

.guess-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.guess-choice {
  font-size: 26rpx;
  color: #666;
}

.guess-date {
  font-size: 22rpx;
  color: #999;
}

.guess-score {
  text-align: right;
}

.guess-score text {
  font-size: 24rpx;
  color: #999;
}

.score-plus {
  color: #4caf50 !important;
  font-weight: 600;
}

/* empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 160rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 10rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #ccc;
  margin-bottom: 40rpx;
}

.empty-btn {
  background: #1a73e8;
  color: #fff;
  padding: 18rpx 50rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
}
</style>
