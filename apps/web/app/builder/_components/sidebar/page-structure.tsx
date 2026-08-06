import { useState } from 'react';
import { ChevronsDownUp, ChevronsUpDown } from 'lucide-react';
import { useSchemaStore } from '@/store/use-schema-store';
import { TreeNode } from './tree-node';

// 頁面結構樹：展開/收合整棵樹、顯示畫布上的元素層級
export function PageStructure() {
    const schema = useSchemaStore((state) => state.schema);
    const [treeExpanded, setTreeExpanded] = useState(true);
    // New object reference on every click so TreeNode's useEffect always fires
    const [expandSignal, setExpandSignal] = useState<{ expand: boolean } | null>(null);

    const toggleAll = () => {
        const next = !treeExpanded;
        setTreeExpanded(next);
        setExpandSignal({ expand: next });
    };

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
                {schema.elements.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">尚無元素</p>
                ) : (
                    schema.elements.map((element) => (
                        <TreeNode
                            key={element.id}
                            element={element}
                            depth={0}
                            expandSignal={expandSignal}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
