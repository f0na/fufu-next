@AGENTS.md

## 技术选型
next16 + react19 + tailwindcss + shadcn + bun

## 主题
- 二次元少女乐队
- 二次元少女乐队
- 二次元少女乐队

## 注意事项
- 你与用户对话应该使用**中文**
- 页面各部分尽量拆分为**独立的组件**，降低各个组件间的耦合度
- css尽量使用tailwindcss配置
- 禁止使用紫色
- 避免高饱和度颜色
- **不依赖颜色区分元素**
- 注意适配移动端显示效果
- 使用playwright截图统一保存到同一个目录下`screenshots/`，在该目录下再细分每一次新的修改都创建一个目录,例如,`screenshots/修复博客页/`
- 一定要多使用`tavily`等技能搜索相关最新资料来保证项目代码质量
- api文档里找不到的接口一定要告知用户，禁止瞎猜
- 所有技能需要工具已下载，一定要先直接使用`playwright-cli`、`ctx7`命令，不要添加包管理器脚本前缀，例如`npx playwright-cli@latest`、`npx ctx7@latest`，这些都是在直接命令无法使用时使用
- 优先使用`shadcn/ui`的组件，尽量不要自创组件
- **禁止修改已实现的任何组件**
- **禁止修改已实现的任何组件**
- **禁止修改已实现的任何组件**

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
- ts使用 `snake_case`
- 类型定义使用 `PascalCase`
- 类型属性定义使用 `snake_case`，**重要**，api返回数据为 `snake_case`