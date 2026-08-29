import { PresetIdEnums } from '@/lib/schema';

interface ElementVariantProps {
    variant: PresetIdEnums;
}

// 目前只有 navbar 樣板會標記這個欄位（見 schema.ts 的 ContainerElementSchema.variant
// 註解），未來新增樣板只要多一個 case，不用改呼叫端的判斷邏輯。
function getVariantName(variant: PresetIdEnums): string {
    switch (variant) {
        case PresetIdEnums.navbar:
            return '導覽列樣板 (Navbar)';
        default:
            return variant;
    }
}

// 只有 'variant' in element 且有值時，呼叫端才會渲染這個元件——手動疊出來的
// 一般 container 不會有這個欄位，不會多顯示這一塊。
export function ElementVariant({ variant }: ElementVariantProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">樣板來源</label>
            <div className=" p-2 border border-gray-200 rounded-lg ">
                <div className="bg-gray-50 px-3 py-2 rounded border text-sm text-gray-600">
                    {getVariantName(variant)}
                </div>
            </div>
        </div>
    );
}
