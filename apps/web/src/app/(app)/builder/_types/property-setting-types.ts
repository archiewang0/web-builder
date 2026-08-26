import { StyleProps } from '@/lib/schema';

// 面板永遠是對「目前選到的裝置那一層」讀寫攤平後的樣式，不是巢狀的
// StylesSchema——巢狀結構只在 store／schema 裡，面板跟畫布看到的都是
// resolveStyles 解析後的攤平物件，見 lib/responsive-styles.ts。
export type StyleChangeHandler = (partial: Partial<StyleProps>) => void;
