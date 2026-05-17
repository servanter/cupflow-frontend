<template>
  <view class="container">
    <view class="page-title">小组赛积分榜</view>
    <view v-if="Object.keys(standings).length === 0" class="empty">
      <text>暂无积分数据（比赛尚未开始）</text>
    </view>
    <view class="group-card" v-for="(teams, group) in standings" :key="group">
      <view class="group-name">{{ group }}</view>
      <view class="table-header">
        <text class="col-team">球队</text>
        <text class="col-num">赛</text>
        <text class="col-num">胜</text>
        <text class="col-num">平</text>
        <text class="col-num">负</text>
        <text class="col-num">净胜</text>
        <text class="col-num col-pts">积分</text>
      </view>
      <view class="table-row" v-for="(t, idx) in teams" :key="t.team_id" :class="{ qualify: idx < 2 }">
        <view class="col-team">
          <image :src="t.flag_url" class="mini-flag" mode="aspectFit" />
          <text class="t-name">{{ t.team_name }}</text>
        </view>
        <text class="col-num">{{ t.played }}</text>
        <text class="col-num">{{ t.won }}</text>
        <text class="col-num">{{ t.drawn }}</text>
        <text class="col-num">{{ t.lost }}</text>
        <text class="col-num">{{ t.goal_difference > 0 ? '+' : '' }}{{ t.goal_difference }}</text>
        <text class="col-num col-pts">{{ t.points }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/api";

const standings = ref<Record<string, any[]>>({});

onMounted(() => {
  fetchStandings();
});

const fetchStandings = async () => {
  const res = await api.get("/api/matches/standings");
  if (res.code === 200) standings.value = res.data || {};
};
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.page-title { font-size: 36rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }
.empty { text-align: center; padding: 100rpx; color: #999; font-size: 28rpx; }
.group-card { background: #fff; border-radius: 12rpx; margin-bottom: 20rpx; padding: 20rpx; overflow: hidden; }
.group-name { font-size: 28rpx; font-weight: bold; color: #1a73e8; margin-bottom: 12rpx; }
.table-header { display: flex; align-items: center; padding: 12rpx 0; border-bottom: 2rpx solid #f0f0f0; }
.table-header text { font-size: 22rpx; color: #999; font-weight: bold; }
.table-row { display: flex; align-items: center; padding: 14rpx 0; border-bottom: 1rpx solid #f8f8f8; }
.table-row.qualify { background: #f0f9f0; }
.col-team { flex: 1; display: flex; align-items: center; gap: 8rpx; }
.col-num { width: 60rpx; text-align: center; font-size: 24rpx; color: #333; }
.col-pts { font-weight: bold; color: #1a73e8; }
.mini-flag { width: 32rpx; height: 22rpx; }
.t-name { font-size: 24rpx; color: #333; }
</style>
