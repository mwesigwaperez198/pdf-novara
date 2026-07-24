import { useMemo } from 'react';
import { useDocumentStore } from '../../store/useDocumentStore';

interface TextChangesOverlayProps {
  pageIndex: number;
  pageWidth: number;
  pageHeight: number;
}

export function TextChangesOverlay({ pageIndex, pageWidth, pageHeight }: TextChangesOverlayProps) {
  const doc = useDocumentStore((s) => s.getActiveDocument());
  const textEdits = useDocumentStore((s) => s.textEdits);
  const deletedTextIds = useDocumentStore((s) => s.deletedTextIds);

  const changes = useMemo(() => {
    if (!doc) return { edits: {}, deleted: new Set<string>() };
    const pageKey = `${doc.id}-${pageIndex}`;
    return {
      edits: textEdits[pageKey] ?? {},
      deleted: deletedTextIds[pageKey] ?? new Set<string>(),
    };
  }, [doc, pageIndex, textEdits, deletedTextIds]);

  if (!doc) return null;

  const page = doc.pages[pageIndex];
  if (!page) return null;

  const hasChanges =
    Object.keys(changes.edits).length > 0 || changes.deleted.size > 0;

  if (!hasChanges) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={pageWidth}
      height={pageHeight}
      viewBox={`0 0 ${pageWidth} ${pageHeight}`}
      style={{ width: pageWidth, height: pageHeight }}
    >
      {page.textContent.map((item) => {
        const isDeleted = changes.deleted.has(item.id);
        const editText = changes.edits[item.id];
        const isModified = editText !== undefined && editText !== item.str;

        if (!isDeleted && !isModified) return null;

        const svgY = pageHeight - item.y - item.height;

        if (isDeleted) {
          return (
            <g key={item.id}>
              <rect
                x={item.x - 1}
                y={svgY - 1}
                width={item.width + 2}
                height={item.height + 2}
                fill="white"
              />
            </g>
          );
        }

        if (isModified) {
          return (
            <g key={item.id}>
              <rect
                x={item.x - 1}
                y={svgY - 1}
                width={item.width + 4}
                height={item.height + 2}
                fill="white"
              />
              <text
                x={item.x}
                y={svgY + item.height * 0.8}
                fill={item.color || '#000'}
                fontSize={item.fontSize}
                fontFamily={item.fontFamily}
                fontWeight={item.fontWeight}
              >
                {editText}
              </text>
            </g>
          );
        }

        return null;
      })}
    </svg>
  );
}
