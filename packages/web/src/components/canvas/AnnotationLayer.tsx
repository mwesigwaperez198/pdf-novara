import React, { useRef, useState, useEffect } from 'react';
import type { PageObject, TextObjectData, ShapeData, TextContentItem } from '../../core/types/document';

interface AnnotationLayerProps {
  pageIndex: number;
  width: number;
  height: number;
  objects: PageObject[];
  textContent: TextContentItem[];
  selectedIds: string[];
  editingTextId: string | null;
  onObjectMouseDown: (e: React.MouseEvent, obj: PageObject, pageIndex: number) => void;
  onObjectDoubleClick: (e: React.MouseEvent, obj: PageObject, pageIndex: number) => void;
  onTextEditComplete: (text: string) => void;
}

export function AnnotationLayer({
  pageIndex,
  width,
  height,
  objects,
  textContent,
  selectedIds,
  editingTextId,
  onObjectMouseDown,
  onObjectDoubleClick,
  onTextEditComplete,
}: AnnotationLayerProps) {
  return (
    <div className="absolute inset-0" style={{ width, height, pointerEvents: 'none' }}>
      {textContent.map((item) => {
        const textTop = height - item.y - item.height;
        return (
          <div
            key={item.id}
            className="absolute select-none"
            style={{
              left: item.x,
              top: textTop,
              fontSize: `${item.fontSize}px`,
              fontFamily: item.fontFamily,
              fontWeight: item.fontWeight,
              color: '#333',
              whiteSpace: 'pre',
              lineHeight: 1.2,
              opacity: 0.4,
              pointerEvents: 'none',
            }}
          >
            {item.str}
          </div>
        );
      })}

      {objects.map((obj) => {
        const isSelected = selectedIds.includes(obj.id);

        if (obj.type === 'text') {
          const data = obj.data as TextObjectData;
          if (editingTextId === obj.id) {
            return (
              <InlineTextEdit
                key={obj.id}
                obj={obj}
                data={data}
                onComplete={onTextEditComplete}
              />
            );
          }
          return (
            <div
              key={obj.id}
              className="absolute cursor-move select-none"
              style={{
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                fontSize: `${data.fontSize}px`,
                fontFamily: data.fontFamily,
                fontWeight: data.fontWeight,
                fontStyle: data.fontStyle,
                color: data.color,
                textAlign: data.alignment as 'left' | 'center' | 'right',
                lineHeight: data.lineHeight,
                whiteSpace: 'pre-wrap',
                overflow: 'hidden',
                pointerEvents: 'auto',
                border: isSelected ? '2px solid #3b82f6' : '1px solid transparent',
                backgroundColor: isSelected ? 'rgba(59,130,246,0.05)' : 'transparent',
                padding: '2px 4px',
                borderRadius: '2px',
              }}
              onMouseDown={(e) => onObjectMouseDown(e, obj, pageIndex)}
              onDoubleClick={(e) => onObjectDoubleClick(e, obj, pageIndex)}
            >
              {data.text}
            </div>
          );
        }

        if (obj.type === 'shape') {
          const data = obj.data as ShapeData;
          const isCircle = data.shapeType === 'circle';
          return (
            <div
              key={obj.id}
              className="absolute cursor-move"
              style={{
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                transform: `rotate(${obj.rotation}deg)`,
                border: `${data.strokeWidth}px solid ${data.strokeColor}`,
                borderRadius: isCircle ? '50%' : '2px',
                backgroundColor: data.fillColor === 'transparent' ? 'transparent' : data.fillColor,
                pointerEvents: 'auto',
                boxShadow: isSelected ? '0 0 0 2px #3b82f6' : 'none',
              }}
              onMouseDown={(e) => onObjectMouseDown(e, obj, pageIndex)}
            />
          );
        }

        if (obj.type === 'image') {
          const data = obj.data as { src?: string };
          return (
            <img
              key={obj.id}
              src={data.src}
              alt="Inserted"
              className="absolute cursor-move object-contain"
              style={{
                left: obj.x,
                top: obj.y,
                width: obj.width,
                height: obj.height,
                transform: `rotate(${obj.rotation}deg)`,
                pointerEvents: 'auto',
                border: isSelected ? '2px solid #3b82f6' : 'none',
              }}
              draggable={false}
              onMouseDown={(e) => onObjectMouseDown(e, obj, pageIndex)}
            />
          );
        }

        return null;
      })}
    </div>
  );
}

function InlineTextEdit({
  obj,
  data,
  onComplete,
}: {
  obj: PageObject;
  data: TextObjectData;
  onComplete: (text: string) => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(data.text);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  return (
    <textarea
      ref={textareaRef}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => onComplete(text)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onComplete(text);
        e.stopPropagation();
      }}
      className="absolute resize-none outline-none"
      style={{
        left: obj.x,
        top: obj.y,
        width: Math.max(obj.width, 150),
        height: Math.max(obj.height, data.fontSize * 3),
        fontSize: `${data.fontSize}px`,
        fontFamily: data.fontFamily,
        fontWeight: data.fontWeight,
        fontStyle: data.fontStyle,
        color: data.color,
        textAlign: data.alignment as 'left' | 'center' | 'right',
        lineHeight: data.lineHeight,
        padding: '4px',
        border: '2px solid #3b82f6',
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: '3px',
        pointerEvents: 'auto',
        zIndex: 200,
        boxShadow: '0 2px 8px rgba(59,130,246,0.2)',
      }}
    />
  );
}
