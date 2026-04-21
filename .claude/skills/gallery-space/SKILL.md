---
name: gallery-space
description: 创建相册空间展示页面 - 模拟真实照片散落在桌面上的效果，支持拖拽、旋转、放大查看。通用的技术实现指南。
---

# Gallery Space Skill

创建一个模拟真实照片散落在桌面上的相册空间展示页面。

## 核心交互特性

1. **白色底片效果** - 模拟真实照片，图片略小于白色边框，无圆角
2. **可拖拽** - 照片可自由拖动位置
3. **可旋转** - 每张照片有倾斜角度，可手动调整
4. **可重叠** - 照片之间可以互相重叠，拖动时自动提升层级
5. **点击放大** - 点击照片时放大显示在前景
6. **画布缩放** - 支持滚轮缩放和移动端双指缩放
7. **画布拖动** - 支持拖动整个画布浏览

---

## 技术实现要点

### 1. 照片状态数据结构

每张照片需要存储以下状态：

```typescript
interface PhotoState {
  id: string          // 唯一标识
  src: string         // 图片地址
  x: number           // 位置 x（相对于画布）
  y: number           // 位置 y（相对于画布）
  rotation: number    // 旋转角度（度）
  width: number       // 显示宽度
  height: number      // 显示高度
  z_index: number     // 层级顺序
}
```

**关键点：**
- 位置使用绝对定位，相对于画布左上角
- 旋转角度以度为单位，正值顺时针
- z_index 用于控制重叠顺序，拖动时动态更新

### 2. 层级管理（z-index）

拖动或旋转时，需要将照片提升到最顶层：

```typescript
// 全局最高 z-index 计数器
let global_max_z_index = 1

function bring_to_front(photo_id: string) {
  global_max_z_index++
  const photo = photos.find(p => p.id === photo_id)
  if (photo) {
    photo.z_index = global_max_z_index
  }
}
```

**注意事项：**
- 每次交互（拖动开始、旋转开始）时调用
- 持续拖动过程中不要重复调用，避免 z_index 无限增长
- 初始化时取现有照片最大 z_index + 1 作为起始值

### 3. 拖拽实现

#### 桌面端（鼠标事件）

```typescript
// 状态
let is_dragging = false
let drag_offset_x = 0
let drag_offset_y = 0

function handle_mouse_down(e: MouseEvent, photo: PhotoState) {
  e.preventDefault()
  is_dragging = true
  
  // 记录鼠标按下时相对于照片左上角的偏移
  drag_offset_x = e.clientX - photo.x
  drag_offset_y = e.clientY - photo.y
  
  bring_to_front(photo.id)
  
  // 在 document 上监听，确保拖出元素也能继续响应
  document.addEventListener('mousemove', handle_mouse_move)
  document.addEventListener('mouseup', handle_mouse_up)
}

function handle_mouse_move(e: MouseEvent) {
  if (!is_dragging) return
  
  // 新位置 = 鼠标位置 - 偏移
  photo.x = e.clientX - drag_offset_x
  photo.y = e.clientY - drag_offset_y
}

function handle_mouse_up() {
  is_dragging = false
  document.removeEventListener('mousemove', handle_mouse_move)
  document.removeEventListener('mouseup', handle_mouse_up)
  
  // 保存位置到后端
  save_photo_position(photo.id, photo.x, photo.y)
}
```

#### 移动端（触摸事件）

```typescript
function handle_touch_start(e: TouchEvent, photo: PhotoState) {
  if (e.touches.length !== 1) return
  e.preventDefault()
  
  const touch = e.touches[0]
  is_dragging = true
  drag_offset_x = touch.clientX - photo.x
  drag_offset_y = touch.clientY - photo.y
  
  bring_to_front(photo.id)
}

function handle_touch_move(e: TouchEvent) {
  if (!is_dragging || e.touches.length !== 1) return
  
  const touch = e.touches[0]
  photo.x = touch.clientX - drag_offset_x
  photo.y = touch.clientY - drag_offset_y
}

function handle_touch_end() {
  is_dragging = false
  save_photo_position(photo.id, photo.x, photo.y)
}
```

#### 区分点击和拖动

用户可能只想点击放大，而不是拖动。需要设置移动阈值：

