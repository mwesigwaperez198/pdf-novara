import { useState, useRef, useEffect, useCallback } from 'react';
import type { TextContentItem } from '../../core/types/document';

interface TextLayerProps {
  items: TextContentItem[];
  pageWidth: number;
  pageHeight: number;
  isEditing: boolean;
  onItemEdit: (itemId: string, newText: string) => void;
  onItemDelete: (itemId: string) => void;
  onEditingChange: (editing: boolean) => void;
}

export function TextLayer({
  items,
  pageWidth,
  pageHeight,
  isEditing,
  onItemEdit,
  onItemDelete,
  onEditingChange,
}: TextLayerProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (activeId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [activeId]);

  const handleItemClick = useCallback(
    (item: TextContentItem) => {
      if (isEditing && activeId) return;
      setActiveId(item.id);
      setEditValue(item.str);
      onEditingChange(true);
    },
    [isEditing, activeId, onEditingChange]
  );

  const handleConfirm = useCallback(() => {
    if (activeId) {
      onItemEdit(activeId, editValue);
      setActiveId(null);
      onEditingChange(false);
    }
  }, [activeId, editValue, onItemEdit, onEditingChange]);

  const handleDelete = useCallback(() => {
    if (activeId) {
      onItemDelete(activeId);
      setActiveId(null);
      onEditingChange(false);
    }
  }, [activeId, onItemDelete, onEditingChange]);

  const handleCancel = useCallback(() => {
    setActiveId(null);
    onEditingChange(false);
  }, [onEditingChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleConfirm();
      }
      if (e.key === 'Escape') {
        handleCancel();
      }
      e.stopPropagation();
    },
    [handleConfirm, handleCancel]
  );

  return (
    <div
      className="absolute inset-0"
      style={{
        width: pageWidth,
        height: pageHeight,
        pointerEvents: isEditing ? 'none' : 'auto',
      }}
    >
      {items.map((item) => {
        if (!item.str.trim()) return null;

        const textTop = pageHeight - item.y - item.height;
        const isActive = activeId === item.id;
        const isHovered = hoveredId === item.id;

        return (
          <div
            key={item.id}
            className="absolute"
            style={{
              left: item.x,
              top: textTop,
              width: item.width,
              height: item.height,
              fontSize: `${item.fontSize}px`,
              fontFamily: item.fontFamily,
              fontWeight: item.fontWeight,
              lineHeight: 1,
              whiteSpace: 'pre',
              cursor: 'text',
              color: 'transparent',
              pointerEvents: 'auto',
              userSelect: 'none',
            }}
            onMouseEnter={() => !activeId && setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            onClick={(e) => {
              e.stopPropagation();
              handleItemClick(item);
            }}
          >
            {item.str}

            {isHovered && !isActive && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  borderRadius: '2px',
                }}
              />
            )}

            {isActive && (
              <div
                className="absolute z-50"
                style={{
                  left: 0,
                  top: -4,
                  minWidth: Math.max(item.width, 120),
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-white rounded-lg shadow-2xl border border-surface-200 overflow-hidden">
                  <textarea
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleConfirm}
                    className="w-full px-3 py-2 text-sm text-surface-900 outline-none resize-none bg-white"
                    style={{
                      fontFamily: item.fontFamily,
                      fontSize: `${Math.min(item.fontSize, 16)}px`,
                      minHeight: '36px',
                      maxHeight: '200px',
                    }}
                    rows={1}
                  />
                  <div className="flex items-center gap-1 px-2 py-1.5 bg-surface-50 border-t border-surface-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirm();
                      }}
                      className="px-2 py-0.5 text-[11px] font-medium text-white bg-nova-600 hover:bg-nova-700 rounded transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                      }}
                      className="px-2 py-0.5 text-[11px] font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      Delete
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel();
                      }}
                      className="px-2 py-0.5 text-[11px] font-medium text-surface-500 hover:bg-surface-100 rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
