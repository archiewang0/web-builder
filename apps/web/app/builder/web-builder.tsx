'use client';
import React from 'react';

import { Header } from '../components/header';
import { useHeader } from '../components/header/useHeader';
import { useSidebar } from '../components/sidebar/useSidebar';
import { Sidebar } from '../components/sidebar';
import { useCanvas } from '../components/canvas/useCanvas';
import { Canvas } from '../components/canvas';
import { PropertySetting } from '../components/property-setting';

const WebsiteBuilderEditor = () => {
  const { selectedElement , setSelectedElement } = useCanvas()  
  const { devices , activeDevice , setActiveDevice } = useHeader()
  const { components , dragEndTaget , setDragEndTaget , dragStartTaget , setDragStartTaget  } = useSidebar()


  return (
    <div className="h-screen flex flex-col bg-gray-50">
      
      {/* 頂部工具欄 */}
      <Header 
        devices={devices} 
        activeDevice={activeDevice} 
        setActiveDevice={setActiveDevice}/>

      <div className="flex-1 flex overflow-hidden">

        {/* 左側組件面板 */}
        <Sidebar 
          components={components}
          setDragEndTaget={setDragEndTaget}
          setDragStartTaget={setDragStartTaget}
          />

        {/* 中央畫布區域 */}
        <Canvas 
          devices={devices} 
          activeDevice={activeDevice} 
          selectedElement={selectedElement} 
          setSelectedElement={setSelectedElement} 

          dragStartTaget={dragStartTaget}
          dragEndTaget={dragEndTaget}
          />

        {/* 右側屬性面板 */}
        <PropertySetting 
          selectedElement={selectedElement}
          />

      </div>
    </div>
  );
};

export default WebsiteBuilderEditor;