```typescript
let has_moved = false
const MOVE_THRESHOLD = 1 // 像素

function handle_drag_start() {
  has_moved = false
}

function handle_drag_move(new_x: number, new_y: number) {
  const dx = Math.abs(new_x - photo.x)
  const dy = Math.abs(new_y - photo.y)
  
  if (dx > MOVE_THRESHOLD || dy > MOVE_THRESHOLD) {
    has_moved = true
  }
}

function handle_drag_end() {
  if (has_moved) {
    // 拖动结束，保存位置
    save_photo_position(...)
  } else {
    // 未移动，视为点击，打开放大查看
    open_photo_viewer(photo)
  }
}
```

### 4. 旋转实现

#### 计算角度函数

```typescript
// 计算从中心点到目标点的角度（弧度转角度）
function get_angle(x: number, y: number, center_x: number, center_y: number): number {
  return Math.atan2(y - center_y, x - center_x) * (180 / Math.PI)
}
```

#### 旋转手柄交互

```typescript
let is_rotating = false
let rotate_center_x = 0
let rotate_center_y = 0
let rotate_start_angle = 0

function handle_rotate_start(e: MouseEvent, photo: PhotoState) {
  e.preventDefault()
  e.stopPropagation() // 阻止触发拖动
  is_rotating = true
  
  // 计算照片中心点（考虑白色边框padding）
  const padding = 24 // 白色边框 padding
  rotate_center_x = photo.x + (photo.width + padding) / 2
  rotate_center_y = photo.y + (photo.height + padding) / 2
  
  // 记录初始角度偏移
  rotate_start_angle = get_angle(e.clientX, e.clientY, rotate_center_x, rotate_center_y) - photo.rotation
  
  bring_to_front(photo.id)
  
  document.addEventListener('mousemove', handle_rotate_move)
  document.addEventListener('mouseup', handle_rotate_end)
}

function handle_rotate_move(e: MouseEvent) {
  if (!is_rotating) return
  
  const current_angle = get_angle(e.clientX, e.clientY, rotate_center_x, rotate_center_y)
  photo.rotation = current_angle - rotate_start_angle
}

function handle_rotate_end() {
  is_rotating = false
  document.removeEventListener('mousemove', handle_rotate_move)
  document.removeEventListener('mouseup', handle_rotate_end)
  
  save_photo_rotation(photo.id, photo.rotation)
}
```

#### 移动端触摸旋转

移动端需要更大的触摸区域：

```typescript
function handle_rotate_touch_start(e: TouchEvent, photo: PhotoState) {
  if (e.touches.length !== 1) return
  e.preventDefault()
  e.stopPropagation()
  is_rotating = true
  
  const touch = e.touches[0]
  
  // 更大的 padding 值适应移动端
  const padding = 32
  rotate_center_x = photo.x + (photo.width + padding) / 2
  rotate_center_y = photo.y + (photo.height + padding) / 2
  
  rotate_start_angle = get_angle(touch.clientX, touch.clientY, rotate_center_x, rotate_center_y) - photo.rotation
  
  bring_to_front(photo.id)
}
```

### 5. 画布缩放与拖动

#### 画布状态

```typescript
const canvas_scale = 1      // 缩放比例
const canvas_offset_x = 0   // 偏移 x
const canvas_offset_y = 0   // 偏移 y
```

#### 滚轮缩放（桌面端）

```typescript
function handle_wheel(e: WheelEvent) {
  e.preventDefault()
  
  // 缩放因子
  const SCALE_FACTOR_DOWN = 0.9
  const SCALE_FACTOR_UP = 1.1
  const MIN_SCALE = 0.3
  const MAX_SCALE = 3
  
  const delta = e.deltaY > 0 ? SCALE_FACTOR_DOWN : SCALE_FACTOR_UP
  const new_scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, canvas_scale * delta))
  
  // 以鼠标位置为缩放中心（可选，也可以用屏幕中心）
  const pivot_x = e.clientX
  const pivot_y = e.clientY
  
  // 计算新偏移，保持缩放中心点不动
  const scale_ratio = new_scale / canvas_scale
  canvas_offset_x = pivot_x - (pivot_x - canvas_offset_x) * scale_ratio
  canvas_offset_y = pivot_y - (pivot_y - canvas_offset_y) * scale_ratio
  
  canvas_scale = new_scale
}
```

