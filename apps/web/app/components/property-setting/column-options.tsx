const COLUMNS = [1, 2, 3, 4, 5];

interface ColumnOptionsProps {
    value: number;
    onChange: (columns: number) => void;
}

export function ColumnOptions({ value, onChange }: ColumnOptionsProps) {
    return (
        <div className="flex space-x-1">
            {COLUMNS.map((n) => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    className={`flex-1 py-2 text-xs border rounded transition-colors ${
                        value === n
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                >
                    {n}
                </button>
            ))}
        </div>
    );
}
