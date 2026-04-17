---
name: find-skills
description: 帮助用户在提出诸如“我该如何执行X操作”“查找适用于X的技能”“是否有技能可以……”之类的问题，或表达对扩展功能的需求时，发现并安装智能体技能。当用户寻找可能以可安装技能形式存在的功能时，应使用该技能。发现无法解决问题或者很难解决问题时，应使用此技能。
---

# 查找技能（Find Skills）

此技能帮助你从开放代理技能生态系统中发现和安装技能。

## 何时使用此技能

当用户出现以下情况时，请使用此技能：

- 询问"如何做 X"，而 X 可能是已有技能支持的常见任务
- 说"帮我找一个能做 X 的技能"或"有能处理 X 的技能吗"
- 询问"你能做 X 吗"，而 X 是一项专业化能力
- 表达出想要扩展代理能力的兴趣
- 想要搜索工具、模板或工作流
- 提到他们希望在特定领域（设计、测试、部署等）获得帮助
- 当你无法无法找到问题或者发现无法解决问题或者很难解决问题时，应使用此技能。

## 什么是 ctx7 CLI？

ctx7 CLI（`ctx7`）是开放代理技能生态系统的包管理器。技能是模块化包，可通过专业知识、工作流和工具扩展代理能力。

**核心命令：**

- `ctx7 find [query]` - 交互式或按关键词搜索技能
- `ctx7 add <package>` - 从 GitHub 或其他来源安装技能
- `ctx7 check` - 检查技能更新
- `ctx7 update` - 更新所有已安装的技能

**浏览技能请访问：** https://skills.sh/

## 如何帮助用户查找技能

### 步骤 1：理解用户需求

当用户请求帮助时，请识别：

1. 领域（例如：React、测试、设计、部署）
2. 具体任务（例如：编写测试、创建动画、审查 PR）
3. 该任务是否足够常见，以至于很可能存在对应技能

### 步骤 2：优先查看排行榜

在执行 CLI 搜索之前，先查看 [skills.sh 排行榜](https://skills.sh/)，确认该领域是否已有知名技能。排行榜按总安装量排序，展示最受欢迎且经过验证的选项。

例如，Web 开发领域的热门技能包括：
- `vercel-labs/agent-skills` — React、Next.js、Web 设计（各 10 万+ 安装量）
- `anthropics/skills` — 前端设计、文档处理（10 万+ 安装量）

### 步骤 3：搜索技能

如果排行榜未覆盖用户需求，请运行查找命令：

```bash
ctx7 find [query]
```

例如：

- 用户询问"如何让我的 React 应用更快？" → `ctx7 find react performance`
- 用户询问"你能帮我审查 PR 吗？" → `ctx7 find pr review`
- 用户询问"我需要生成变更日志" → `ctx7 find changelog`

### 步骤 4：推荐前验证质量

**不要仅凭搜索结果就推荐技能。** 务必验证：

1. **安装量** — 优先推荐 1K+ 安装量的技能。对低于 100 安装量的技能保持谨慎。
2. **来源信誉** — 官方来源（`vercel-labs`、`anthropics`、`microsoft`）比未知作者更可信。
3. **GitHub 星标** — 检查源仓库。来自星标数 <100 的仓库的技能应谨慎对待。

### 步骤 5：向用户展示选项

找到相关技能后，向用户展示以下内容：

1. 技能名称及其功能说明
2. 安装量和来源
3. 用户可运行的安装命令
4. 在 skills.sh 上了解详情的链接

回复示例：

```
我找到了一个可能帮到你的技能！"react-best-practices" 技能提供来自 Vercel 工程团队的 React 和 Next.js 性能优化指南。
（185K 安装量）

安装命令：
ctx7 add vercel-labs/agent-skills@react-best-practices

了解更多：https://skills.sh/vercel-labs/agent-skills/react-best-practices
```

### 步骤 6：提供安装协助

如果用户希望继续，你可以帮他们安装技能：

```bash
ctx7 add <owner/repo@skill> -g -y
```

`-g` 标志表示全局安装（用户级别），`-y` 标志跳过确认提示。

## 常见技能分类

搜索时可参考以下常见分类：

| 分类 | 示例查询关键词 |
|------|---------------|
| Web 开发 | react, nextjs, typescript, css, tailwind |
| 测试 | testing, jest, playwright, e2e |
| DevOps | deploy, docker, kubernetes, ci-cd |
| 文档 | docs, readme, changelog, api-docs |
| 代码质量 | review, lint, refactor, best-practices |
| 设计 | ui, ux, design-system, accessibility |
| 效率提升 | workflow, automation, git |

## 高效搜索技巧

1. **使用具体关键词**：`react testing` 比单独的 `testing` 效果更好
2. **尝试替代术语**：如果 `deploy` 没结果，试试 `deployment` 或 `ci-cd`
3. **关注热门来源**：许多技能来自 `vercel-labs/agent-skills` 或 `ComposioHQ/awesome-claude-skills`

## 未找到技能时的处理

如果未找到相关技能：

1. 告知用户未找到现有匹配技能
2. 主动提出使用你的通用能力直接帮助用户完成该任务
3. 建议用户可通过 `ctx7 init` 创建自己的技能

示例回复：

```
我搜索了与 "xyz" 相关的技能，但未找到匹配项。
我仍然可以直接帮你完成这个任务！需要我继续吗？

如果这是你经常需要的功能，你可以创建自己的技能：
ctx7 init my-xyz-skill
```