#### 双指缩放（移动端）

```typescript
let initial_pinch_distance = 0
let initial_scale = 1
let pinch_center_x = 0
let pinch_center_y = 0

function get_pinch_distance(touches: TouchList): number {
  if (touches.length < 2) return 0
  const dx = touches[0].clientX - touches[1].clientX
  const dy = touches[0].clientY - touches[1].clientY
  return Math.sqrt(dx * dx + dy * dy)
}

function get_pinch_center(touches: TouchList): { x: number; y: number } {
  return {
    x: (touches[0].clientX + touches[1].clientX) / 2,
    y: (touches[0].clientY + touches[1].clientY) / 2
  }
}

function handle_touch_start(e: TouchEvent) {
  if (e.touches.length === 2) {
    initial_pinch_distance = get_pinch_distance(e.touches)
    initial_scale = canvas_scale
    const center = get_pinch_center(e.touches)
    pinch_center_x = center.x
    pinch_center_y = center.y
  }
}

function handle_touch_move(e: TouchEvent) {
  if (e.touches.length === 2) {
    e.preventDefault()
    
    const current_distance = get_pinch_distance(e.touches)
    if (initial_pinch_distance > 0) {
      const new_scale = initial_scale * (current_distance / initial_pinch_distance)
      canvas_scale = Math.min(3, Math.max(0.3, new_scale))
      
      // 以双指中心为缩放中心
      const scale_ratio = canvas_scale / initial_scale
      canvas_offset_x = pinch_center_x - (pinch_center_x - canvas_offset_x) * scale_ratio
      canvas_offset_y = pinch_center_y - (pinch_center_y - canvas_offset_y) * scale_ratio
    }
  }
}
```

#### 画布拖动

```typescript
let is_dragging_canvas = false
let canvas_drag_start_x = 0
let canvas_drag_start_y = 0
let canvas_drag_start_offset_x = 0
let canvas_drag_start_offset_y = 0

function start_canvas_drag(client_x: number, client_y: number) {
  is_dragging_canvas = true
  canvas_drag_start_x = client_x
  canvas_drag_start_y = client_y
  canvas_drag_start_offset_x = canvas_offset_x
  canvas_drag_start_offset_y = canvas_offset_y
}

function move_canvas_drag(client_x: number, client_y: number) {
  if (!is_dragging_canvas) return
  
  canvas_offset_x = canvas_drag_start_offset_x + (client_x - canvas_drag_start_x)
  canvas_offset_y = canvas_drag_start_offset_y + (client_y - canvas_drag_start_y)
}

function end_canvas_drag() {
  is_dragging_canvas = false
}
```

#### CSS Transform

```typescript
const canvas_style = {
  transform: `translate(${canvas_offset_x}px, ${canvas_offset_y}px) scale(${canvas_scale})`,
  transformOrigin: 'center center'
}
```

### 6. 放大查看器（PhotoViewer）

```typescript
// 当前查看的照片
const viewing_photo = ref<PhotoState | null>(null)

function open_photo_viewer(photo: PhotoState) {
  viewing_photo = photo
}

function close_photo_viewer() {
  viewing_photo = null
}
```

**实现要点：**
- 使用 Portal/Teleport 渲染到 body，确保层级最高
- 添加半透明背景遮罩
- 点击遮罩或关闭按钮关闭
- 图片居中显示，限制最大尺寸（如 80vw, 80vh）
- 添加淡入淡出和缩放动画

### 7. 防抖保存位置

拖动和旋转过程中频繁触发，需要防抖保存：

```typescript
const update_timers = new Map<string, ReturnType<typeof setTimeout>>()
const pending_updates = new Map<string, Partial<PhotoState>>()
const DEBOUNCE_DELAY = 500 // 毫秒

function debounced_save(photo_id: string, updates: Partial<PhotoState>) {
  // 合并待更新数据
  const existing = pending_updates.get(photo_id) || {}
  pending_updates.set(photo_id, { ...existing, ...updates })
  
  // 清除旧定时器
  const existing_timer = update_timers.get(photo_id)
  if (existing_timer) clearTimeout(existing_timer)
  
  // 设置新定时器
  const timer = setTimeout(async () => {
    const data = pending_updates.get(photo_id)
    if (!data) return
    
    pending_updates.delete(photo_id)
    update_timers.delete(photo_id)
    
    await api_update_photo(photo_id, data)
  }, DEBOUNCE_DELAY)
  
  update_timers.set(photo_id, timer)
}
```

