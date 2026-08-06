import { Monitor, Smartphone, Tablet } from "lucide-react";

export interface DeviceType {
  id: DeviceIdEnums;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  width: string;
}

export enum DeviceIdEnums {
    desktop = 'desktop',
    tablet = 'tablet',
    mobile = 'mobile'
}

// 裝置清單為靜態資料，不需要放進 store
export const DEVICES: DeviceType[] = [
    { id: DeviceIdEnums.desktop , name: '桌面', icon: Monitor, width: '100%' },
    { id: DeviceIdEnums.tablet , name: '平板', icon: Tablet, width: '768px' },
    { id: DeviceIdEnums.mobile , name: '手機', icon: Smartphone, width: '375px' },
];
