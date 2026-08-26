import { DeviceIdEnums, DEVICES } from '@/components/header/devices';
import type { StyleProps, StylesSchema } from '@/lib/schema';

// 舊版（改版前）存的頁面 styles 是攤平的 StyleProps，沒有 base 這個 key；
// 新格式一定有 base。用「有沒有 base」判斷，讀取時就地轉換，不用另外寫
// DB 遷移腳本——所有讀寫都走這個函式，資料自然統一成新格式。
function normalizeStyles(styles: unknown): StylesSchema {
    if (!styles || typeof styles !== 'object') return { base: {} };
    if ('base' in styles) return styles as StylesSchema;
    return { base: styles as StyleProps };
}

// device-first cascade：desktop 只看 base，tablet 疊加 tablet 覆寫，
// mobile 疊加 tablet + mobile 覆寫。editor／canvas 渲染跟屬性面板顯示都用這個
// 算「目前這個裝置實際看到的樣式」。
export function resolveStyles(styles: unknown, device: DeviceIdEnums): StyleProps {
    const normalized = normalizeStyles(styles);
    if (device === DeviceIdEnums.desktop) return normalized.base;
    if (device === DeviceIdEnums.tablet) return { ...normalized.base, ...normalized.tablet };
    return { ...normalized.base, ...normalized.tablet, ...normalized.mobile };
}

// 只寫入目前裝置對應的那一層，不動其他層——desktop 寫 base，tablet/mobile
// 寫自己那層的覆寫。切換裝置後再打開面板，會由 resolveStyles 往上 fallback
// 找到最近一層有值的設定，不用另外記錄「使用者上次調整的值」。
export function writeStyles(
    styles: unknown,
    device: DeviceIdEnums,
    patch: Partial<StyleProps>
): StylesSchema {
    const normalized = normalizeStyles(styles);
    if (device === DeviceIdEnums.desktop) {
        return { ...normalized, base: { ...normalized.base, ...patch } };
    }
    return { ...normalized, [device]: { ...normalized[device], ...patch } };
}

// 存檔前處理 blob url（找出待上傳／已上傳要置換）不是透過屬性面板，
// 要檢查所有層——使用者可能在 tablet/mobile 也設了不同的背景圖，只看 base
// 會漏掉。
export function getAllStyleLayers(styles: unknown): StyleProps[] {
    const normalized = normalizeStyles(styles);
    return [normalized.base, normalized.tablet ?? {}, normalized.mobile ?? {}];
}

// 把每一層都跑一次 mapper：回傳新物件代表這層要更新，回傳 null 代表這層維持
// 原樣。不會幫本來沒有 tablet/mobile 覆寫的元素憑空補一份空物件出來。
export function mapStyleLayers(
    styles: unknown,
    mapper: (layer: StyleProps) => StyleProps | null
): StylesSchema {
    const normalized = normalizeStyles(styles);
    const nextTablet = normalized.tablet ? mapper(normalized.tablet) : null;
    const nextMobile = normalized.mobile ? mapper(normalized.mobile) : null;
    return {
        base: mapper(normalized.base) ?? normalized.base,
        ...(normalized.tablet && { tablet: nextTablet ?? normalized.tablet }),
        ...(normalized.mobile && { mobile: nextMobile ?? normalized.mobile }),
    };
}

const BREAKPOINT_PX: Partial<Record<DeviceIdEnums, number>> = Object.fromEntries(
    DEVICES.filter((d) => d.id !== DeviceIdEnums.desktop).map((d) => [d.id, parseInt(d.width, 10)])
);

function toKebabCase(key: string) {
    return key.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase());
}

function toCssDeclarations(style: StyleProps): string {
    return Object.entries(style)
        .filter((entry): entry is [string, string] => entry[1] !== undefined)
        .map(([key, value]) => `${toKebabCase(key)}:${value} !important`)
        .join(';');
}

// 正式站台（site/[id]）沒有裝置切換器，是瀏覽器真實視窗尺寸在變化，
// tablet/mobile 覆寫要編譯成真正的 @media (max-width) 規則，讓瀏覽器依實際
// 寬度切換，不能像編輯器那樣直接把 resolveStyles 的結果當 inline style 套用。
//
// base 仍然維持現有做法、當成 inline style 直接套在元素上（render-schema.tsx
// 沒有改這部分）；inline style 的優先權比一般 CSS 規則高，一般的 @media
// 規則蓋不掉它，所以這裡產生的覆寫規則統一加 !important，才能真的蓋過 base
// 的 inline style。這些規則是系統產生、使用者不會手動維護，不算濫用
// !important。
export function buildResponsiveCss(elementId: string, styles: unknown): string {
    const normalized = normalizeStyles(styles);
    const rules: string[] = [];

    (
        [
            [DeviceIdEnums.tablet, normalized.tablet],
            [DeviceIdEnums.mobile, normalized.mobile],
        ] as const
    ).forEach(([device, layer]) => {
        if (!layer) return;
        const declarations = toCssDeclarations(layer);
        if (!declarations) return;
        const breakpoint = BREAKPOINT_PX[device];
        if (!breakpoint) return;
        // mobile 規則要排在 tablet 之後：兩者的 media condition 在窄螢幕時會
        // 同時成立（max-width:375px 成立時 max-width:768px 必然也成立），
        // selector 特異度又相同（都是 #id），最終誰生效看 CSS 來源順序，
        // 一定要 mobile 在後面才會贏過 tablet。
        rules.push(`@media (max-width:${breakpoint}px){#${elementId}{${declarations}}}`);
    });

    return rules.join('');
}
