<template>
  <view class="container">
    <view class="login-card">
      <text class="title">{{ isLogin ? '登录' : '注册' }}</text>
      <view class="form">
        <view class="form-item">
          <text class="label">昵称</text>
          <input v-model="form.nickname" placeholder="输入你的昵称" class="input" />
        </view>
        <view class="form-item">
          <text class="label">密码</text>
          <input v-model="form.password" type="password" placeholder="输入密码" class="input" />
        </view>
        <view class="form-item" v-if="!isLogin">
          <text class="label">确认密码</text>
          <input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" class="input" />
        </view>
      </view>
      <view class="submit-btn" @tap="handleSubmit">
        <text>{{ isLogin ? '登录' : '注册' }}</text>
      </view>
      <view class="switch-mode" @tap="isLogin = !isLogin">
        <text>{{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}</text>
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
.container { min-height: 100vh; background: #f5f5f5; display: flex; align-items: center; justify-content: center; padding: 40rpx; }
.login-card { width: 100%; background: #fff; border-radius: 16rpx; padding: 50rpx 40rpx; }
.title { font-size: 40rpx; font-weight: bold; color: #333; text-align: center; display: block; margin-bottom: 50rpx; }
.form { margin-bottom: 40rpx; }
.form-item { margin-bottom: 24rpx; }
.label { font-size: 26rpx; color: #666; display: block; margin-bottom: 10rpx; }
.input { width: 100%; height: 80rpx; border: 1rpx solid #e8e8e8; border-radius: 8rpx; padding: 0 20rpx; font-size: 28rpx; box-sizing: border-box; }
.submit-btn { background: #1a73e8; padding: 24rpx; border-radius: 40rpx; text-align: center; }
.submit-btn text { color: #fff; font-size: 30rpx; font-weight: bold; }
.switch-mode { text-align: center; margin-top: 30rpx; }
.switch-mode text { font-size: 26rpx; color: #1a73e8; }
</style>
