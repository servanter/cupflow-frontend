<template>
  <view class="page">
    <view class="header">
      <text class="header-tip">完善以下信息，开始体验 CupFlow</text>
    </view>

    <!-- 头像选择 -->
    <view class="section">
      <text class="section-label">我的头像</text>
      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <view class="avatar-wrap">
          <image v-if="avatarUrl" :src="avatarUrl" class="avatar-img" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <text class="avatar-placeholder-icon">📷</text>
          </view>
          <view class="avatar-edit-tag">
            <text class="avatar-edit-text">点击选择</text>
          </view>
        </view>
      </button>
    </view>

    <!-- 昵称输入 -->
    <view class="section">
      <text class="section-label">我的昵称</text>
      <view class="nickname-wrap">
        <input
          class="nickname-input"
          type="nickname"
          v-model="nickname"
          placeholder="点击使用微信昵称"
          placeholder-class="placeholder"
          maxlength="20"
        />
      </view>
      <text class="section-tip">点击输入框可直接使用你的微信昵称</text>
    </view>

    <!-- 完成按钮 -->
    <view class="submit-area">
      <view class="submit-btn" :class="{ disabled: !canSubmit || submitting }" @tap="handleSubmit">
        <text class="submit-text">{{ submitting ? '保存中...' : '完成' }}</text>
      </view>
      <text class="skip-text" @tap="handleSkip">跳过，稍后再设置</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserStore } from "@/store/user";
import api from "@/api";

const userStore = useUserStore();
const avatarUrl = ref(userStore.avatarUrl || "");
const nickname = ref(userStore.nickname || "");
const submitting = ref(false);

const canSubmit = computed(() => nickname.value.trim().length > 0);

// 用户选择头像回调
const onChooseAvatar = (e: any) => {
  avatarUrl.value = e.detail.avatarUrl;
};

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return;
  submitting.value = true;
  try {
    const res = await api.post("/api/user/profile/update", {
      nickname: nickname.value.trim(),
      avatarUrl: avatarUrl.value,
    }, true);

    if (res.code === 200) {
      // 更新本地 store
      userStore.updateProfile(nickname.value.trim(), avatarUrl.value);
      uni.showToast({ title: "保存成功", icon: "success" });
      setTimeout(() => {
        uni.navigateBack();
      }, 800);
    } else {
      uni.showToast({ title: res.message || "保存失败", icon: "none" });
    }
  } catch (err: any) {
    uni.showToast({ title: err.message || "保存失败", icon: "none" });
  } finally {
    submitting.value = false;
  }
};

const handleSkip = () => {
  uni.navigateBack();
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f4f8;
  padding-bottom: 60rpx;
}

.header {
  background: linear-gradient(160deg, #0d47a1 0%, #1a73e8 50%, #42a5f5 100%);
  padding: 60rpx 40rpx 80rpx;
  text-align: center;
}
.header-tip {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.section {
  margin: -30rpx 32rpx 0;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 2;
}
.section + .section {
  margin-top: 0;
  z-index: 1;
}
.section-label {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 28rpx;
}
.section-tip {
  font-size: 22rpx;
  color: #aaa;
  display: block;
  margin-top: 12rpx;
}

/* 头像 */
.avatar-btn {
  background: none !important;
  border: none !important;
  padding: 0 !important;
  margin: 0 !important;
  width: 100%;
  display: flex;
  justify-content: center;
}
.avatar-btn::after {
  border: none !important;
}
.avatar-wrap {
  position: relative;
  width: 160rpx;
  height: 160rpx;
}
.avatar-img {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid #e8f0fe;
}
.avatar-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background: #f0f4f8;
  border: 4rpx dashed #c5d5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-placeholder-icon {
  font-size: 60rpx;
}
.avatar-edit-tag {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #1a73e8;
  border-radius: 20rpx;
  padding: 6rpx 14rpx;
}
.avatar-edit-text {
  font-size: 20rpx;
  color: #fff;
}

/* 昵称 */
.nickname-wrap {
  background: #f7f8fa;
  border-radius: 12rpx;
  padding: 0 24rpx;
  height: 96rpx;
  display: flex;
  align-items: center;
  border: 2rpx solid transparent;
  transition: border-color 0.3s;
}
.nickname-wrap:focus-within {
  border-color: #1a73e8;
  background: #fff;
}
.nickname-input {
  flex: 1;
  height: 96rpx;
  font-size: 30rpx;
  color: #333;
}
.placeholder {
  color: #bbb;
}

/* 提交 */
.submit-area {
  margin: 40rpx 32rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.submit-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(26, 115, 232, 0.35);
}
.submit-btn.disabled {
  background: #c5c5c5;
  box-shadow: none;
}
.submit-btn:active:not(.disabled) {
  opacity: 0.85;
  transform: scale(0.98);
}
.submit-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  letter-spacing: 8rpx;
}
.skip-text {
  margin-top: 32rpx;
  font-size: 26rpx;
  color: #999;
}
</style>
