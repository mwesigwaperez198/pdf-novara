import { useDocumentStore } from '../../store/useDocumentStore';
import { useEditorStore } from '../../store/useEditorStore';
import { FONTS, FONT_SIZES } from '../../utils/constants';

export function PropertiesPanel() {
  const doc = useDocumentStore((s) => s.getActiveDocument());
  const toolOptions = useEditorStore((s) => s.toolOptions);
  const updateToolOptions = useEditorStore((s) => s.updateToolOptions);
  const activeTool = useEditorStore((s) => s.activeTool);

  if (!doc) {
    return (
      <div className="p-4 text-center text-sm text-surface-500">
        Open a document to see properties
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="panel-section">
        <div className="panel-label">Document</div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-surface-400">Name</span>
            <span className="text-surface-200 truncate max-w-[120px]">{doc.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-surface-400">Pages</span>
            <span className="text-surface-200">{doc.pages.length}</span>
          </div>
          {doc.metadata.author && (
            <div className="flex justify-between">
              <span className="text-surface-400">Author</span>
              <span className="text-surface-200 truncate max-w-[120px]">{doc.metadata.author}</span>
            </div>
          )}
        </div>
      </div>

      {(activeTool === 'text' || activeTool === 'shape' || activeTool === 'draw') && (
        <div className="panel-section">
          <div className="panel-label">Tool Settings</div>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-surface-400 mb-1 block">Font</label>
              <select
                value={toolOptions.fontFamily}
                onChange={(e) => updateToolOptions({ fontFamily: e.target.value })}
                className="w-full bg-surface-800 border border-surface-600 rounded px-2 py-1.5 text-xs text-white"
              >
                {FONTS.map((font) => (
                  <option key={font} value={font} style={{ fontFamily: font }}>
                    {font}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-surface-400 mb-1 block">Size</label>
              <select
                value={toolOptions.fontSize}
                onChange={(e) => updateToolOptions({ fontSize: Number(e.target.value) })}
                className="w-full bg-surface-800 border border-surface-600 rounded px-2 py-1.5 text-xs text-white"
              >
                {FONT_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}px
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-surface-400 mb-1 block">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={toolOptions.strokeColor}
                  onChange={(e) => updateToolOptions({ strokeColor: e.target.value })}
                  className="w-8 h-8 rounded border border-surface-600 cursor-pointer"
                />
                <span className="text-xs text-surface-300 font-mono">{toolOptions.strokeColor}</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-surface-400 mb-1 block">
                Weight: {toolOptions.fontWeight}
              </label>
              <input
                type="range"
                min="100"
                max="900"
                step="100"
                value={toolOptions.fontWeight}
                onChange={(e) => updateToolOptions({ fontWeight: Number(e.target.value) })}
                className="w-full accent-nova-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-surface-400 mb-1 block">
                Opacity: {Math.round(toolOptions.opacity * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={toolOptions.opacity}
                onChange={(e) => updateToolOptions({ opacity: Number(e.target.value) })}
                className="w-full accent-nova-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
