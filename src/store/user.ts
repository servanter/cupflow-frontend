import { defineStore } from "pinia";
import api from "@/api";

interface UserState {
  isLoggedIn: boolean;
  token: string;
  userId: number;
  nickname: string;
  points: number;
  avatarUrl: string;
}

export const useUserStore = defineStore("user", {
  state: (): UserState => ({
    isLoggedIn: false,
    token: "",
    userId: 0,
    nickname: "",
    points: 0,
    avatarUrl: "",
  }),

  actions: {
    init() {
      const token = uni.getStorageSync("user_token");
      const userInfo = uni.getStorageSync("user_info");
      if (token && userInfo) {
        this.token = token;
        this.isLoggedIn = true;
        const info = JSON.parse(userInfo);
        this.userId = info.userId;
        this.nickname = info.nickname;
        this.points = info.points || 0;
        this.avatarUrl = info.avatarUrl || "";
      }
    },

    async login(nickname: string, password: string) {
      const res = await api.post("/api/user/login", { nickname, password });
      if (res.code === 200 && res.data) {
        this.token = res.data.token;
        this.isLoggedIn = true;
        this.userId = res.data.userId;
        this.nickname = res.data.nickname;
        this.points = res.data.points || 0;
        this.avatarUrl = res.data.avatarUrl || "";
        uni.setStorageSync("user_token", res.data.token);
        uni.setStorageSync("user_info", JSON.stringify(res.data));
        return true;
      }
      throw new Error(res.message || "登录失败");
    },

    async wxLogin(code: string) {
      const res = await api.post("/api/user/wechat-login", { code });
      if (res.code === 200 && res.data) {
        this.token = res.data.token;
        this.isLoggedIn = true;
        this.userId = res.data.userId;
        this.nickname = res.data.nickname;
        this.points = res.data.points || 0;
        this.avatarUrl = res.data.avatarUrl || "";
        uni.setStorageSync("user_token", res.data.token);
        uni.setStorageSync("user_info", JSON.stringify(res.data));
        return true;
      }
      throw new Error(res.message || "微信登录失败");
    },

    async register(nickname: string, password: string) {
      const res = await api.post("/api/user/register", { nickname, password });
      if (res.code === 200 && res.data) {
        this.token = res.data.token;
        this.isLoggedIn = true;
        this.userId = res.data.userId;
        this.nickname = res.data.nickname;
        this.points = 0;
        this.avatarUrl = "";
        uni.setStorageSync("user_token", res.data.token);
        uni.setStorageSync("user_info", JSON.stringify(res.data));
        return true;
      }
      throw new Error(res.message || "注册失败");
    },

    logout() {
      this.isLoggedIn = false;
      this.token = "";
      this.userId = 0;
      this.nickname = "";
      this.points = 0;
      this.avatarUrl = "";
      uni.removeStorageSync("user_token");
      uni.removeStorageSync("user_info");
    },

    updateProfile(nickname: string, avatarUrl: string) {
      this.nickname = nickname;
      this.avatarUrl = avatarUrl;
<<<<<<< HEAD
=======
      // 同步到 localStorage
>>>>>>> 65ff74b5f4f15cdca8033aaa83ae0567b97d5715
      const userInfo = uni.getStorageSync("user_info");
      if (userInfo) {
        const info = JSON.parse(userInfo);
        info.nickname = nickname;
        info.avatarUrl = avatarUrl;
        uni.setStorageSync("user_info", JSON.stringify(info));
      }
    },
  },
});
