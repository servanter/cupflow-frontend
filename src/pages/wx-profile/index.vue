<template>
  <view class="page">
    <view class="header">
      <text class="header-tip">{{ isEdit ? '修改你的个人资料' : '完善以下信息，开始体验 CupFlow' }}</text>
    </view>

    <!-- 头像选择 -->
    <view class="section">
      <text class="section-label">我的头像</text>
      <button class="avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
        <view class="avatar-wrap">
          <image v-if="displayUrl" :src="displayUrl" class="avatar-img" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <text class="avatar-placeholder-icon">📷</text>
          </view>
          <view class="avatar-edit-icon">
            <text class="edit-icon-text">✎</text>
          </view>
        </view>
      </button>
      <text v-if="uploading" class="section-tip">正在上传头像...</text>
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
        <text class="submit-text">{{ submitting ? '保存中...' : '保存' }}</text>
      </view>
      <text v-if="!isEdit" class="skip-text" @tap="handleSkip">跳过，稍后再设置</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { useUserStore } from "@/store/user";
import api from "@/api";

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string || "http://localhost:3000").replace(/\/$/, "");

const userStore = useUserStore();
const nickname = ref(userStore.nickname || "");
const submitting = ref(false);
const uploading = ref(false);
const isEdit = ref(false);

// 已上传到服务器的头像 URL（相对路径，用于提交给后端）
const serverAvatarUrl = ref(userStore.avatarUrl || "");
// 用于显示的临时文件路径（选择头像后的 tempFilePath）
const tempDisplayUrl = ref("");

// 显示用的完整 URL
const displayUrl = computed(() => {
  // 优先显示刚选的临时图片
  if (tempDisplayUrl.value) return tempDisplayUrl.value;
  // 从 store 读取的相对路径需要拼接 BASE_URL
  if (serverAvatarUrl.value) {
    if (serverAvatarUrl.value.startsWith("http")) return serverAvatarUrl.value;
    return BASE_URL + serverAvatarUrl.value;
  }
  return "";
});

onLoad((options: any) => {
  if (options?.mode === "edit") {
    isEdit.value = true;
    uni.setNavigationBarTitle({ title: "编辑资料" });
  } else {
    uni.setNavigationBarTitle({ title: "完善资料" });
  }
});

const canSubmit = computed(() => nickname.value.trim().length > 0 && !uploading.value);

// 用户选择头像回调 → 上传到后端
const onChooseAvatar = async (e: any) => {
  const tempFilePath = e.detail.avatarUrl;
  tempDisplayUrl.value = tempFilePath; // 先显示临时图片
  uploading.value = true;

  try {
    const token = uni.getStorageSync("user_token") || "";
    const res: any = await new Promise((resolve, reject) => {
      uni.uploadFile({
        url: BASE_URL + "/api/user/avatar/upload",
        filePath: tempFilePath,
        name: "file",
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (uploadRes: any) => {
          try {
            const data = JSON.parse(uploadRes.data);
            resolve(data);
          } catch {
            reject(new Error("解析响应失败"));
          }
        },
        fail: (err: any) => {
          reject(err);
        },
      });
    });

    if (res.code === 200) {
      serverAvatarUrl.value = res.data.avatarUrl;
      // 上传成功后清除临时路径，displayUrl 会使用 serverAvatarUrl
      tempDisplayUrl.value = "";
    } else {
      uni.showToast({ title: res.message || "上传失败", icon: "none" });
      tempDisplayUrl.value = "";
    }
  } catch (err: any) {
    uni.showToast({ title: "头像上传失败", icon: "none" });
    tempDisplayUrl.value = "";
  } finally {
    uploading.value = false;
  }
};

const handleSubmit = async () => {
  if (!canSubmit.value || submitting.value) return;
  submitting.value = true;
  try {
    const res = await api.post("/api/user/profile/update", {
      nickname: nickname.value.trim(),
      avatarUrl: serverAvatarUrl.value,
    }, true);

    if (res.code === 200) {
      // 更新本地 store
      userStore.updateProfile(nickname.value.trim(), serverAvatarUrl.value);
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
.avatar-edit-icon {
  position: absolute;
  bottom: 4rpx;
  right: 4rpx;
  width: 44rpx;
  height: 44rpx;
  background: #1a73e8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3rpx solid #fff;
}
.edit-icon-text {
  font-size: 24rpx;
  color: #fff;
  line-height: 1;
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
