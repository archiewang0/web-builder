

export interface ContentTextareaProps {
    context?: string 
    row?: number
    handleContentChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export function ContentTextarea({ context = '' , row = 3, handleContentChange }: ContentTextareaProps) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">內容</label>
            <textarea
                className="w-full px-3 py-2 bg-transparent border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                rows={row}
                value={context}
                onChange={handleContentChange}
            />
        </div>
    )
}