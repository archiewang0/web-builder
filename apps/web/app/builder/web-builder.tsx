'use client';
import React from 'react';

import { Header } from '../components/header';
import { useHeader } from '../components/header/use-header';
import { useSidebar } from '../components/sidebar/use-sidebar';
import { Sidebar } from '../components/sidebar';
import { useCanvas } from '../components/canvas/use-canvas';
import { Canvas } from '../components/canvas';
import { PropertySetting } from '../components/property-setting';
import { SchemaProvider } from '../context/schema-context';

const WebsiteBuilderEditor = () => {
    const { selectedElement, setSelectedElement } = useCanvas();
    const { devices, activeDevice, setActiveDevice } = useHeader();
    const { components, dragEndTaget, setDragEndTaget, dragStartTaget, setDragStartTaget } =
        useSidebar();

    return (
        <SchemaProvider>
            <div className="h-screen flex flex-col bg-gray-50">
                {/* 頂部工具欄 */}
                <Header
                    devices={devices}
                    activeDevice={activeDevice}
                    setActiveDevice={setActiveDevice}
                />

                <div className="flex-1 flex overflow-hidden">
                    {/* 左側組件面板 */}
                    <Sidebar
                        components={components}
                        selectedElement={selectedElement}
                        setSelectedElement={setSelectedElement}
                        setDragEndTaget={setDragEndTaget}
                        setDragStartTaget={setDragStartTaget}
                    />

                    {/* 中央畫布區域 */}
                    <Canvas
                        devices={devices}
                        activeDevice={activeDevice}
                        selectedElement={selectedElement}
                        setSelectedElement={setSelectedElement}

                        // dragStartTaget={dragStartTaget}
                        // dragEndTaget={dragEndTaget}
                    />

                    {/* 右側屬性面板 */}
                    <PropertySetting selectedElement={selectedElement} />
                </div>
            </div>
        </SchemaProvider>
    );
};

export default WebsiteBuilderEditor;
