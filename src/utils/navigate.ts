/**
 * 跨平台导航工具
 * 自动判断目标页面是否为 TabBar 页，使用正确的跳转方式
 *
 * 微信小程序 TabBar: 首页 / 赛程 / 球队 / 我的
 * H5 TabBar:        首页 / 资讯 / 竞猜 / 精彩 / 我的
 */
export const goPage = (url: string) => {
  const normalizedUrl = url.startsWith("/") ? url : "/" + url;

  let tabPages: string[] = [];
  // #ifdef MP-WEIXIN
  tabPages = [
    "/pages/index/index",
    "/pages/schedule/index",
    "/pages/teams/index",
    "/pages/user/index",
  ];
  // #endif
  // #ifndef MP-WEIXIN
  tabPages = [
    "/pages/index/index",
    "/pages/news/index",
    "/pages/guess/index",
    "/pages/highlights/index",
    "/pages/user/index",
  ];
  // #endif

  if (tabPages.includes(normalizedUrl)) {
    uni.switchTab({ url: normalizedUrl });
  } else {
    uni.navigateTo({ url: normalizedUrl });
  }
};
