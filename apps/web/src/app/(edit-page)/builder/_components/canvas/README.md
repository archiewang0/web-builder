# Canvas 元件文件

## 概述

`canvas/index.tsx` 是 Web Builder 的核心畫布元件，負責：

- 渲染 schema 中所有的元素（text、image、button、container）
- 接收來自 sidebar 的拖拽，新增元素到 schema
- 管理 canvas 內既有元素的拖拽排序（事件委派）
- 顯示元素選取狀態
- 底部渲染 `PropertyBar`（屬性設定欄）

---

## Props

| Prop | 型別 | 說明 |
|------|------|------|
| `devices` | `DeviceType[]` | 所有裝置設定（桌面、平板、手機） |
| `activeDevice` | `DeviceIdEnums` | 目前選中的裝置，決定畫布寬度 |
| `selectedElement` | `string \| null` | 目前選中的元素 ID |
| `setSelectedElement` | `Dispatch` | 更新選中元素 |
| `dragStartTaget` | `ComponentIdEnums \| null` | Sidebar 拖拽開始的組件 ID |
| `dragEndTaget` | `ComponentIdEnums \| null` | Sidebar 拖拽結束的組件 ID |

---

## 兩套 Drag 系統

Canvas 同時存在兩套不同意圖的 drag 系統，透過 `dataTransfer` key 加以區分，互不干擾。

### 1. Sidebar → Canvas（新增組件）

| 項目 | 說明 |
|------|------|
| 來源 | `sidebar/index.tsx` 的組件列表 |
| dataTransfer key | `text/plain`，值為 `ComponentIdEnums`（如 `"text"`） |
| 目標 handler | `#canvas` div 的 `handleDragOver` / `handleDrop` |
| 結果 | 在 schema 中新增一個元素 |

**插入邏輯**（`handleDrop` 內）：
- drop 在 **Container** 上 → 加入該 Container 的 `children`
- drop 在 **其他元素** 上 → 插入到同層級的後面
- drop 在 **空白 canvas** 上 → append 到根層級

### 2. Element → Element（排序/移動）

| 項目 | 說明 |
|------|------|
| 來源 | Canvas 內既有的任何元素 |
| dataTransfer key | `application/element-id`，值為元素 ID |
| 目標 handler | wrapper div 的 `handleElementDragOver` / `handleElementDrop` |
| 結果 | 重新排序 / 移動元素位置（待實作） |

**隔離機制**：
- `handleElementDragOver`：檢查 `dataTransfer.types.includes('application/element-id')`，只攔截 element drag；sidebar drag 不攔截，讓其冒泡到 `#canvas` 的 handler
- `handleElementDrop`：讀取 `application/element-id`，有值才攔截並 `stopPropagation`；sidebar drag 自然冒泡到 `handleDrop`
- `handleDrop`（canvas 層）：開頭守衛，若讀到 `application/element-id` 則跳過（element 拖到空白 canvas 的保護）

---

## 函式說明

### Canvas 層（sidebar drag）

#### `handleDragOver`
```
觸發：sidebar 組件拖過 #canvas 空白區域
行為：e.preventDefault() 允許 drop，設 dropEffect = 'copy'
```

#### `handleDrop`
```
觸發：sidebar 組件放置到 #canvas（含空白區域與元素上）
行為：
  1. 守衛：若為 element drag（application/element-id 存在）則 return
  2. 讀取 text/plain 取得 componentId
  3. 計算 drop 座標
  4. 透過 elementMap（O(1)）查找目標元素，決定插入位置
  5. setSchema 更新 schema
```

### Element 委派層（element drag）

#### `handleElementDragStart`
```
觸發：Canvas 內任一元素開始被拖拽
行為：
  - e.target.closest('[data-element-id]') 找到來源元素
  - dataTransfer.setData('application/element-id', id)
  - effectAllowed = 'move'
```

#### `handleElementDragEnd`
```
觸發：元素拖拽結束（不管放在哪）
行為：log 來源元素 id / componentId（清理拖拽狀態的擴充點）
```

#### `handleElementDragOver`
```
觸發：拖拽物經過 wrapper div 範圍內
行為：
  - 若非 element drag（types 不含 application/element-id）→ return，讓 sidebar drag 冒泡
  - stopPropagation 阻止冒泡到 canvas handleDragOver
  - dropEffect = 'move'
  - closest 找到目標元素並 log
```

#### `handleElementDrop`
```
觸發：element drag 放置到 wrapper div 範圍內
行為：
  - 讀取 application/element-id，若無值 → return，讓 sidebar drag 冒泡
  - stopPropagation 阻止冒泡到 canvas handleDrop
  - closest 找到目標元素
  - log draggedElementId → targetId（排序邏輯的擴充點）
```

---

## `elementProperty`

每個元素渲染時共用的 props 物件，透過 spread 傳給各 element 元件。

```typescript
{
  'data-component-id': ComponentIdEnums   // 元素類型，供 closest 查詢用
  'data-element-id': string               // 元素唯一 ID，供 closest 查詢用
  'selected-style': string                // 選取時的 ring 樣式
  draggable: true                         // 讓元素可被拖拽
  onClick: (e) => setSelectedElement(id) // 點擊選取元素，stopPropagation 防止冒泡清空選取
}
```

> drag 事件已移至 wrapper div 做事件委派，不在 `elementProperty` 中個別註冊。

---

## `SchemaElementRender`

將 `ElementSchema` 轉換成對應 React 元件。

```
ElementSchema.componentId
  ├── text      → <TextElement>
  ├── image     → <ImgElement>
  ├── button    → <ButtonElement>
  └── container → <ContainerElement>（遞迴傳入 SchemaElementRender）
```

Container 會遞迴渲染 `children`，支援任意深度的巢狀結構。

---

## DOM 結構

```
<main>                          ← onClick 清空 selectedElement
  <div>
    <div>                       ← 捲動容器
      <div>                     ← 裝置寬度框
        <div id="canvas"        ← onDragOver / onDrop（sidebar drag）
          <div.contents         ← onDragStart/End/Over/Drop（element drag 委派）
            <TextElement />
            <ImgElement />
            <ButtonElement />
            <ContainerElement />
          </div>
        </div>
      </div>
    </div>
    <PropertyBar />             ← 底部屬性欄
  </div>
</main>
```

---

## 擴充點

| 功能 | 位置 |
|------|------|
| Element 排序邏輯 | `handleElementDrop` — 讀取 `draggedElementId` 與 `targetId` 後更新 schema |
| 拖拽視覺回饋（highlight） | `handleElementDragOver` — 找到 `targetEl` 後加 CSS class |
| 拖拽中預覽位置 | `handleElementDragStart` — 可設定 `dragImage` |
| 清理拖拽狀態 | `handleElementDragEnd` — 移除 highlight class |