---

## 移动端适配要点

### 1. 尺寸调整

移动端照片尺寸应更小：

```typescript
// 默认尺寸
const desktop_default_width = 200
const desktop_default_height = 150
const mobile_default_width = 140
const mobile_default_height = 100

// 最大尺寸限制
const desktop_max_width = 280
const desktop_max_height = 220
const mobile_max_width = 180
const mobile_max_height = 140
```

### 2. 触摸区域放大

交互元素的触摸区域需要更大：

```typescript
// 旋转手柄尺寸
const desktop_rotate_handle_size = 24  // 6 * 4 = 24px
const mobile_rotate_handle_size = 32   // 8 * 4 = 32px

// 旋转手柄偏移（更靠外）
const desktop_rotate_handle_offset = -4  // -top-1 -right-1
const mobile_rotate_handle_offset = -8   // -top-2 -right-2
```

### 3. 检测移动端

```typescript
const MOBILE_BREAKPOINT = 768

function check_is_mobile(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT
}

// 监听窗口变化
window.addEventListener('resize', () => {
  is_mobile = check_is_mobile()
  // 切换设备时重置缩放
  if (!is_mobile) {
    canvas_scale = 1
    canvas_offset_x = 0
    canvas_offset_y = 0
  }
})
```

### 4. 底部导航空间预留

移动端通常有底部导航栏，需要预留空间：

```typescript
// 画布底部 padding
const mobile_bottom_padding = 56 // 约 14 * 4px
```

### 5. 防止触摸穿透

移动端照片拖动时，需要阻止事件冒泡，防止同时触发画布拖动：

```typescript
function handle_photo_touch_start(e: TouchEvent) {
  e.stopPropagation() // 阻止冒泡到画布
  // ... 拖动逻辑
}
```

### 6. 禁止双指缩放与单指拖动的冲突

```typescript
function handle_touch_start(e: TouchEvent) {
  if (e.touches.length === 2) {
    // 双指：准备缩放
    start_pinch_zoom(e)
  } else if (e.touches.length === 1) {
    // 单指：准备拖动
    const target = e.target
    if (target.closest('.photo-card')) {
      // 在照片上：照片拖动
      start_photo_drag(e)
    } else {
      // 在画布上：画布拖动
      start_canvas_drag(e.touches[0].clientX, e.touches[0].clientY)
    }
  }
}
```

---

## 上传照片流程

### 1. EXIF 方向处理

手机拍摄的照片可能有 EXIF 方向标记，需要"烧平"进像素：

```typescript
async function flatten_exif_orientation(file: File): Promise<File> {
  // 1. 读取 EXIF 方向
  // 2. 根据方向值旋转像素数据
  // 3. 移除 EXIF 方向标记（设置为 1）
  // 4. 返回处理后的新 File
}
```

### 2. 上传流程

```typescript
async function upload_photo(file: File, gallery_id: string) {
  // 1. 处理图片
  const processed_file = await flatten_exif_orientation(file)
  
  // 2. 获取上传凭证（如果有）
  const upload_token = await get_upload_token()
  
  // 3. 上传到存储服务
  const src = await upload_to_storage(processed_file, upload_token)
  
  // 4. 随机位置和角度
  const x = random_position_x()
  const y = random_position_y()
  const rotation = random_rotation() // 如 ±15 度
  
  // 5. 创建照片记录
  const photo = await api_create_photo({
    gallery_id,
    src,
    x, y, rotation,
    width: default_width,
    height: default_height
  })
  
  return photo
}
```

### 3. 随机初始位置

```typescript
function random_position_x(): number {
  const margin = 50
  const max_x = canvas_width - default_width - margin
  return margin + Math.random() * max_x
}

function random_position_y(): number {
  const margin = 50
  const max_y = canvas_height - default_height - margin
  return margin + Math.random() * max_y
}

function random_rotation(): number {
  const max_angle = 15 // 最大倾斜角度
  return (Math.random() - 0.5) * 2 * max_angle // -15 ~ +15
}
```

