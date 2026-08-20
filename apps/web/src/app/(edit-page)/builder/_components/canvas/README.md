# Canvas 元件文件

## 概述

`canvas/index.tsx` 是 Web Builder 的核心畫布元件，負責：

- 渲染目前的元素列表（含拖曳中的即時預覽，見下方「拖曳協調者」）
- 顯示元素選取狀態
- 註冊自己（`#canvas`）為 dnd-kit 的根層級 drop 目標（`BODY_ELEMENT_ID`）
- 底部渲染 `PropertyBar`（屬性設定欄）

實際的拖曳邏輯（sidebar 拖新元件、既有元素 reorder）**不在** `Canvas` 元件裡，統一由
`_hooks/use-canvas-dnd.tsx` 的 `useCanvasDnd` 協調，掛在 `builder/[id]/page.tsx` 的
`<DndContext>` 上——因為 dnd-kit 要求所有 draggable/droppable 都要在同一個
`<DndContext>` 底下，而 Sidebar（新元件來源）跟 Canvas（drop 目標）是兩個平行的元件，
`DndContext` 必須掛在它們共同的上層。

---

## Props

### `Canvas`

| Prop | 型別 | 說明 |
|------|------|------|
| `isPreviewMode` | `boolean` | 預覽模式下隱藏編輯用的邊框/id 標籤 |
| `elements` | `ElementSchema[]` | 目前要渲染的元素列表——是 `useCanvasDnd` 算出來的 `shadowElements`，拖曳中會反映即時預覽，不是直接讀 `schema.elements` |
| `dragState` | `{ activeId, overId, dropPosition }` | 目前拖曳狀態，往下傳給每個 `SchemaElementNode` 決定要不要畫插入線/高亮 |

### `SchemaElementNode`（`schema-element-node.tsx`）

| Prop | 型別 | 說明 |
|------|------|------|
| `data` | `ElementSchema` | 這個節點對應的元素 |
| `isPreviewMode` | `boolean` | 同上，遞迴傳給 container 的子節點 |
| `dragState` | `DragVisualState` | 同上 |

---

## 拖曳協調者：`useCanvasDnd`

所有拖曳（sidebar 拖新元件、既有元素 reorder、既有元素拖到 Body）都用 dnd-kit 的
`active`/`over` 集中管理，不再靠 DOM 事件冒泡 + `stopPropagation` 猜測「這次事件屬於
誰」。分辨拖曳來源的方式是讀 `active.data.current.type`：

| `type` | 來源 | 註冊方式 |
|---|---|---|
| `'new-component'` | `sidebar/component-palette.tsx` 的組件列表 | `useDraggable({ id: 'palette:xxx', data: { type: 'new-component', componentId } })` |
| `'existing-element'` | Canvas 內既有的任何元素 | `useDraggable({ id: element.id, data: { type: 'existing-element' } })`（見 `schema-element-node.tsx`） |

drop 目標（droppable）分兩種：

- **`BODY_ELEMENT_ID`**：`#canvas` 本身（`canvas/index.tsx` 的 `useDroppable`），代表根層級
- **每個元素自己**：`SchemaElementNode` 同時呼叫 `useDraggable`（可以被拖）跟
  `useDroppable`（可以被放，`data.componentId` 用來判斷是不是 container）

### `handleDragStart`

讀 `active.data.current.type`：如果是既有元素，選取它、記一筆 `dragStart` log
（development only）。

### `handleDragOver`

只有既有元素 reorder 才需要算插入位置——用 `over.rect`（dnd-kit 給的 droppable 矩形）跟
`active.rect.current.translated` 的中心 Y 座標，餵給 `lib.ts` 的 `getDropPosition`，算出
`'before' | 'after' | 'inside'`（`inside` 只有 target 是 container 才會出現）。這個結果
連同 `overId` 一起存在 state，`shadowElements`（`useMemo`）用它即時算出拖曳中的預覽陣列。

新元件（sidebar 來的）拖曳時不算插入位置，因為它本來就沒有即時預覽這個 UI。

### `handleDragEnd`

依 `active.data.current.type` 分兩條路：

- **`new-component`**：對應舊版「sidebar 插入邏輯」——drop 在 container 上塞進
  `children`；drop 在其他元素旁插到同層級後面；drop 在空白 Body 上 append 到根層級。
