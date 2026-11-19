# Limitless Essentials Demo

匈牙利语品牌店铺前端演示，使用浏览器原生模块，无需安装依赖。商品和图片仅用于展示；不含结账或 Shopify 接入。

## 本地运行

在项目目录运行 `python -m http.server 4173`，然后打开 http://localhost:4173/ 。

## 结构

- `src/app`：入口、路由装配和浏览器本地购物车。
- `src/analytics`：仅当前浏览器会话中的匿名事件计数，不发送到外部。
- `src/components`：导航、页脚和商品卡片。
- `src/data`：演示商品资料。
- `src/pages`：首页和店铺页面。
- `src/styles`：基础、首页、内页样式。
- `assets`：商品演示图片。

购物车只保存在当前浏览器中，不连接支付或服务器。商品资料和素材需要在正式上线前确认。

首屏目前使用来自 The Rechabite（https://therechabite.com.au/）的矢量插画，仅用于对照演示；正式上线前须确认授权或替换为自有素材。

## 参考代码与依赖

导航控制器根据 The Rechabite 公共网站代码移植，保留 GSAP 动画时间轴、面板高度动画和折叠分组逻辑；已移除原站的平滑滚动和其他页面依赖。按钮沿用参考站的双面 3D 翻转结构。`src/vendor/gsap.min.js` 是 GSAP 3.15.0，文件头包含许可信息。原站代码与素材在正式发布前须确认使用权。
