<template>
  <view class="container">
    <!-- 阶段Tab -->
    <view class="stage-tabs">
      <scroll-view scroll-x class="tabs-scroll">
        <text
          v-for="tab in stageTabs"
          :key="tab"
          class="tab-item"
          :class="{ 'tab-active': currentStage === tab }"
          @tap="currentStage = tab"
        >{{ tab }}</text>
      </scroll-view>
    </view>

    <!-- 小组赛视图：按组展示 -->
    <view v-if="currentStage === '小组赛'">
      <!-- 小组筛选 -->
      <view class="group-tabs">
        <text
          class="group-tab"
          :class="{ 'group-tab-active': currentGroup === '全部' }"
          @tap="currentGroup = '全部'"
        >全部</text>
        <text
          v-for="g in groups"
          :key="g"
          class="group-tab"
          :class="{ 'group-tab-active': currentGroup === g }"
          @tap="currentGroup = g"
        >{{ g }}</text>
      </view>

      <!-- 按组分块 -->
      <view v-for="g in displayGroups" :key="g" class="group-section">
        <view class="group-header">
          <text class="group-name">{{ g }}</text>
        </view>
        <view class="match-list">
          <view
            class="match-row"
            v-for="match in groupMatches(g)"
            :key="match.id"
            @tap="goToLive(match.id)"
          >
            <view class="match-left">
              <text class="match-date-text">{{ formatDate(match.match_date) }}</text>
              <text class="match-time-text">{{ match.match_time }}</text>
            </view>
            <view class="match-center">
              <view class="match-team-row">
                <image :src="match.home_flag" class="row-flag" mode="aspectFit" />
                <text class="row-team-name">{{ match.home_team_name }}</text>
              </view>
              <view class="match-score-box" :class="scoreBoxClass(match.status)">
                <text v-if="match.status === '未开始'" class="score-vs">VS</text>
                <text v-else class="score-result">{{ match.home_score }} - {{ match.away_score }}</text>
              </view>
              <view class="match-team-row match-team-row--right">
                <text class="row-team-name">{{ match.away_team_name }}</text>
                <image :src="match.away_flag" class="row-flag" mode="aspectFit" />
              </view>
            </view>
            <view class="match-right">
              <view class="status-tag" :class="statusClass(match.status)">
                <text class="status-tag-text">{{ match.status }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 淘汰赛视图：对阵图 -->
    <view v-else class="knockout-view">
      <view v-if="knockoutMatches.length === 0" class="empty-tip">
        <text>{{ currentStage }}赛程暂未公布</text>
      </view>
      <view v-else class="match-list">
        <view
          class="match-row"
          v-for="match in knockoutMatches"
          :key="match.id"
          @tap="goToLive(match.id)"
        >
          <view class="match-left">
            <text class="match-date-text">{{ formatDate(match.match_date) }}</text>
            <text class="match-time-text">{{ match.match_time }}</text>
          </view>
          <view class="match-center">
            <view class="match-team-row">
              <image :src="match.home_flag" class="row-flag" mode="aspectFit" />
              <text class="row-team-name">{{ match.home_team_name }}</text>
            </view>
            <view class="match-score-box" :class="scoreBoxClass(match.status)">
              <text v-if="match.status === '未开始'" class="score-vs">VS</text>
              <text v-else class="score-result">{{ match.home_score }} - {{ match.away_score }}</text>
            </view>
            <view class="match-team-row match-team-row--right">
              <text class="row-team-name">{{ match.away_team_name }}</text>
              <image :src="match.away_flag" class="row-flag" mode="aspectFit" />
            </view>
          </view>
          <view class="match-right">
            <view class="status-tag" :class="statusClass(match.status)">
              <text class="status-tag-text">{{ match.status }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import api from "@/api";
// #ifdef MP-WEIXIN
import { onShareAppMessage, onShareTimeline } from "@dcloudio/uni-app";
onShareAppMessage(() => ({ title: "2026世界杯全部赛程", path: "/pages/schedule/index", imageUrl: "/static/logo.png" }));
onShareTimeline(() => ({ title: "2026世界杯全部赛程", imageUrl: "/static/logo.png" }));
// #endif

const allMatches = ref<any[]>([]);
const currentStage = ref("小组赛");
const currentGroup = ref("全部");

const stageTabs = ["小组赛", "32强赛", "16强赛", "8强赛", "半决赛", "决赛"];
const groups = ["A组", "B组", "C组", "D组", "E组", "F组", "G组", "H组", "I组", "J组", "K组", "L组"];

onMounted(() => {
  fetchAllMatches();
});

const fetchAllMatches = async () => {
  const res = await api.get("/api/matches");
  if (res.code === 200) {
    allMatches.value = res.data || [];
  }
};

// 当前展示的小组列表
const displayGroups = computed(() => {
  if (currentGroup.value === "全部") return groups;
  return [currentGroup.value];
});

// 获取某组的比赛
const groupMatches = (group: string) => {
  return allMatches.value
    .filter((m: any) => m.stage === "小组赛" && m.group_name === group)
    .sort((a: any, b: any) => {
      if (a.match_date !== b.match_date) return a.match_date < b.match_date ? -1 : 1;
      return a.match_time < b.match_time ? -1 : 1;
    });
};

// 淘汰赛比赛
const knockoutMatches = computed(() => {
  return allMatches.value
    .filter((m: any) => m.stage === currentStage.value)
    .sort((a: any, b: any) => {
      if (a.match_date !== b.match_date) return a.match_date < b.match_date ? -1 : 1;
      return a.match_time < b.match_time ? -1 : 1;
    });
});

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const scoreBoxClass = (status: string) => {
  if (status === "进行中") return "score-box--live";
  if (status === "已结束") return "score-box--end";
  return "";
};

const statusClass = (status: string) => {
  if (status === "进行中") return "tag--live";
  if (status === "已结束") return "tag--end";
  return "tag--upcoming";
};

const goToLive = (matchId: number) => {
  uni.navigateTo({ url: `/pages/match-live/index?id=${matchId}` });
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
}

/* 阶段Tab */
.stage-tabs {
  background: #fff;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
}
.tabs-scroll {
  white-space: nowrap;
  padding: 0 20rpx;
}
.tab-item {
  display: inline-block;
  padding: 12rpx 28rpx;
  font-size: 28rpx;
  color: #666;
  border-radius: 30rpx;
  margin-right: 16rpx;
}
.tab-active {
  background: #1a73e8;
  color: #fff;
  font-weight: bold;
}

/* 小组筛选 */
.group-tabs {
  background: #fff;
  padding: 16rpx 20rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  border-bottom: 1rpx solid #eee;
}
.group-tab {
  padding: 8rpx 24rpx;
  font-size: 24rpx;
  color: #666;
  background: #f5f5f5;
  border-radius: 20rpx;
}
.group-tab-active {
  background: #e3f2fd;
  color: #1a73e8;
  font-weight: bold;
}

/* 小组区块 */
.group-section {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.group-header {
  background: linear-gradient(135deg, #1a73e8, #1565c0);
  padding: 16rpx 24rpx;
}
.group-name {
  font-size: 30rpx;
  font-weight: bold;
  color: #fff;
}

/* 比赛列表 */
.match-list {
  padding: 0 20rpx;
}
.match-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
}
.match-row:last-child {
  border-bottom: none;
}

/* 左侧日期时间 */
.match-left {
  width: 90rpx;
  flex-shrink: 0;
  text-align: center;
}
.match-date-text {
  display: block;
  font-size: 24rpx;
  color: #999;
}
.match-time-text {
  display: block;
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

/* 中间对阵 */
.match-center {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.match-team-row {
  display: flex;
  align-items: center;
  width: 180rpx;
  justify-content: flex-end;
}
.match-team-row--right {
  justify-content: flex-start;
}
.row-flag {
  width: 48rpx;
  height: 32rpx;
  margin: 0 10rpx;
}
.row-team-name {
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
}

/* 比分框 */
.match-score-box {
  min-width: 100rpx;
  text-align: center;
  padding: 6rpx 16rpx;
  border-radius: 8rpx;
  background: #f8f9fa;
  margin: 0 8rpx;
}
.score-box--live {
  background: #ffebee;
}
.score-box--end {
  background: #e3f2fd;
}
.score-vs {
  font-size: 24rpx;
  color: #bdbdbd;
  font-weight: bold;
}
.score-result {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
}
.score-box--live .score-result {
  color: #e53935;
}

/* 右侧状态 */
.match-right {
  width: 90rpx;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
}
.status-tag {
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-size: 20rpx;
}
.status-tag-text {
  font-size: 20rpx;
}
.tag--upcoming {
  background: #f5f5f5;
  color: #999;
}
.tag--live {
  background: #e8f5e9;
  color: #2e7d32;
}
.tag--end {
  background: #e3f2fd;
  color: #1565c0;
}

/* 淘汰赛 */
.knockout-view {
  padding: 0 0 20rpx;
}
.knockout-view .match-list {
  margin: 20rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 0 20rpx;
}

.empty-tip {
  text-align: center;
  padding: 120rpx 0;
  color: #999;
  font-size: 28rpx;
}
</style>
