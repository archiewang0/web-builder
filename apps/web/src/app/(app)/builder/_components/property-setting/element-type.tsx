import { ElementTypeEnums } from '@/lib/schema';

interface ElementTypeProps {
    elementType: ElementTypeEnums;
}

// 獲取元素類型的顯示名稱
function getElementTypeName(elementType: ElementTypeEnums): string {
    switch (elementType) {
        case ElementTypeEnums.text:
            return '文字 (Text)';
        case ElementTypeEnums.image:
            return '圖片 (Image)';
        case ElementTypeEnums.button:
            return '按鈕 (Button)';
        case ElementTypeEnums.container:
            return '容器 (Container)';
        default:
            return '未知元素';
    }
}

export function ElementType({ elementType }: ElementTypeProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">元素類型</label>
            <div className=" p-2 border border-gray-200 rounded-lg ">
                <div className="bg-gray-50 px-3 py-2 rounded border text-sm">
                    {getElementTypeName(elementType)}
                </div>
            </div>
        </div>
    );
}
