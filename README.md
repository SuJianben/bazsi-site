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
