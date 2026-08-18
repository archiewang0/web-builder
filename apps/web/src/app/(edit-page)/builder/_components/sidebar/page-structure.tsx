import { useState } from 'react';
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, Monitor } from 'lucide-react';
import { useSchemaStore, BODY_ELEMENT_ID } from '@/store/use-schema-store';
import { useSelectedElementStore } from '@/store/use-selected-element-store';
import { TreeNode } from './tree-node';

// 頁面結構樹：展開/收合整棵樹、顯示畫布上的元素層級
export function PageStructure() {
    const schema = useSchemaStore((state) => state.schema);
    const selectedElement = useSelectedElementStore((state) => state.selectedElement);
    const setSelectedElement = useSelectedElementStore((state) => state.setSelectedElement);
    const [treeExpanded, setTreeExpanded] = useState(true);
    // New object reference on every click so TreeNode's useEffect always fires
    const [expandSignal, setExpandSignal] = useState<{ expand: boolean } | null>(null);
    const [isBodyExpanded, setIsBodyExpanded] = useState(true);

    const toggleAll = () => {
        const next = !treeExpanded;
        setTreeExpanded(next);
        setExpandSignal({ expand: next });
        setIsBodyExpanded(next);
    };

    const isBodySelected = selectedElement === BODY_ELEMENT_ID;

    return (
        <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-700">頁面結構</h2>
                <button
                    type="button"
                    onClick={toggleAll}
                    title={treeExpanded ? '全部收合' : '全部展開'}
                    className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    {treeExpanded ? (
                        <ChevronsDownUp className="w-3.5 h-3.5" />
                    ) : (
                        <ChevronsUpDown className="w-3.5 h-3.5" />
                    )}
                </button>
            </div>
            <div className="space-y-0.5">
                {/* Body：畫布的根節點，每份頁面固定只有一個，不能刪除也不能拖曳新增，只能調背景 */}
                <div
                    className={`flex items-center space-x-1 p-1.5 rounded cursor-pointer transition-colors ${
                        isBodySelected ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    onClick={(e) => {
                        e.stopPropagation();
                        setSelectedElement(BODY_ELEMENT_ID);
                    }}
                >
                    <button
                        type="button"
                        className="p-0.5 hover:bg-gray-200 rounded"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsBodyExpanded((prev) => !prev);
                        }}
                    >
                        {isBodyExpanded ? (
                            <ChevronDown className="w-3 h-3" />
                        ) : (
                            <ChevronRight className="w-3 h-3" />
                        )}
                    </button>
                    <Monitor className={`w-4 h-4 ${isBodySelected ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="text-xs truncate">Body</span>
                </div>

                {isBodyExpanded &&
                    (schema.elements.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">尚無元素</p>
                    ) : (
                        schema.elements.map((element) => (
                            <TreeNode
                                key={element.id}
                                element={element}
                                depth={1}
                                expandSignal={expandSignal}
                            />
                        ))
                    ))}
            </div>
        </div>
    );
}
