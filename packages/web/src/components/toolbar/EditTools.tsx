import {
  MousePointer2,
  Type,
  Pencil,
  Eraser,
  Hand,
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import type { ToolType } from '../../core/types/editor';
import { cn } from '../../utils/format';

const TOOLS: { id: ToolType; icon: typeof MousePointer2; label: string; shortcut: string }[] = [
  { id: 'select', icon: MousePointer2, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: Hand, label: 'Pan', shortcut: 'H' },
  { id: 'text', icon: Type, label: 'Add Text', shortcut: 'T' },
  { id: 'draw', icon: Pencil, label: 'Draw', shortcut: 'P' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', shortcut: 'E' },
];

export function EditTools() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setTool = useEditorStore((s) => s.setTool);

  return (
    <>
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          onClick={() => setTool(tool.id)}
          className={cn('toolbar-btn', activeTool === tool.id && 'toolbar-btn-active')}
          title={`${tool.label} (${tool.shortcut})`}
        >
          <tool.icon size={16} />
        </button>
      ))}
    </>
  );
}
