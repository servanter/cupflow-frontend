<template>
  <view class="container">
    <view class="follow-list" v-if="follows.length > 0">
      <view class="follow-item" v-for="f in follows" :key="f.id" @tap="goTeam(f.team_id)">
        <image :src="f.flag_url" class="follow-flag" mode="aspectFit" />
        <view class="follow-info">
          <text class="follow-name">{{ f.name }}</text>
        </view>
        <text class="unfollow-btn" @tap.stop="unfollow(f.team_id)">取消关注</text>
      </view>
    </view>

    <view v-else class="empty-state">
      <text class="empty-icon">⚽</text>
      <text class="empty-text">暂未关注球队</text>
      <text class="empty-tip">前往球队详情页点击「关注」按钮即可</text>
      <view class="empty-btn" @tap="goTeams">去关注球队</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import api from "@/api";
import { goPage } from "@/utils/navigate";

const follows = ref<any[]>([]);

onShow(() => {
  fetchFollows();
});

const fetchFollows = async () => {
  const res = await api.get("/api/user/profile", true);
  if (res.code === 200) {
    follows.value = res.data.follows || [];
  }
};

const goTeam = (teamId: number) => {
  uni.navigateTo({ url: `/pages/team-detail/index?id=${teamId}` });
};

const goTeams = () => {
  goPage("/pages/teams/index");
};

const unfollow = async (teamId: number) => {
  const res = await api.delete(`/api/user/follows?teamId=${teamId}`, true);
  if (res.code === 200) {
    uni.showToast({ title: "已取消关注", icon: "success" });
    fetchFollows();
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20rpx;
}

.follow-list {
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.follow-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.follow-item:last-child {
  border-bottom: none;
}

.follow-flag {
  width: 64rpx;
  height: 44rpx;
  margin-right: 20rpx;
  border-radius: 4rpx;
}

.follow-info {
  flex: 1;
}

.follow-name {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.unfollow-btn {
  font-size: 24rpx;
  color: #f44336;
  padding: 10rpx 24rpx;
  border: 1rpx solid #f44336;
  border-radius: 30rpx;
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
