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

      <!-- #ifndef MP-WEIXIN -->
      <!-- 切换Tab（非微信版本保留账号密码登录） -->
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
      <!-- #endif -->

      <!-- #ifdef MP-WEIXIN -->
      <!-- 微信授权登录区域 -->
      <view class="wx-login-area">
        <view class="wx-desc">
          <text class="wx-desc-text">授权微信账号即可快速登录</text>
          <text class="wx-desc-sub">安全、便捷，无需注册</text>
        </view>

        <!-- 隐私政策勾选框（默认不勾选，用户须主动同意） -->
        <view class="wx-privacy-check">
          <view class="privacy-row" @tap="togglePrivacy">
            <view class="privacy-checkbox" :class="{ checked: privacyAgreed }">
              <text v-if="privacyAgreed" class="checkbox-tick">✓</text>
            </view>
            <view class="privacy-texts">
              <text class="privacy-text-plain">我已阅读并同意</text>
              <text class="privacy-link" @tap.stop="openAgreement">《用户服务协议》</text>
              <text class="privacy-text-plain">及</text>
              <text class="privacy-link" @tap.stop="openPrivacy">《隐私政策》</text>
            </view>
          </view>
        </view>

        <button
          class="wx-login-btn"
          :class="{ 'wx-login-btn-disabled': !privacyAgreed }"
          @tap="handleWxLogin"
          :loading="wxLoading"
          :disabled="wxLoading"
        >
          <view class="wx-btn-inner">
            <text class="wx-btn-icon">💬</text>
            <text class="wx-btn-text">{{ wxLoading ? '登录中...' : '微信授权登录' }}</text>
          </view>
        </button>
      </view>
      <!-- #endif -->

    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "@/store/user";

const userStore = useUserStore();

// #ifndef MP-WEIXIN
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
// #endif

// #ifdef MP-WEIXIN
const wxLoading = ref(false);
const privacyAgreed = ref(false);

const togglePrivacy = () => {
  privacyAgreed.value = !privacyAgreed.value;
};

const openAgreement = () => {
  uni.showModal({
    title: '用户服务协议',
    content: '欢迎使用 CupFlow 世界杯赛事互动平台。使用本平台即表示您同意遵守相关服务条款，包括但不限于合理使用平台功能、不传播违法内容等。',
    showCancel: false,
    confirmText: '我知道了'
  });
};

const openPrivacy = () => {
  uni.showModal({
    title: '隐私政策',
    content: '我们非常重视您的隐私保护。本平台仅收集必要的用户信息（如微信 openid）用于提供服务，不会将您的个人信息出售给第三方。',
    showCancel: false,
    confirmText: '我知道了'
  });
};

const handleWxLogin = async () => {
  if (!privacyAgreed.value) {
    uni.showToast({ title: '请先阅读并同意用户协议及隐私政策', icon: 'none', duration: 2000 });
    return;
  }
  wxLoading.value = true;
  try {
    // 获取临时登录凭证 code
    const loginRes = await new Promise<any>((resolve, reject) => {
      uni.login({
        provider: "weixin",
        success: resolve,
        fail: reject,
      });
    });

    // 注意：wx.getUserInfo / wx.getUserProfile 已被微信废弃，
    // 无法获取真实昵称和头像，直接用 code 登录即可。
    // 真实昵称/头像通过「完善资料」页的 open-type="chooseAvatar" 获取。
    const result = await userStore.wxLogin(loginRes.code);

    uni.showToast({ title: "登录成功", icon: "success" });
    setTimeout(() => {
      // 微信登录后跳转完善资料页
      uni.redirectTo({ url: "/pages/edit-profile/index?mode=first" });
    }, 800);
  } catch (err: any) {
    uni.showToast({ title: err.message || "登录失败，请重试", icon: "none" });
  } finally {
    wxLoading.value = false;
  }
};
// #endif
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

/* 微信登录区域 */
.wx-login-area {
  padding: 60rpx 0 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.wx-desc {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40rpx;
}
.wx-desc-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}
.wx-desc-sub {
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}

/* 隐私政策勾选区域 */
.wx-privacy-check {
  width: 100%;
  margin-bottom: 32rpx;
}
.privacy-row {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}
.privacy-checkbox {
  width: 36rpx;
  height: 36rpx;
  border: 2rpx solid #ccc;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2rpx;
  transition: all 0.2s;
}
.privacy-checkbox.checked {
  background: #1a73e8;
  border-color: #1a73e8;
}
.checkbox-tick {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
  line-height: 1;
}
.privacy-texts {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  line-height: 1.6;
}
.privacy-text-plain {
  font-size: 24rpx;
  color: #666;
}
.privacy-link {
  font-size: 24rpx;
  color: #1a73e8;
}

.wx-login-btn {
  width: 100%;
  height: 96rpx;
  background: linear-gradient(135deg, #07c160, #06ad56) !important;
  border-radius: 48rpx !important;
  border: none !important;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(7, 193, 96, 0.35);
  padding: 0 !important;
}
.wx-login-btn-disabled {
  background: linear-gradient(135deg, #a0d4b5, #9ecfb0) !important;
  box-shadow: none !important;
}
.wx-login-btn::after {
  border: none !important;
}
.wx-btn-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}
.wx-btn-icon {
  font-size: 36rpx;
}
.wx-btn-text {
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  letter-spacing: 4rpx;
}
</style>
