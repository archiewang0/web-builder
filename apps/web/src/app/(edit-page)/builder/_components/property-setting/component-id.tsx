import { ComponentIdEnums } from '../sidebar/use-sidebar';

interface ComponentIdProps {
    componentId: ComponentIdEnums;
}

// 獲取元素類型的顯示名稱
function getElementTypeName(componentId: ComponentIdEnums): string {
    switch (componentId) {
        case ComponentIdEnums.text:
            return '文字 (Text)';
        case ComponentIdEnums.image:
            return '圖片 (Image)';
        case ComponentIdEnums.button:
            return '按鈕 (Button)';
        case ComponentIdEnums.container:
            return '容器 (Container)';
        default:
            return '未知元素';
    }
}

export function ComponentId({ componentId }: ComponentIdProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">元素類型</label>
            <div className=" p-2 border border-gray-200 rounded-lg ">
                <div className="bg-gray-50 px-3 py-2 rounded border text-sm">
                    {getElementTypeName(componentId)}
                </div>
            </div>
        </div>
    );
}