- **`existing-element`**：
  - 沒有 `over`（拖出所有 droppable 範圍）→ 視為取消，記一筆 log
  - `over.id === BODY_ELEMENT_ID` → **目前維持 no-op**，只記一筆 log（沒有 UI 讓使用者
    決定要插在根層級哪個位置，先不夾帶這個新行為，是未來可以做的擴充點）
  - 其他情況 → 用 `computeReorder` 把 `shadowElements` 寫回 `schema.elements`

---

## `elementProperty`（`schema-element-node.tsx` 組出來的）

每個元素渲染時共用的 props 物件，透過 spread 傳給各 element 元件（`TextElement` /
`ImgElement` / `ButtonElement` / `ContainerElement`）。

```typescript
{
  'data-component-id': ComponentIdEnums   // 元素類型
  'data-element-id': string               // 元素唯一 ID
  'selected-style': string                 // 選取／drop 插入線的樣式（ring / border-t / border-b）
  ref: (node) => void                      // useDraggable + useDroppable 的 setNodeRef 合併
  ...attributes                            // dnd-kit useDraggable 的 aria attributes
  ...listeners                             // dnd-kit useDraggable 的 pointer 事件（disabled 時是 undefined）
  style: { ...元素自訂樣式, transform, opacity }
  onClick: (e) => setSelectedElement(id)
}
```

**`TextElement`/`ImgElement` 有自己的本地 `ref`**（文字 contentEditable 同步 / 圖片
resize 量測），要跟 `elementProperty.ref`（dnd-kit）合併呼叫，寫法見這兩個檔案裡的
`setRefs`。`ButtonElement`/`ContainerElement` 沒有這個問題，直接整包 spread 即可。

**文字編輯中會停用拖曳**：`SchemaElementNode` 對 text 類型、且目前被選取（代表
`contentEditable` 中）時，`useDraggable({ disabled: true })`，dnd-kit 遇到 `disabled`
會讓 `listeners` 變成 `undefined`，點進去打字就不會被 PointerSensor 誤判成開始拖曳。

**圖片的縮放把手要擋掉 pointerdown 往上冒泡**：`img-element/index.tsx` 的兩個縮放把手
額外加了 `onPointerDownCapture={(e) => e.stopPropagation()}`，避免拖動把手縮放圖片時，
這個 pointerdown 冒泡到外層 wrapper 觸發 dnd-kit 的拖曳判定。

---

## `SchemaElementNode`

將 `ElementSchema` 轉換成對應 React 元件（取代舊版的 `SchemaElementRender` plain
function）。因為每個節點都要各自呼叫 `useDraggable`/`useDroppable`（React hooks），
所以必須是**真正的元件**，不能是迴圈裡呼叫的一般函式。

```
ElementSchema.componentId
  ├── text      → <TextElement>
  ├── image     → <ImgElement>
  ├── button    → <ButtonElement>
  └── container → <ContainerElement>（遞迴渲染 <SchemaElementNode> 給每個 child）
```

Container 會遞迴渲染 `children`，支援任意深度的巢狀結構。

---

## DOM 結構

```
<DndContext>                     ← builder/[id]/page.tsx，唯一的拖曳協調者
  <Sidebar>
    <ComponentPalette>           ← 每個組件各自 useDraggable
  <Canvas>
    <main>                       ← onClick 清空 selectedElement
      ...
        <div id="canvas"         ← useDroppable(BODY_ELEMENT_ID)
          <SchemaElementNode />  ← 每個都是 useDraggable + useDroppable
          <SchemaElementNode />
          ...
        </div>
      ...
      <PropertyBar />
  <EventLoggerPanel />
```

---

## 除錯：Event Log

development 模式下，`useCanvasDnd` 會把每次 `dragStart`／取消／drop 在 Body／
成功 reorder 都記一筆到 `use-event-logger.tsx`，右下角 `EventLoggerPanel` 可以看
即時記錄，也能一鍵複製成 `computeReorder` 的 Jest 測試案例（`copyAsTest`）。
production 環境完全不會執行這段（`process.env.NODE_ENV === 'development'` 擋住）。
