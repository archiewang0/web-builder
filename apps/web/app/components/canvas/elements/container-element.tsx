import classNames from 'classnames';
import { JSX } from 'react';
import { ElementSchema } from '@/app/context/schema-context';

const GRID_COLS: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
};

interface ContainerElementProps {
    id: string;
    elementProperty: { [key: string]: any };
    columns?: number;
    childrenElements?: ElementSchema[];
    SchemaElementRender: (data: ElementSchema) => JSX.Element;
    isPreviewMode?: boolean;
}

export function ContainerElement({
    id,
    elementProperty,
    columns,
    childrenElements,
    SchemaElementRender,
    isPreviewMode = false,
}: ContainerElementProps) {
    const isFlexMode = columns === undefined;

    return (
        <div
            key={id}
            {...elementProperty}
            className={classNames(
                'relative w-full pointer-events-auto rounded-lg transition-all',
                !isPreviewMode && 'p-5 border-2 border-dashed hover:shadow-md cursor-pointer',
                isFlexMode && 'flex flex-wrap gap-2',
                !isFlexMode && columns > 1 && `grid gap-2 ${GRID_COLS[columns] ?? 'grid-cols-2'}`,
                !isPreviewMode && (elementProperty['selected-style'] || 'border-gray-200')
            )}
        >
            {!isPreviewMode && (
                <span className="absolute top-0 left-0 bg-gray-200 !text-xs">{id}</span>
            )}
            {childrenElements?.map((child) => SchemaElementRender(child))}
        </div>
    );
}
