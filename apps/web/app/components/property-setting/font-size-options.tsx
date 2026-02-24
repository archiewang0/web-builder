


export function FontSizeOptions(){
    return (
        <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">字體大小</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm">
                <option>12px</option>
                <option>14px</option>
                <option>16px</option>
                <option>18px</option>
                <option>20px</option>
                <option>24px</option>
                <option>28px</option>
                <option>32px</option>
                <option>36px</option>
            </select>
        </div>
    )
}