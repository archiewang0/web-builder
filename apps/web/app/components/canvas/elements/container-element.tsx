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
    columns: number;
    childrenElements?: ElementSchema[];
    SchemaElementRender: (data: ElementSchema) => JSX.Element;
}

export function ContainerElement({
    id,
    elementProperty,
    columns,
    childrenElements,
    SchemaElementRender,
}: ContainerElementProps) {
    return (
        <div
            key={id}
            {...elementProperty}
            className={classNames(
                'relative w-full pointer-events-auto rounded-lg p-5 border-2 border-dashed hover:shadow-md cursor-pointer transition-all',
                columns > 1 && `grid gap-2 ${GRID_COLS[columns] ?? 'grid-cols-2'}`,
                elementProperty['selected-style'] || 'border-gray-200'
            )}
        >
            <span className="absolute top-0 left-0 bg-gray-200 !text-xs">{id}</span>
            {childrenElements?.map((child) => SchemaElementRender(child))}
        </div>
    );
}
