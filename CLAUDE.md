## 技术选型
vue3 + unocss + bun

## 主题
- 二次元少女乐队

## 注意事项
- 页面各部分尽量拆分为独立的组件，降低各个组件间的耦合度
- css尽量使用unocss配置
- 禁止使用紫色
- 主题、组件颜色选择需要对色弱友好
- 确保足够对比度（≥3.5:1）
- 避免高饱和度颜色
- 不依赖颜色区分元素
- 图片api注意设置缓存（缓存图片本身，源地址可能不允许直接访问），防止被屏蔽

## 参考文件
- 网站可以使用ai用浏览器tavily技能搜索
- 页面设计 [path](docs/页面设计)
- 参考网站样式 [url](https://mizuki.mysqil.com/) | [github](https://github.com/LyraVoid/Mizuki)
- unocss官方教程 https://unocss.dev/guide/
- 随机二次元图片api https://t.alcy.cc/moez（二次元自适应） | https://t.alcy.cc/ycy（二次元自适应） | https://t.alcy.cc/fj（风景横图） | https://t.alcy.cc/pc（pc横图） | https://t.alcy.cc/acg（动图） | https://t.alcy.cc/moemp（萌版竖图） | https://t.alcy.cc/xhl（小狐狸）| https://www.loliapi.com/acg/pp/（随机头像）| https://www.loliapi.com/acg/（自适应二次元）

## git规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- refactor: 重构
- style: 代码格式调整

## 命名规范
- 文件命名使用 PascalCase
- template使用 kebab-case
- ts使用 snake_case
- 类型定义使用 PascalCase
- css使用 kebab-case