---

## 删除模式

### 实现方式

```typescript
const delete_mode = false

function toggle_delete_mode() {
  delete_mode = !delete_mode
}

function handle_photo_click(photo: PhotoState) {
  if (delete_mode) {
    // 删除模式：删除照片
    delete_photo(photo.id)
  } else {
    // 正常模式：放大查看
    open_photo_viewer(photo)
  }
}
```

### 视觉提示

- 删除模式激活时，照片添加红色边框或其他提示
- 显示顶部提示文字："点击照片进行删除"
- 删除按钮样式变化（红色背景）

---

## API 设计建议

### 数据类型

```typescript
// 相册
interface Gallery {
  id: string
  title: string
  cover: string | null
  photo_count: number
  created_at: string
  updated_at: string
}

// 照片
interface Photo {
  id: string
  gallery_id: string
  src: string
  x: number
  y: number
  rotation: number
  width: number
  height: number
  z_index: number
}

// 相册详情（含照片列表）
interface GalleryWithPhotos extends Gallery {
  photos: Photo[]
}
```

### API 接口

```typescript
// 获取相册详情（含照片）
GET /galleries/:id -> GalleryWithPhotos

// 创建照片
POST /galleries/:id/photos -> Photo
Body: { src, x, y, rotation, width, height }

// 更新照片位置/旋转/层级
PATCH /photos/:id -> Photo
Body: { x?, y?, rotation?, z_index? }

// 批量更新照片布局（可选）
PATCH /galleries/:id/photos/layout
Body: { photos: [{ id, x?, y?, rotation?, z_index? }] }

// 删除照片
DELETE /photos/:id
```

---

## 性能优化

### 1. 图片加载

- 使用 `loading="lazy"` 延迟加载
- 图片加载完成后更新实际尺寸
- 显示加载占位符

### 2. 事件监听清理

```typescript
onMounted(() => {
  window.addEventListener('wheel', handle_wheel)
  window.addEventListener('mousedown', handle_window_mousedown)
})

onUnmounted(() => {
  // 必须清理，避免内存泄漏
  window.removeEventListener('wheel', handle_wheel)
  window.removeEventListener('mousedown', handle_window_mousedown)
})
```

### 3. 防抖保存

- 拖动过程中不保存，只在结束时保存
- 使用防抖避免频繁 API 调用

---

## 常见问题处理

### 1. 拖动时照片"跳动"

原因：偏移计算不正确。

解决方案：确保 `drag_offset` 是鼠标位置减去照片当前位置，而不是照片中心。

### 2. 缩放后拖动位置不对

原因：未考虑缩放比例。

解决方案：拖动计算时需要除以缩放比例：

```typescript
photo.x = (e.clientX - drag_offset_x) / canvas_scale
photo.y = (e.clientY - drag_offset_y) / canvas_scale
```

或者在画布外层应用缩放，照片位置不受缩放影响（推荐）。

### 3. 移动端拖动卡顿

原因：未使用 `passive: false` 或未阻止默认行为。

解决方案：

```typescript
element.addEventListener('touchmove', handler, { passive: false })
// handler 中调用 e.preventDefault()
```

### 4. 快速拖动丢失焦点

原因：鼠标移出元素后事件不再触发。

解决方案：在 `document` 上监听 `mousemove` 和 `mouseup`，而不是在元素上。

---

## 组件结构建议

```
components/
├── GallerySpace/           # 相册空间主组件
│   ├── index.vue           # 主页面，包含画布和控制按钮
│   ├── PhotoCard.vue       # 照片卡片，处理拖拽和旋转
│   ├── PhotoViewer.vue     # 放大查看器
│   └── ControlBar.vue      # 控制按钮栏（可选）
├── composables/
│   ├── usePhotoDrag.ts     # 拖拽逻辑
│   ├── usePhotoRotate.ts   # 旋转逻辑
│   ├── useCanvasZoom.ts    # 画布缩放逻辑
│   └── usePhotoDebounce.ts # 防抖保存逻辑
└── api/
│   └── gallery.ts          # 相册 API
```

具体组件拆分可根据项目需求灵活调整。