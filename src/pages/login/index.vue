<template>
  <view class="page">
    <!-- 顶部背景区域 -->
    <view class="header">
      <view class="header-bg"></view>
      <view class="logo-area">
        <text class="logo-icon">⚽</text>
        <text class="app-name">CupFlow</text>
        <text class="app-desc">世界杯赛事互动平台</text>
      </view>
    </view>

    <!-- 表单卡片 -->
    <view class="form-card">
      <!-- 切换Tab -->
      <view class="tab-bar">
        <view class="tab-item" :class="{ active: isLogin }" @tap="isLogin = true">
          <text>登录</text>
        </view>
        <view class="tab-item" :class="{ active: !isLogin }" @tap="isLogin = false">
          <text>注册</text>
        </view>
      </view>

      <!-- 输入区 -->
      <view class="form-body">
        <view class="input-wrap">
          <text class="input-icon">👤</text>
          <input v-model="form.nickname" placeholder="请输入昵称" class="input" placeholder-class="placeholder" />
        </view>
        <view class="input-wrap">
          <text class="input-icon">🔒</text>
          <input v-model="form.password" type="password" placeholder="请输入密码" class="input" placeholder-class="placeholder" />
        </view>
        <view class="input-wrap" v-if="!isLogin">
          <text class="input-icon">🔒</text>
          <input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" class="input" placeholder-class="placeholder" />
        </view>
      </view>

      <!-- 提交按钮 -->
      <view class="submit-btn" @tap="handleSubmit">
        <text>{{ isLogin ? '登 录' : '注 册' }}</text>
      </view>

      <!-- 底部切换 -->
      <view class="footer">
        <text class="footer-text" @tap="isLogin = !isLogin">{{ isLogin ? '还没有账号？立即注册' : '已有账号？返回登录' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();
const isLogin = ref(true);
const form = ref({ nickname: "", password: "", confirmPassword: "" });

const handleSubmit = async () => {
  if (!form.value.nickname || !form.value.password) {
    uni.showToast({ title: "请填写完整", icon: "none" });
    return;
  }

  if (!isLogin.value && form.value.password !== form.value.confirmPassword) {
    uni.showToast({ title: "两次密码不一致", icon: "none" });
    return;
  }

  try {
    if (isLogin.value) {
      await userStore.login(form.value.nickname, form.value.password);
    } else {
      await userStore.register(form.value.nickname, form.value.password);
    }
    uni.showToast({ title: isLogin.value ? "登录成功" : "注册成功", icon: "success" });
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);
  } catch (err: any) {
    uni.showToast({ title: err.message || "操作失败", icon: "none" });
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  background: #f0f4f8;
  position: relative;
  overflow: hidden;
}

/* 顶部背景 */
.header {
  position: relative;
  height: 480rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: -60rpx;
  background: linear-gradient(160deg, #0d47a1 0%, #1a73e8 50%, #42a5f5 100%);
  border-radius: 0 0 60rpx 60rpx;
}
.logo-area {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.logo-icon {
  font-size: 100rpx;
  margin-bottom: 16rpx;
}
.app-name {
  font-size: 52rpx;
  font-weight: bold;
  color: #fff;
  letter-spacing: 4rpx;
}
.app-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.75);
  margin-top: 10rpx;
}

/* 表单卡片 */
.form-card {
  margin: -60rpx 40rpx 0;
  background: #fff;
  border-radius: 24rpx;
  padding: 0 40rpx 50rpx;
  position: relative;
  z-index: 2;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.08);
}

/* Tab切换 */
.tab-bar {
  display: flex;
  border-bottom: 1rpx solid #f0f0f0;
}
.tab-item {
  flex: 1;
  text-align: center;
  padding: 36rpx 0 28rpx;
  font-size: 30rpx;
  color: #999;
  position: relative;
  transition: color 0.3s;
}
.tab-item.active {
  color: #1a73e8;
  font-weight: bold;
}
.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 6rpx;
  background: #1a73e8;
  border-radius: 3rpx;
}

/* 输入区 */
.form-body {
  padding-top: 40rpx;
}
.input-wrap {
  display: flex;
  align-items: center;
  background: #f7f8fa;
  border-radius: 16rpx;
  padding: 0 24rpx;
  height: 96rpx;
  margin-bottom: 24rpx;
  border: 2rpx solid transparent;
  transition: border-color 0.3s;
}
.input-wrap:focus-within {
  border-color: #1a73e8;
  background: #fff;
}
.input-icon {
  font-size: 36rpx;
  margin-right: 20rpx;
}
.input {
  flex: 1;
  height: 96rpx;
  font-size: 28rpx;
  color: #333;
}
.placeholder {
  color: #bbb;
}

/* 提交按钮 */
.submit-btn {
  margin-top: 20rpx;
  height: 96rpx;
  background: linear-gradient(135deg, #1a73e8, #0d47a1);
  border-radius: 48rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(26, 115, 232, 0.35);
}
.submit-btn:active {
  opacity: 0.85;
  transform: scale(0.98);
}
.submit-btn text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  letter-spacing: 8rpx;
}

/* 底部 */
.footer {
  text-align: center;
  margin-top: 36rpx;
}
.footer-text {
  font-size: 26rpx;
  color: #999;
}
</style>
