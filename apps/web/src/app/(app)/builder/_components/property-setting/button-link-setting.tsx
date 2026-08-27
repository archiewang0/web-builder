import classNames from 'classnames';
import { useSchemaStore } from '@/store/use-schema-store';

export interface ButtonLinkSettingProps {
    elementId: string;
    href: string;
    onChange: (href: string) => void;
}

// '#' 開頭 = 捲動到某個元素；其餘一律當外部網址。跟 store 裡的欄位註解是同一套判斷。
const isScrollHref = (href: string) => href.startsWith('#');

const toggleClassName = (checked: boolean) =>
    classNames(
        'flex-1 text-center text-xs cursor-pointer rounded px-2 py-1 border border-transparent transition-colors',
        'has-[:checked]:border-blue-400 has-[:checked]:bg-blue-50 has-[:checked]:text-blue-600',
        !checked && 'text-gray-600'
    );

export function ButtonLinkSetting({ elementId, href, onChange }: ButtonLinkSettingProps) {
    // 訂閱 elementMap 才能列出「其他元素」給捲動目標的下拉選單選——它已經是
    // 攤平過的 id → element 索引，不用自己再寫一次遞迴遍歷 schema.elements。
    const elementMap = useSchemaStore((state) => state.elementMap);
    const isScroll = isScrollHref(href);
    const scrollTargetId = isScroll ? href.slice(1) : '';

    const targets = Array.from(elementMap.values()).filter((node) => node.element.id !== elementId);

    const handleModeChange = (scroll: boolean) => {
        if (!scroll) {
            onChange('');
            return;
        }
        onChange(targets[0] ? `#${targets[0].element.id}` : '#');
    };

    return (
        <div className="p-2 border border-gray-200 rounded-lg space-y-2">
            <label className="block text-xs font-medium text-gray-700">按鈕連結</label>

            <div className="flex items-center gap-2">
                <label className={toggleClassName(!isScroll)}>
                    <input
                        type="radio"
                        name={`button-link-mode-${elementId}`}
                        className="hidden"
                        checked={!isScroll}
                        onChange={() => handleModeChange(false)}
                    />
                    網址
                </label>
                <label className={toggleClassName(isScroll)}>
                    <input
                        type="radio"
                        name={`button-link-mode-${elementId}`}
                        className="hidden"
                        checked={isScroll}
                        onChange={() => handleModeChange(true)}
                    />
                    捲動至元素
                </label>
            </div>

            {isScroll ? (
                <select
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500"
                    value={scrollTargetId}
                    onChange={(e) => onChange(e.target.value ? `#${e.target.value}` : '#')}
                >
                    <option value="">請選擇目標元素</option>
                    {targets.map((node) => {
                        const label =
                            'content' in node.element && node.element.content
                                ? `${node.element.elementType}：${node.element.content.slice(0, 12)}`
                                : `${node.element.elementType}（${node.element.id}）`;
                        return (
                            <option key={node.element.id} value={node.element.id}>
                                {label}
                            </option>
                        );
                    })}
                </select>
            ) : (
                <input
                    type="text"
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-mono focus:ring-2 focus:ring-blue-500"
                    value={href}
                    placeholder="https://... 網址"
                    onChange={(e) => onChange(e.target.value)}
                />
            )}

            {href && (
                <button
                    type="button"
                    onClick={() => onChange('')}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                    清除連結
                </button>
            )}
        </div>
    );
}
