import { useRef, useCallback, useEffect, useState } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useEditorStore } from '../../store/useEditorStore';
import { PageRenderer } from './PageRenderer';
import { AnnotationLayer } from './AnnotationLayer';
import { TextLayer } from './TextLayer';
import type { PageObject, TextObjectData, ShapeData } from '../../core/types/document';

export function DocumentCanvas() {
  const doc = useDocumentStore((s) => s.getActiveDocument());
  const currentPage = useDocumentStore((s) => s.currentPage);
  const zoom = useDocumentStore((s) => s.zoom);
  const setCurrentPage = useDocumentStore((s) => s.setCurrentPage);
  const addPageObject = useDocumentStore((s) => s.addPageObject);
  const updatePageObject = useDocumentStore((s) => s.updatePageObject);
  const removePageObject = useDocumentStore((s) => s.removePageObject);
  const editTextItem = useDocumentStore((s) => s.editTextItem);
  const deleteTextItem = useDocumentStore((s) => s.deleteTextItem);
  const textEdits = useDocumentStore((s) => s.textEdits);
  const deletedTextIds = useDocumentStore((s) => s.deletedTextIds);
  const activeTool = useEditorStore((s) => s.activeTool);
  const toolOptions = useEditorStore((s) => s.toolOptions);
  const selectedElements = useEditorStore((s) => s.selectedElements);
  const selectElement = useEditorStore((s) => s.selectElement);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const containerRef = useRef<HTMLDivElement>(null);
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [drawPoints, setDrawPoints] = useState<{ x: number; y: number }[]>([]);
  const [shapePreview, setShapePreview] = useState<{
    pageIndex: number;
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null>(null);
  const [dragging, setDragging] = useState<{
    objId: string;
    pageIndex: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingPageIndex, setEditingPageIndex] = useState<number>(0);
  const [isTextLayerEditing, setIsTextLayerEditing] = useState(false);

  const handleTextItemEdit = useCallback(
    (itemId: string, newText: string) => {
      editTextItem(currentPage, itemId, newText);
    },
    [currentPage, editTextItem]
  );

  const handleTextItemDelete = useCallback(
    (itemId: string) => {
      deleteTextItem(currentPage, itemId);
    },
    [currentPage, deleteTextItem]
  );

  const getPageTextItems = useCallback(
    (pageIndex: number) => {
      const pageKey = `${doc?.id}-${pageIndex}`;
      const page = doc?.pages[pageIndex];
      if (!page) return [];

      const edits = textEdits[pageKey] ?? {};
      const deleted = deletedTextIds[pageKey] ?? new Set<string>();

      return page.textContent
        .filter((item) => !deleted.has(item.id))
        .map((item) =>
          edits[item.id] !== undefined
            ? { ...item, str: edits[item.id] }
            : item
        );
    },
    [doc, textEdits, deletedTextIds]
  );

  const getPageCoords = useCallback(
    (e: React.MouseEvent, pageEl: HTMLElement): { x: number; y: number } => {
      const rect = pageEl.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) / zoom,
        y: (e.clientY - rect.top) / zoom,
      };
    },
    [zoom]
  );

  const handlePageMouseDown = useCallback(
    (e: React.MouseEvent, pageIndex: number, pageEl: HTMLElement) => {
      if (e.button !== 0) return;
      const coords = getPageCoords(e, pageEl);

      switch (activeTool) {
        case 'select':
          clearSelection();
          break;

        case 'text': {
          addPageObject(pageIndex, {
            type: 'text',
            pageIndex,
            x: coords.x,
            y: coords.y,
            width: 200,
            height: 32,
            rotation: 0,
            zIndex: 100,
            data: {
              text: 'Double-click to edit',
              fontSize: 14,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 400,
              fontStyle: 'normal',
              color: toolOptions.strokeColor,
              alignment: 'left',
              lineHeight: 1.4,
            } as TextObjectData,
          });
          break;
        }

        case 'draw': {
          setIsDrawing(true);
          setDrawPoints([{ x: coords.x, y: coords.y }]);
          break;
        }

        case 'shape': {
          setShapePreview({
            pageIndex,
            startX: coords.x,
            startY: coords.y,
            endX: coords.x,
            endY: coords.y,
          });
          break;
        }

        case 'eraser': {
          const page = doc?.pages[pageIndex];
          if (!page) break;
          for (const obj of [...page.objects].reverse()) {
            if (
              coords.x >= obj.x &&
              coords.x <= obj.x + obj.width &&
              coords.y >= obj.y &&
              coords.y <= obj.y + obj.height
            ) {
              removePageObject(pageIndex, obj.id);
              break;
            }
          }
          break;
        }
      }
    },
    [activeTool, toolOptions, doc, getPageCoords, addPageObject, removePageObject, clearSelection]
  );

  const handlePageMouseMove = useCallback(
    (e: React.MouseEvent, _pageIndex: number, pageEl: HTMLElement) => {
      const coords = getPageCoords(e, pageEl);

      if (isDrawing) {
        setDrawPoints((prev) => [...prev, { x: coords.x, y: coords.y }]);

        const canvas = drawingCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const last = drawPoints[drawPoints.length - 1];
            if (last) {
              ctx.strokeStyle = toolOptions.strokeColor;
              ctx.lineWidth = toolOptions.strokeWidth;
              ctx.lineCap = 'round';
              ctx.lineJoin = 'round';
              ctx.beginPath();
              ctx.moveTo(last.x, last.y);
              ctx.lineTo(coords.x, coords.y);
              ctx.stroke();
            }
          }
        }
      }

      if (shapePreview) {
        setShapePreview((prev) =>
          prev ? { ...prev, endX: coords.x, endY: coords.y } : null
        );
      }

      if (dragging) {
        updatePageObject(dragging.pageIndex, dragging.objId, {
          x: coords.x - dragging.offsetX,
          y: coords.y - dragging.offsetY,
        });
      }
    },
    [isDrawing, shapePreview, dragging, drawPoints, toolOptions, getPageCoords, updatePageObject]
  );

  const handlePageMouseUp = useCallback(
    (_e: React.MouseEvent, pageIndex: number) => {
      if (isDrawing && drawPoints.length > 1) {
        const minX = Math.min(...drawPoints.map((p) => p.x));
        const minY = Math.min(...drawPoints.map((p) => p.y));
        const maxX = Math.max(...drawPoints.map((p) => p.x));
        const maxY = Math.max(...drawPoints.map((p) => p.y));
        const w = Math.max(maxX - minX, 2);
        const h = Math.max(maxY - minY, 2);

        addPageObject(pageIndex, {
          type: 'shape',
          pageIndex,
          x: minX,
          y: minY,
          width: w,
          height: h,
          rotation: 0,
          zIndex: 100,
          data: {
            shapeType: 'line',
            strokeColor: toolOptions.strokeColor,
            strokeWidth: toolOptions.strokeWidth,
            fillColor: 'transparent',
            fillOpacity: 1,
          } as ShapeData,
        });

        const canvas = drawingCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        setIsDrawing(false);
        setDrawPoints([]);
      }

      if (shapePreview) {
        const x = Math.min(shapePreview.startX, shapePreview.endX);
        const y = Math.min(shapePreview.startY, shapePreview.endY);
        const w = Math.abs(shapePreview.endX - shapePreview.startX);
        const h = Math.abs(shapePreview.endY - shapePreview.startY);

        if (w > 3 && h > 3) {
          addPageObject(pageIndex, {
            type: 'shape',
            pageIndex,
            x,
            y,
            width: w,
            height: h,
            rotation: 0,
            zIndex: 100,
            data: {
              shapeType: toolOptions.shapeType === 'line' ? 'rectangle' : toolOptions.shapeType,
              strokeColor: toolOptions.strokeColor,
              strokeWidth: Math.max(toolOptions.strokeWidth, 2),
              fillColor: toolOptions.fillColor === 'transparent' ? 'transparent' : toolOptions.fillColor,
              fillOpacity: toolOptions.opacity,
            } as ShapeData,
          });
        }
        setShapePreview(null);
      }

      if (dragging) {
        setDragging(null);
      }
    },
    [isDrawing, drawPoints, shapePreview, dragging, toolOptions, addPageObject]
  );

  const handleObjectMouseDown = useCallback(
    (e: React.MouseEvent, obj: PageObject, pageIndex: number) => {
      e.stopPropagation();
      const pageEl = (e.target as HTMLElement).closest('[data-page-container]');
      if (!pageEl) return;
      const coords = getPageCoords(e, pageEl as HTMLElement);

      if (activeTool === 'select') {
        selectElement(obj.id);
        setDragging({
          objId: obj.id,
          pageIndex,
          offsetX: coords.x - obj.x,
          offsetY: coords.y - obj.y,
        });
      }
    },
    [activeTool, selectElement, getPageCoords]
  );

  const handleObjectDoubleClick = useCallback(
    (e: React.MouseEvent, obj: PageObject, pageIndex: number) => {
      e.stopPropagation();
      if (obj.type === 'text') {
        setEditingTextId(obj.id);
        setEditingPageIndex(pageIndex);
      }
    },
    []
  );

  const handleTextEditComplete = useCallback(
    (text: string) => {
      if (editingTextId) {
        updatePageObject(editingPageIndex, editingTextId, {
          data: {
            text,
            fontSize: 14,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontStyle: 'normal',
            color: toolOptions.strokeColor,
            alignment: 'left',
            lineHeight: 1.4,
          } as TextObjectData,
        });
        setEditingTextId(null);
      }
    },
    [editingTextId, editingPageIndex, toolOptions.strokeColor, updatePageObject]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (editingTextId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElements.length > 0) {
          for (const id of selectedElements) {
            removePageObject(currentPage, id);
          }
          clearSelection();
        }
      }
      if (e.key === 'Escape') {
        clearSelection();
        setEditingTextId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingTextId, selectedElements, currentPage, removePageObject, clearSelection]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        useDocumentStore.getState().setZoom(zoom + delta);
      }
    },
    [zoom]
  );

  const handleScroll = useCallback(() => {
    if (!containerRef.current || !doc) return;
    const pageElements = containerRef.current.querySelectorAll('[data-page-index]');
    let visiblePage = 0;
    pageElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const containerRect = containerRef.current!.getBoundingClientRect();
      if (rect.top < containerRect.top + containerRect.height / 2) {
        visiblePage = parseInt(el.getAttribute('data-page-index') ?? '0');
      }
    });
    if (visiblePage !== currentPage) {
      setCurrentPage(visiblePage);
    }
  }, [doc, currentPage, setCurrentPage]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const cursorMap: Record<string, string> = {
    select: 'default',
    hand: 'grab',
    text: 'crosshair',
    draw: 'crosshair',
    image: 'crosshair',
    shape: 'crosshair',
    eraser: 'crosshair',
    highlight: 'crosshair',
    stamp: 'crosshair',
    signature: 'crosshair',
  };

  const toolLabel: Record<string, string> = {
    select: 'Select — click text to edit, click objects to select, drag to move',
    hand: 'Hand Tool — scroll to pan',
    text: 'Text Tool — click on page to add text',
    draw: 'Draw Tool — click and drag to draw',
    shape: 'Shape Tool — click and drag to create a shape',
    eraser: 'Eraser — click an object to remove it',
  };

  if (!doc) return null;

  return (
    <div
      ref={containerRef}
      data-canvas-container
      className="h-full overflow-auto bg-surface-900"
      style={{ cursor: cursorMap[activeTool] ?? 'default' }}
      onWheel={handleWheel}
    >
      {(activeTool !== 'hand') && (
        <div className="sticky top-0 z-20 flex items-center justify-center py-1 pointer-events-none">
          <div className="bg-nova-600/90 text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
            {toolLabel[activeTool] ?? activeTool}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center py-8 gap-6 min-h-full">
        {doc.pages.map((page, index) => (
          <div
            key={page.index}
            data-page-index={index}
            className="relative shrink-0"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
          >
            <div
              data-page-container
              className="bg-white relative overflow-hidden"
              style={{
                width: page.width,
                height: page.height,
                boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              }}
              onMouseDown={(e) => handlePageMouseDown(e, index, e.currentTarget)}
              onMouseMove={(e) => handlePageMouseMove(e, index, e.currentTarget)}
              onMouseUp={(e) => handlePageMouseUp(e, index)}
            >
              <PageRenderer
                pageIndex={index}
                width={page.width}
                height={page.height}
              />

              <AnnotationLayer
                pageIndex={index}
                width={page.width}
                height={page.height}
                objects={page.objects}
                textContent={page.textContent}
                selectedIds={selectedElements}
                editingTextId={editingTextId}
                onObjectMouseDown={handleObjectMouseDown}
                onObjectDoubleClick={handleObjectDoubleClick}
                onTextEditComplete={handleTextEditComplete}
              />

              {activeTool === 'select' && (
                <TextLayer
                  items={getPageTextItems(index)}
                  pageWidth={page.width}
                  pageHeight={page.height}
                  isEditing={isTextLayerEditing}
                  onItemEdit={handleTextItemEdit}
                  onItemDelete={handleTextItemDelete}
                  onEditingChange={setIsTextLayerEditing}
                />
              )}

              {(activeTool === 'draw' || isDrawing) && (
                <canvas
                  ref={drawingCanvasRef}
                  width={page.width}
                  height={page.height}
                  className="absolute inset-0 pointer-events-none"
                  style={{ width: `${page.width}px`, height: `${page.height}px` }}
                />
              )}

              {shapePreview && shapePreview.pageIndex === index && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: Math.min(shapePreview.startX, shapePreview.endX),
                    top: Math.min(shapePreview.startY, shapePreview.endY),
                    width: Math.abs(shapePreview.endX - shapePreview.startX),
                    height: Math.abs(shapePreview.endY - shapePreview.startY),
                    border: `${Math.max(toolOptions.strokeWidth, 2)}px dashed ${toolOptions.strokeColor}`,
                    backgroundColor:
                      toolOptions.fillColor === 'transparent'
                        ? 'rgba(59,130,246,0.1)'
                        : toolOptions.fillColor,
                  }}
                />
              )}
            </div>

            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-surface-500 font-mono">
              {index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
