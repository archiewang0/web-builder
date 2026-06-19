'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
    headerExtra?: React.ReactNode;
}

export function CollapsibleSection({
    title,
    children,
    defaultOpen = true,
    headerExtra,
}: CollapsibleSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="flex items-center gap-1 text-xs font-medium text-black"
                >
                    {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    {title}
                </button>
                {headerExtra}
            </div>
            {isOpen && children}
        </div>
    );
}
