# 開發紀錄

> 用來記錄每次跟 Claude 討論的重點與待辦，方便關掉 terminal 後下次能接續上下文。

---

## 2026-08-21 — 拖曳元素邏輯重構（dnd-kit）

**狀態**：已完成重構，尚未接續下一步

**做了什麼**（commit `6f5cad8`）：
- 把原本靠 DOM 事件冒泡 + `stopPropagation` + `draggedIdRef` 手動同步來源的拖曳邏輯，
  整合改寫成統一的 `useCanvasDnd`
  （`apps/web/src/app/(edit-page)/builder/_components/_hooks/use-canvas-dnd.tsx`）
- 統一用 dnd-kit 的 `active`/`over` 管理狀態，靠 `active.data.current.type` 分辨拖曳來源：
  - `new-component`：sidebar 拖新元件
  - `existing-element`：畫布內既有元素 reorder
- 詳細設計說明寫在 `apps/web/src/app/(edit-page)/builder/_components/canvas/README.md`
  （拖曳協調者、drop 目標分類、`handleDragStart/Over/End` 邏輯、DOM 結構圖都有記錄）

**關鍵設計決定**：
- 拖曳過程中不重排 DOM（沒有 shadowElements 即時預覽），只在放手瞬間算一次、套用一次，
  避免 rect 重新量測 → dragover 觸發 → 又重排的無限迴圈
- 拖到 Body 空白處目前刻意維持 **no-op**（只記 log），因為沒有 UI 讓使用者決定要插在
  根層級哪個位置——這是留給未來的擴充點，這次遷移沒有夾帶這個新行為

**可能的下一步**（討論到但還沒決定要不要做）：
- [ ] 把「拖到 Body 空白處」的 no-op 補上真正的插入邏輯
- [ ] 檢查 reorder 邏輯是否有邊界情況的 bug
- [ ] 其他拖曳相關需求（尚未提出）

---

<!-- 之後每次討論完，在上面新增一個日期區塊即可 -->
