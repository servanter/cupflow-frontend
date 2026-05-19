// API 基础配置 - 生产环境请修改为实际域名
const BASE_URL = "http://api.cup.aimage.top/";

// 获取存储的token
function getToken(): string {
  return uni.getStorageSync("user_token") || "";
}

// 封装请求方法
interface RequestOptions {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  needAuth?: boolean;
}

interface ApiResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
}

export function request<T = any>(options: RequestOptions): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const header: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options.needAuth) {
      const token = getToken();
      if (token) {
        header["Authorization"] = `Bearer ${token}`;
      }
    }

    uni.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data,
      header,
      success: (res: any) => {
        const data = res.data as ApiResponse<T>;
        if (data.code === 401) {
          // 未登录，跳转登录页
          uni.navigateTo({ url: "/pages/login/index" });
          reject(new Error("未登录"));
        } else {
          resolve(data);
        }
      },
      fail: (err: any) => {
        uni.showToast({ title: "网络错误", icon: "none" });
        reject(err);
      },
    });
  });
}

// 快捷方法
export const api = {
  get: <T = any>(url: string, needAuth = false) => request<T>({ url, method: "GET", needAuth }),
  post: <T = any>(url: string, data: any, needAuth = false) => request<T>({ url, method: "POST", data, needAuth }),
  put: <T = any>(url: string, data: any, needAuth = false) => request<T>({ url, method: "PUT", data, needAuth }),
  delete: <T = any>(url: string, needAuth = false) => request<T>({ url, method: "DELETE", needAuth }),
};

export default api;
