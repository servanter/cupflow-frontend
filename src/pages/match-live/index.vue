<template>
  <view class="container">
    <!-- 顶部比赛信息 -->
    <view class="match-header">
      <view class="match-info">
        <view class="team-side">
          <image :src="matchInfo.home_flag" class="team-flag" mode="aspectFit" />
          <text class="team-name">{{ matchInfo.home_team_name }}</text>
        </view>
        <view class="score-center">
          <text class="score">{{ matchInfo.home_score }} - {{ matchInfo.away_score }}</text>
          <text class="status" :class="{ live: matchInfo.status === '进行中' }">{{ matchInfo.status }}</text>
        </view>
        <view class="team-side">
          <image :src="matchInfo.away_flag" class="team-flag" mode="aspectFit" />
          <text class="team-name">{{ matchInfo.away_team_name }}</text>
        </view>
      </view>
    </view>

    <!-- 文字直播时间轴 -->
    <view class="live-section">
      <view class="section-title">
        <text>文字直播</text>
        <text class="refresh-btn" @tap="fetchLiveMessages">刷新</text>
      </view>
      <view class="timeline">
        <view class="timeline-item" v-for="msg in messages" :key="msg.id" :class="'type-' + typeClass(msg.type)">
          <view class="timeline-time">{{ msg.time }}</view>
          <view class="timeline-dot" :class="'dot-' + typeClass(msg.type)"></view>
          <view class="timeline-content">
            <view class="msg-type" v-if="msg.type !== '普通'">{{ getTypeIcon(msg.type) }} {{ msg.type }}</view>
            <text class="msg-text">{{ msg.content }}</text>
          </view>
        </view>
        <view v-if="messages.length === 0" class="empty">
          <text>暂无直播内容</text>
        </view>
      </view>
    </view>

    <!-- 评论区 -->
    <view class="comment-section">
      <view class="section-title">
        <text>球迷评论 ({{ comments.length }})</text>
      </view>
      <view class="comment-input">
        <input v-model="commentForm.nickname" placeholder="你的昵称" class="input-nickname" />
        <input v-model="commentForm.content" placeholder="发表评论..." class="input-content" />
        <view class="send-btn" @tap="submitComment">发送</view>
      </view>
      <view class="comment-list">
        <view class="comment-item" v-for="c in comments" :key="c.id">
          <view class="comment-header">
            <text class="comment-nick">{{ c.nickname }}</text>
            <text class="comment-time">{{ formatTime(c.created_at) }}</text>
          </view>
          <text class="comment-text">{{ c.content }}</text>
          <view class="comment-actions">
            <text class="like-btn" @tap="likeComment(c.id)">👍 {{ c.likes }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import api from "@/api";
import { useUserStore } from "@/store/user";
// #ifdef MP-WEIXIN
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
onShareAppMessage(() => ({
  title: matchInfo.value.home_team_name
    ? `${matchInfo.value.home_team_name} vs ${matchInfo.value.away_team_name} 文字直播`
    : "CupFlow - 文字直播",
  path: `/pages/match-live/index?id=${matchId.value}`,
  imageUrl: "/static/logo.png",
}));
onShareTimeline(() => ({
  title: matchInfo.value.home_team_name
    ? `${matchInfo.value.home_team_name} vs ${matchInfo.value.away_team_name} 文字直播`
    : "CupFlow - 文字直播",
  imageUrl: "/static/logo.png",
}));
// #endif

const userStore = useUserStore();
const matchId = ref(0);
const matchInfo = ref<any>({});
const messages = ref<any[]>([]);
const comments = ref<any[]>([]);
const commentForm = ref({ nickname: "", content: "" });
let refreshTimer: any = null;

onMounted(() => {
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1] as any;
  matchId.value = Number(currentPage.$page?.options?.id || currentPage.options?.id || 0);

  if (userStore.nickname) {
    commentForm.value.nickname = userStore.nickname;
  }

  fetchMatchInfo();
  fetchLiveMessages();
  fetchComments();

  // 自动刷新（每15秒）
  refreshTimer = setInterval(() => {
    fetchLiveMessages();
    fetchMatchInfo();
  }, 15000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});

const fetchMatchInfo = async () => {
  const res = await api.get(`/api/matches/${matchId.value}`);
  if (res.code === 200) matchInfo.value = res.data;
};

const fetchLiveMessages = async () => {
  const res = await api.get(`/api/live/${matchId.value}`);
  if (res.code === 200) messages.value = res.data || [];
};

const fetchComments = async () => {
  const res = await api.get(`/api/comments/${matchId.value}?limit=50`);
  if (res.code === 200) comments.value = res.data?.list || res.data || [];
};

const submitComment = async () => {
  if (!commentForm.value.nickname || !commentForm.value.content) {
    uni.showToast({ title: "请填写昵称和内容", icon: "none" });
    return;
  }
  const res = await api.post(`/api/comments/${matchId.value}`, commentForm.value);
  if (res.code === 200) {
    commentForm.value.content = "";
    fetchComments();
    uni.showToast({ title: "评论成功", icon: "success" });
  }
};

const likeComment = async (commentId: number) => {
  await api.post(`/api/comment-like/${commentId}`, {});
  fetchComments();
};

const typeClass = (type: string) => {
  const map: Record<string, string> = { "进球": "goal", "黄牌": "yellow", "红牌": "red", "换人": "sub" };
  return map[type] || "normal";
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = { "进球": "⚽", "黄牌": "🟨", "红牌": "🟥", "换人": "🔄" };
  return icons[type] || "";
};

const formatTime = (time: string) => {
  if (!time) return "";
  const d = new Date(time);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
};
</script>

<style scoped>
.container { background: #f5f5f5; min-height: 100vh; }
.match-header { background: linear-gradient(135deg, #1a73e8, #0d47a1); padding: 40rpx 30rpx; }
.match-info { display: flex; align-items: center; justify-content: space-between; }
.team-side { display: flex; flex-direction: column; align-items: center; width: 200rpx; }
.team-flag { width: 80rpx; height: 54rpx; margin-bottom: 10rpx; }
.team-name { color: #fff; font-size: 28rpx; font-weight: bold; }
.score-center { text-align: center; }
.score { color: #fff; font-size: 56rpx; font-weight: bold; display: block; }
.status { color: rgba(255,255,255,0.8); font-size: 24rpx; }
.status.live { color: #69f0ae; }
.live-section, .comment-section { margin: 20rpx; background: #fff; border-radius: 16rpx; padding: 24rpx; }
.section-title { display: flex; justify-content: space-between; align-items: center; font-size: 30rpx; font-weight: bold; color: #333; margin-bottom: 20rpx; }
.refresh-btn { font-size: 24rpx; color: #1a73e8; font-weight: normal; }
.timeline { padding-left: 20rpx; }
.timeline-item { display: flex; align-items: flex-start; margin-bottom: 24rpx; position: relative; }
.timeline-time { width: 70rpx; font-size: 24rpx; color: #999; font-weight: bold; }
.timeline-dot { width: 16rpx; height: 16rpx; border-radius: 50%; background: #ddd; margin: 6rpx 16rpx 0; flex-shrink: 0; }
.dot-goal { background: #4caf50; }
.dot-yellow { background: #ffc107; }
.dot-red { background: #f44336; }
.dot-sub { background: #2196f3; }
.timeline-content { flex: 1; }
.msg-type { font-size: 22rpx; font-weight: bold; margin-bottom: 4rpx; color: #1a73e8; }
.msg-text { font-size: 26rpx; color: #333; line-height: 1.5; }
.type-goal .timeline-content { background: #e8f5e9; padding: 12rpx; border-radius: 8rpx; }
.type-red .timeline-content { background: #ffebee; padding: 12rpx; border-radius: 8rpx; }
.empty { text-align: center; padding: 60rpx; color: #999; font-size: 26rpx; }
.comment-input { display: flex; align-items: center; gap: 12rpx; margin-bottom: 20rpx; }
.input-nickname { width: 160rpx; height: 64rpx; border: 1rpx solid #e8e8e8; border-radius: 8rpx; padding: 0 16rpx; font-size: 24rpx; }
.input-content { flex: 1; height: 64rpx; border: 1rpx solid #e8e8e8; border-radius: 8rpx; padding: 0 16rpx; font-size: 24rpx; }
.send-btn { background: #1a73e8; color: #fff; padding: 12rpx 24rpx; border-radius: 8rpx; font-size: 24rpx; }
.comment-list { /* nothing */ }
.comment-item { padding: 16rpx 0; border-bottom: 1rpx solid #f0f0f0; }
.comment-header { display: flex; justify-content: space-between; margin-bottom: 8rpx; }
.comment-nick { font-size: 24rpx; color: #1a73e8; font-weight: bold; }
.comment-time { font-size: 22rpx; color: #999; }
.comment-text { font-size: 26rpx; color: #333; line-height: 1.5; }
.comment-actions { margin-top: 8rpx; }
.like-btn { font-size: 24rpx; color: #999; }
</style>
