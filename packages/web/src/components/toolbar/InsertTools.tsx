import { Image, Square, Circle, Minus, Stamp, Signature } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore';
import { useUIStore } from '../../store/useUIStore';
import { cn } from '../../utils/format';

export function InsertTools() {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setTool = useEditorStore((s) => s.setTool);
  const updateToolOptions = useEditorStore((s) => s.updateToolOptions);
  const toolOptions = useEditorStore((s) => s.toolOptions);

  return (
    <>
      <button
        onClick={() => { setTool('shape'); updateToolOptions({ shapeType: 'rectangle' }); }}
        className={cn('toolbar-btn', activeTool === 'shape' && toolOptions.shapeType === 'rectangle' && 'toolbar-btn-active')}
        title="Rectangle"
      >
        <Square size={16} />
      </button>

      <button
        onClick={() => { setTool('shape'); updateToolOptions({ shapeType: 'circle' }); }}
        className={cn('toolbar-btn', activeTool === 'shape' && toolOptions.shapeType === 'circle' && 'toolbar-btn-active')}
        title="Circle"
      >
        <Circle size={16} />
      </button>

      <button
        onClick={() => { setTool('shape'); updateToolOptions({ shapeType: 'line' }); }}
        className={cn('toolbar-btn', activeTool === 'shape' && toolOptions.shapeType === 'line' && 'toolbar-btn-active')}
        title="Line"
      >
        <Minus size={16} />
      </button>

      <div className="toolbar-divider" />

      <button
        onClick={() => setTool('image')}
        className={cn('toolbar-btn', activeTool === 'image' && 'toolbar-btn-active')}
        title="Insert Image"
      >
        <Image size={16} />
      </button>

      <button
        onClick={() => setTool('stamp')}
        className={cn('toolbar-btn', activeTool === 'stamp' && 'toolbar-btn-active')}
        title="Stamp"
      >
        <Stamp size={16} />
      </button>

      <button
        onClick={() => setTool('signature')}
        className={cn('toolbar-btn', activeTool === 'signature' && 'toolbar-btn-active')}
        title="Signature"
      >
        <Signature size={16} />
      </button>

      <div className="toolbar-divider" />

      <div className="flex items-center gap-1 ml-1">
        <label className="text-[10px] text-surface-400">Fill</label>
        <input
          type="color"
          value={toolOptions.fillColor === 'transparent' ? '#000000' : toolOptions.fillColor}
          onChange={(e) => updateToolOptions({ fillColor: e.target.value })}
          className="w-5 h-5 rounded border border-surface-600 cursor-pointer bg-transparent"
          title="Fill color"
        />
      </div>

      <div className="flex items-center gap-1 ml-1">
        <label className="text-[10px] text-surface-400">Stroke</label>
        <input
          type="color"
          value={toolOptions.strokeColor}
          onChange={(e) => updateToolOptions({ strokeColor: e.target.value })}
          className="w-5 h-5 rounded border border-surface-600 cursor-pointer bg-transparent"
          title="Stroke color"
        />
      </div>

      <div className="flex items-center gap-1 ml-1">
        <label className="text-[10px] text-surface-400">Size</label>
        <input
          type="range"
          min="1"
          max="20"
          value={toolOptions.strokeWidth}
          onChange={(e) => updateToolOptions({ strokeWidth: Number(e.target.value) })}
          className="w-16 h-1 accent-nova-500"
          title="Stroke width"
        />
      </div>
    </>
  );
}
