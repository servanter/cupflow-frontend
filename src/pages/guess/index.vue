<template>
  <view class="container">
    <view class="page-title">竞猜投票</view>

    <view class="match-card" v-for="match in matches" :key="match.id">
      <view class="card-header">
        <text class="card-stage">{{ match.stage }}</text>
        <text class="card-date">{{ formatDate(match.match_date) }} {{ match.match_time }}</text>
      </view>
      <view class="card-teams">
        <text class="team-name">{{ match.home_team_name }}</text>
        <text class="vs">VS</text>
        <text class="team-name">{{ match.away_team_name }}</text>
      </view>

      <!-- 投票条 -->
      <view class="vote-bar" v-if="voteData[match.id]">
        <view class="vote-col home">
          <text class="vote-label">主胜</text>
          <view class="vote-progress">
            <view class="vote-fill home-fill" :style="{ width: getPercent(match.id, 'home') + '%' }"></view>
          </view>
          <text class="vote-num">{{ getPercent(match.id, 'home') }}%</text>
        </view>
        <view class="vote-col draw">
          <text class="vote-label">平局</text>
          <view class="vote-progress">
            <view class="vote-fill draw-fill" :style="{ width: getPercent(match.id, 'draw') + '%' }"></view>
          </view>
          <text class="vote-num">{{ getPercent(match.id, 'draw') }}%</text>
        </view>
        <view class="vote-col away">
          <text class="vote-label">客胜</text>
          <view class="vote-progress">
            <view class="vote-fill away-fill" :style="{ width: getPercent(match.id, 'away') + '%' }"></view>
          </view>
          <text class="vote-num">{{ getPercent(match.id, 'away') }}%</text>
        </view>
      </view>

      <!-- 投票按钮 -->
      <view class="vote-actions" v-if="match.status === '未开始' && !hasGuessed(match.id)">
        <view class="vote-btn home" @tap="submitGuess(match.id, '主胜')">主胜</view>
        <view class="vote-btn draw" @tap="submitGuess(match.id, '平局')">平局</view>
        <view class="vote-btn away" @tap="submitGuess(match.id, '客胜')">客胜</view>
      </view>

      <view class="my-guess" v-if="hasGuessed(match.id)">
        <text>我的竞猜: {{ getUserGuess(match.id) }}</text>
      </view>

      <!-- 最终结果 -->
      <view class="final-result" v-if="voteData[match.id]?.vote?.final_result">
        <text>最终结果: {{ voteData[match.id].vote.final_result }}</text>
      </view>
    </view>

    <view v-if="matches.length === 0" class="empty">
      <text>暂无竞猜赛事</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import api from "@/api";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const matches = ref<any[]>([]);
const voteData = ref<Record<number, any>>({});

onMounted(() => {
  userStore.init();
  fetchMatches();
});

const fetchMatches = async () => {
  const res = await api.get("/api/matches");
  if (res.code === 200) {
    matches.value = (res.data || []).filter((m: any) => m.status !== "已结束" || voteData.value[m.id]?.vote?.final_result);
    // 获取每场的投票数据
    for (const match of matches.value) {
      fetchVoteData(match.id);
    }
  }
};

const fetchVoteData = async (matchId: number) => {
  const res = await api.get(`/api/guess/${matchId}`, true);
  if (res.code === 200) {
    voteData.value[matchId] = res.data;
  }
};

const getPercent = (matchId: number, type: string) => {
  const vote = voteData.value[matchId]?.vote;
  if (!vote) return 0;
  const total = vote.vote_home + vote.vote_draw + vote.vote_away;
  if (total === 0) return 33;
  const map: Record<string, number> = { home: vote.vote_home, draw: vote.vote_draw, away: vote.vote_away };
  return Math.round((map[type] / total) * 100);
};

const hasGuessed = (matchId: number) => {
  return !!voteData.value[matchId]?.userGuess;
};

const getUserGuess = (matchId: number) => {
  return voteData.value[matchId]?.userGuess?.user_choose || "";
};

const submitGuess = async (matchId: number, choice: string) => {
  if (!userStore.isLoggedIn) {
    uni.navigateTo({ url: "/pages/login/index" });
    return;
  }
  const res = await api.post(`/api/guess/${matchId}`, { choice }, true);
  if (res.code === 200) {
    uni.showToast({ title: "竞猜成功！", icon: "success" });
    fetchVoteData(matchId);
  } else {
    uni.showToast({ title: res.message || "竞猜失败", icon: "none" });
  }
};

const formatDate = (d: string) => d ? d.split("T")[0] : "";
</script>

<style scoped>
.container { min-height: 100vh; background: #f5f5f5; padding: 20rpx; }
.page-title { font-size: 36rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }
.match-card { background: #fff; border-radius: 12rpx; padding: 24rpx; margin-bottom: 16rpx; }
.card-header { display: flex; justify-content: space-between; margin-bottom: 12rpx; }
.card-stage { font-size: 24rpx; color: #1a73e8; font-weight: bold; }
.card-date { font-size: 22rpx; color: #999; }
.card-teams { display: flex; align-items: center; justify-content: center; gap: 20rpx; margin-bottom: 16rpx; }
.team-name { font-size: 30rpx; font-weight: bold; color: #333; }
.vs { font-size: 26rpx; color: #999; }
.vote-bar { display: flex; gap: 16rpx; margin-bottom: 16rpx; }
.vote-col { flex: 1; text-align: center; }
.vote-label { font-size: 22rpx; color: #666; display: block; margin-bottom: 8rpx; }
.vote-progress { height: 16rpx; background: #f0f0f0; border-radius: 8rpx; overflow: hidden; }
.vote-fill { height: 100%; border-radius: 8rpx; transition: width 0.3s; min-width: 4rpx; }
.home-fill { background: #4caf50; }
.draw-fill { background: #ff9800; }
.away-fill { background: #2196f3; }
.vote-num { font-size: 24rpx; font-weight: bold; color: #333; display: block; margin-top: 6rpx; }
.vote-actions { display: flex; gap: 16rpx; }
.vote-btn { flex: 1; text-align: center; padding: 16rpx 0; border-radius: 8rpx; font-size: 26rpx; font-weight: bold; color: #fff; }
.vote-btn.home { background: #4caf50; }
.vote-btn.draw { background: #ff9800; }
.vote-btn.away { background: #2196f3; }
.my-guess { text-align: center; font-size: 24rpx; color: #1a73e8; padding: 12rpx; background: #e3f2fd; border-radius: 8rpx; }
.final-result { text-align: center; font-size: 26rpx; color: #e65100; font-weight: bold; margin-top: 12rpx; }
.empty { text-align: center; padding: 100rpx; color: #999; font-size: 28rpx; }
</style>
