---
title: Markdown语法演示
date: 2026-04-18
tags: [技术, 测试]
cover: https://t.alcy.cc/moez
excerpt: 展示所有支持的Markdown语法和图表类型。
---

# Markdown语法演示

这篇文章展示了所有支持的Markdown语法。

## 代码高亮

### JavaScript

```javascript
function greet(name) {
  console.log(`Hello, ${name}!`)
  return {
    message: `Welcome to our site`,
    timestamp: Date.now()
  }
}

// 调用函数
const result = greet('Fufu')
console.log(result.message)
```

### Python

```python
def calculate_area(radius):
    """计算圆的面积"""
    import math
    return math.pi * radius ** 2

# 使用示例
areas = [calculate_area(r) for r in [1, 2, 3, 4, 5]]
print(f"Areas: {areas}")
```

### TypeScript

```typescript
interface User {
  id: number
  name: string
  email: string
}

function validateUser(user: User): boolean {
  return user.name.length > 0 && user.email.includes('@')
}
```

## 数学公式

### 行内公式

质能方程 $E = mc^2$ 是物理学中最著名的公式。

圆的面积公式是 $A = \pi r^2$。

### 块级公式

泰勒展开式：

$$
f(x) = f(a) + f'(a)(x-a) + \frac{f''(a)}{2!}(x-a)^2 + \frac{f'''(a)}{3!}(x-a)^3 + \cdots
$$

傅里叶变换：

$$
\hat{f}(\xi) = \int_{-\infty}^{\infty} f(x) e^{-2\pi i x \xi} dx
$$

## Mermaid图表

### 流程图

```mermaid
flowchart TD
    A[开始] --> B{是否登录?}
    B -->|是| C[显示内容]
    B -->|否| D[跳转登录页]
    D --> E[用户登录]
    E --> B
    C --> F[结束]
```

### 时序图

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: 点击提交
    Frontend->>Backend: POST /api/data
    Backend->>Database: 保存数据
    Database-->>Backend: 返回成功
    Backend-->>Frontend: 返回结果
    Frontend-->>User: 显示成功消息
```

### 时间线

```mermaid
timeline
    title 项目开发时间线
    section 准备阶段
        第1周 : 需求分析
        第2周 : 技术选型
    section 开发阶段
        第3周 : 前端开发
        第4周 : 后端开发
        第5周 : 联调测试
    section 上线阶段
        第6周 : 部署上线
        第7周 : 监控优化
```

## GFM表格

| 功能 | 状态 | 优先级 |
|------|:----:|-------:|
| 代码高亮 | ✅ | 高 |
| 数学公式 | ✅ | 高 |
| Mermaid图表 | ✅ | 中 |
| GFM表格 | ✅ | 低 |

## 任务列表

- [x] 代码高亮实现
- [x] 数学公式支持
- [x] Mermaid图表渲染
- [x] GFM表格样式
- [ ] 评论系统集成
- [ ] 搜索功能实现

## 引用块

> 这是一段引用文字。
>
> 可以包含多行内容。

## 列表

### 无序列表

- 第一项
- 第二项
  - 子项A
  - 子项B
- 第三项

### 有序列表

1. 步骤一
2. 步骤二
3. 步骤三

## 链接和图片

[访问GitHub](https://github.com)

### 图片尺寸控制

支持自定义尺寸语法：`![alt =宽x高](url)`

原始大小：
![示例图片](https://t.alcy.cc/moez)

固定宽度 300px：
![小图 =300x](https://t.alcy.cc/moez)

固定宽高 200x150：
![固定尺寸 =200x150](https://t.alcy.cc/moez)

### 语法说明

- `![alt =200x](url)` - 只设置宽度 200px
- `![alt =200x100](url)` - 设置宽度 200px，高度 100px
- `![alt =x100](url)` - 只设置高度 100px

---

以上就是所有支持的Markdown语法！