// 陰影用單一 boxShadow CSS 字串儲存，UI 上卻要拆成「大小」「顏色」兩個獨立欄位，
// 所以兩個欄位共用這組 parse/build，各自從目前的 boxShadow 讀出自己不管的那一半、
// 改完再組回完整字串，不會互相覆蓋對方的值。
// 格式固定是 `0px {size}px {size}px 0px {color}`——水平位移永遠 0、垂直位移跟模糊
// 半徑都等於 size，size 越大陰影越往下沉、也越暈開，是常見的「向下投影」效果。
export interface ShadowValue {
    size: number;
    color: string;
}

const SHADOW_PATTERN = /^0px (-?\d+(?:\.\d+)?)px \1px 0px (.+)$/;

export function parseShadow(boxShadow?: string): ShadowValue {
    if (!boxShadow) return { size: 0, color: '' };
    const match = boxShadow.match(SHADOW_PATTERN);
    if (!match) return { size: 0, color: '' };
    return { size: parseFloat(match[1]!), color: match[2]! };
}

// size <= 0 視為「沒有陰影」，直接清掉 boxShadow，不留下沒有視覺效果的空字串。
export function buildShadow({ size, color }: ShadowValue): string | undefined {
    if (size <= 0) return undefined;
    return `0px ${size}px ${size}px 0px ${color || 'rgba(0, 0, 0, 0.25)'}`;
}
