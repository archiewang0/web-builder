import classNames from 'classnames';
import { DEVICES } from '@/components/header/use-header';
import { useHeaderStore } from '@/store/use-header-store';

interface DeviceSwitcherProps {
    className?: string;
}

// Toolbar（編輯模式）跟 PreviewFloatingControls（預覽模式）都要切換裝置預覽寬度，共用同一份。
export function DeviceSwitcher({ className }: DeviceSwitcherProps) {
    const activeDevice = useHeaderStore((state) => state.activeDevice);
    const setActiveDevice = useHeaderStore((state) => state.setActiveDevice);

    return (
        <div className={classNames('justify-center flex items-center gap-1', className)}>
            {DEVICES.map((device) => (
                <button
                    key={device.id}
                    onClick={() => setActiveDevice(device.id)}
                    className={classNames('p-2 rounded-lg transition-colors', {
                        'bg-blue-500 text-white shadow-md': activeDevice === device.id,
                        'hover:bg-gray-100 text-gray-600': activeDevice !== device.id,
                    })}
                    title={device.name}
                >
                    <device.icon className="w-4 h-4" />
                </button>
            ))}
        </div>
    );
}
