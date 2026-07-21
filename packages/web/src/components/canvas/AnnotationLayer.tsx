import { useState, useRef, useCallback, useEffect } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import type { PageObject, TextObjectData, TextContentItem } from '../../core/types/document';

interface AnnotationLayerProps {
  pageIndex: number;
  width: number;
  height: number;
  objects: PageObject[];
  textContent: TextContentItem[];
}

export function AnnotationLayer({
  pageIndex,
  width,
  height,
  objects,
  textContent,
}: AnnotationLayerProps) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const toolOptions = useEditorStore((s) => s.toolOptions);
  const selectedElements = useEditorStore((s) => s.selectedElements);
  const selectElement = useEditorStore((s) => s.selectElement);
  const layerRef = useRef<HTMLDivElement>(null);
  const [editingText, setEditingText] = useState<string | null>(null);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (!layerRef.current) return;
      const rect = layerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (activeTool === 'text') {
        const newText: TextObjectData = {
          text: 'Click to edit',
          fontSize: toolOptions.fontSize,
          fontFamily: toolOptions.fontFamily,
          fontWeight: toolOptions.fontWeight,
          fontStyle: 'normal',
          color: toolOptions.strokeColor,
          alignment: 'left',
          lineHeight: 1.5,
        };

        const event = new CustomEvent('add-text-object', {
          detail: { pageIndex, x, y, data: newText },
        });
        window.dispatchEvent(event);
      }
    },
    [activeTool, toolOptions, pageIndex]
  );

  return (
    <div
      ref={layerRef}
      className="absolute inset-0"
      style={{ width, height }}
      onClick={handleCanvasClick}
    >
      {textContent.map((item) => (
        <div
          key={item.id}
          className="absolute select-none"
          style={{
            left: item.x,
            top: item.y,
            fontSize: `${item.fontSize}px`,
            fontFamily: item.fontFamily,
            fontWeight: item.fontWeight,
            color: item.color,
            whiteSpace: 'pre',
            lineHeight: 1.2,
          }}
        >
          {item.str}
        </div>
      ))}

      {objects.map((obj) => (
        <div
          key={obj.id}
          className={`absolute border-2 ${
            selectedElements.includes(obj.id)
              ? 'border-nova-400 ring-2 ring-nova-400/30'
              : 'border-transparent hover:border-nova-300/50'
          }`}
          style={{
            left: obj.x,
            top: obj.y,
            width: obj.width,
            height: obj.height,
            transform: `rotate(${obj.rotation}deg)`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            selectElement(obj.id);
          }}
        >
          {obj.type === 'text' && (
            <div
              className="w-full h-full p-1 overflow-hidden cursor-text"
              style={{
                fontSize: `${(obj.data as TextObjectData).fontSize}px`,
                fontFamily: (obj.data as TextObjectData).fontFamily,
                fontWeight: (obj.data as TextObjectData).fontWeight,
                color: (obj.data as TextObjectData).color,
                fontStyle: (obj.data as TextObjectData).fontStyle,
                textAlign: (obj.data as TextObjectData).alignment,
              }}
            >
              {(obj.data as TextObjectData).text}
            </div>
          )}

          {obj.type === 'shape' && (
            <div
              className="w-full h-full"
              style={{
                border: `${(obj.data as PageObject['data'] & { strokeWidth?: number }).strokeWidth ?? 2}px solid ${
                  (obj.data as PageObject['data'] & { strokeColor?: string }).strokeColor ?? '#000'
                }`,
                borderRadius: obj.data.shapeType === 'circle' ? '50%' : '0',
                backgroundColor: (obj.data as PageObject['data'] & { fillColor?: string }).fillColor ?? 'transparent',
              }}
            />
          )}

          {obj.type === 'image' && (
            <img
              src={(obj.data as PageObject['data'] & { src?: string }).src}
              alt="Inserted"
              className="w-full h-full object-contain"
              draggable={false}
            />
          )}
        </div>
      ))}
    </div>
  );
}
