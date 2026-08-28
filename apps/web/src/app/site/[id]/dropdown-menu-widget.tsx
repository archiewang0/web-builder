'use client';

import type { ReactNode } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';

// 正式站台的 client island：外殼（開合、定位、鍵盤導覽、點外部關閉）交給
// Radix DropdownMenu，trigger/panel 的實際內容仍是 render-schema.tsx 用
// RenderSchemaElement(s) 產生的 server-rendered 內容，當 children 傳進來。
export function DropdownMenuWidget({ trigger, panel }: { trigger: ReactNode; panel: ReactNode }) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            <DropdownMenuContent>{panel}</DropdownMenuContent>
        </DropdownMenu>
    );
}
