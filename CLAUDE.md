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
- 主题、组件颜色选择需要对色弱友好，使用color-palette技能检查颜色设置
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

## 工作流程
1. 用户提出问题
2. 先使用`tavily`等技能搜索最新资料
3. 然后询问用户关于问题的更多细节
4. 等待用户确定细节
5. 分析解决用户的问题需要用到哪些技能，如果没有安装技能则进行安装
6. 使用技能进行更改
7. 创建任务计划，划分为多个可同时进行的任务，启动多个子代理同时进行修改，加快修改速度
8. 修改完成后，再启动多个子代理分别进行测试，**给予相关工具权限**，单元测试、e2e测试、黑盒测试、白盒测试等，等待子代理给出测试报告
9. 整理子代理的测试报告，回到第7步，直到测试结果无错误
10. 向用户报告工作情况