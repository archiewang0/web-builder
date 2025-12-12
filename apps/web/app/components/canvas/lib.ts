import { ContainerElementSchema, ElementSchema } from ".";
import { ComponentIdEnums } from "../sidebar/useSidebar";

// Map 索引節點
interface ElementNode {
    element: ElementSchema;
    parent: ContainerElementSchema | null;
    path: number[]; // 在樹中的位置路徑
    depth: number;  // 深度（根層級 = 0）
}
/*

  path 是一個數字陣列，記錄元素在樹狀結構中的「陣列索引路徑」

  舉例說明：

  schema = {
    elements: [
      container-1,        // path: [0]
        ├─ text-1,        // path: [0, 0]  → elements[0].children[0]
        └─ container-2,   // path: [0, 1]  → elements[0].children[1]
             ├─ button-1  // path: [0, 1, 0]  → elements[0].children[1].children[0]
             └─ text-2    // path: [0, 1, 1]  → elements[0].children[1].children[1]
      container-3         // path: [1]
    ]
  }

  實際用途：

  // path = [0, 1, 0] 表示：
  elements[0]              // 第一個元素 (container-1)
    .children[1]           // 該元素的第二個子元素 (container-2)
      .children[0]         // 該子元素的第一個子元素 (button-1)
      
*/

// 建立元素索引 Map
export function buildElementMap(
    elements: ElementSchema[],
    map: Map<string, ElementNode> = new Map()
): Map<string, ElementNode> {

    function traverse(
        elements: ElementSchema[],
        parent: ContainerElementSchema | null = null,
        currentPath: number[] = [],
        depth: number = 0
    ) {
        elements.forEach((element, index) => {
            const elementPath = [...currentPath, index];

            // 存入 Map
            map.set(element.id, {
                element: element,
                parent: parent,
                path: elementPath,
                depth: depth
            });

            // 如果是 Container，遞歸處理子元素
            if (element.componentId === ComponentIdEnums.container) {
                const containerElement = element as ContainerElementSchema;
                traverse(
                    containerElement.children,
                    containerElement,
                    elementPath,
                    depth + 1
                );
            }
        });
    }

    map.clear();
    traverse(elements);
    return map;
}