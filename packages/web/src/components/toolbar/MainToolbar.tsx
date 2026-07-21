import { FileTools } from './FileTools';
import { EditTools } from './EditTools';
import { InsertTools } from './InsertTools';
import { PageTools } from './PageTools';
import { ZoomControls } from './ZoomControls';

export function MainToolbar() {
  return (
    <div className="h-11 bg-surface-900 border-b border-surface-700/50 flex items-center px-2 gap-0.5 shrink-0">
      <FileTools />
      <div className="toolbar-divider" />
      <EditTools />
      <div className="toolbar-divider" />
      <InsertTools />
      <div className="toolbar-divider" />
      <PageTools />
      <div className="flex-1" />
      <ZoomControls />
    </div>
  );
}
