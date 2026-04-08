## 技术选型
vue3 + tailwindcss + shadcn-vue + bun

## 主题
- 二次元少女乐队
- 二次元少女乐队
- 二次元少女乐队

## 注意事项
- 你与用户对话应该使用**中文**
- 页面各部分尽量拆分为**独立的组件**，降低各个组件间的耦合度
- css尽量使用tailwindcss配置
- 禁止使用紫色
- 主题、组件颜色选择需要对色弱友好，使用color-palette技能检查颜色设置
- 避免高饱和度颜色
- **不依赖颜色区分元素**
- 注意适配移动端显示效果
- 使用playwright(可直接使用playwright-cli)截图统一保存到同一个目录下，在该目录下再细分每一次新的修改都创建一个目录
- 要多使用`技能`提升生成结果质量
- 一定要使用`ctx7`,`tavily`等技能搜索相关最新资料来保证项目代码质量

## 参考文件
- **网站、链接可以使用ai用浏览器`tavily技能`搜索**
- 页面设计 [path](docs/页面设计)
- 参考网站样式
    - https://mizuki.mysqil.com/
    - https://github.com/LyraVoid/Mizuki
- 随机二次元图片api
    - https://t.alcy.cc/moez（二次元自适应
    - https://t.alcy.cc/ycy（二次元自适应）
    - https://t.alcy.cc/fj（风景横图）
    - https://t.alcy.cc/pc（pc横图）
    - https://t.alcy.cc/acg（动图）
    - https://t.alcy.cc/moemp（萌版竖图）
    - https://t.alcy.cc/xhl（小狐狸）
    - https://www.loliapi.com/acg/pp/（随机头像）
    - https://www.loliapi.com/acg/（自适应二次元）

## 命名规范
- 文件命名使用 `PascalCase`
- template使用 `kebab-case`
- ts使用 `snake_case`
- 类型定义使用 `PascalCase`
- css使用 `kebab-case`

## 工作流
1. 先使用`ctx7`、`playright-cli`、`tavily`等技能搜索最新资料
2. 然后询问用户关于问题的更多细节
3. 等待用户确定细节开始执行