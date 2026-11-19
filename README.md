# Limitless Essentials Demo

这是匈牙利语服装店 Demo，使用 The Rechabite 的公开前端模板、样式、字体和动画代码。票务、预约和场地内容已换成 Bazsi 的商品、系列、品牌和购物车。项目为静态前端，不处理结账和 Shopify 数据。

## 预览和构建

- 在项目根目录运行 `python scripts/serve_store.py` 后，打开 [本地首页](http://localhost:4173/)。
- 修改商品或模板后运行 `python scripts/build_store.py`。构建使用 Python 和 Node.js 22，生成的静态页面可直接预览。
- 商品和页面链接使用独立路径。原先带 `#/` 的 Demo 链接会转到对应页面。

## 文件职责

- `src/reference/templates` 存放按区块拆分的模板。脚本根据商品数据生成首页、系列、详情、博客、品牌、搜索、购物车和 404。
- `assets/reference` 存放参考站主题资源。脚本包保持原样，样式表的字体地址指向本地文件。
- `src/reference/storefront.js` 负责商品搜索、本地购物车、菜单无障碍状态和本地事件记录。动画、滚动、悬停和页面过场由原站前端脚本处理。
- `src/data/products.js` 存放四款演示商品。商品图片在 `assets`。首页弧形区块当前暂用原站视频 `assets/reference/rechabite-website.mp4`。
- `src/analytics/events.js` 在当前浏览器会话中记录匿名计数。购物车通过浏览器本地存储保存。

参考站为 [The Rechabite](https://therechabite.com.au/)。其第三方包的许可说明保留在原脚本头尾。当前版本使用原站公开前端资源，不依赖原站 WordPress、票务、预约或营销服务。
