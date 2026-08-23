// 「樣板」跟「組件」是兩回事：組件（ComponentIdEnums）是 schema 裡真的會存在
// 某個元素節點上的 componentId；樣板只是 sidebar 拖曳的入口，放開滑鼠後展開成
// 一整棵由既有組件（container/image/button...）組成的樹，插入 schema 的東西
// 都是貨真價實的既有組件，不會有任何節點的 componentId 是這裡的值。
// 用獨立的 enum、不跟 ComponentIdEnums 混在一起，就不用讓 schema 那邊一堆
// switch/型別聯集為了一個「其實不會真的存在於 schema 裡」的值多開分支。
export enum PresetIdEnums {
    navbar = 'preset-navbar',
}
