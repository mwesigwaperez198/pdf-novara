import { useState } from 'react';
import { Link, Copy, Lock, Clock } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

export function SharingPanel() {
  const [permissions, setPermissions] = useState<'view' | 'comment' | 'edit'>('view');
  const [password, setPassword] = useState('');
  const [expiry, setExpiry] = useState('never');
  const [shareLink, setShareLink] = useState('');
  const showToast = useUIStore((s) => s.showToast);

  const handleGenerateLink = async () => {
    const mockToken = Math.random().toString(36).slice(2, 14);
    const mockLink = `https://nova-doc.novara.dev/shared/${mockToken}`;
    setShareLink(mockLink);
    showToast('Share link generated', 'success');
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink);
      showToast('Link copied to clipboard', 'success');
    }
  };

  return (
    <div className="flex flex-col">
      <div className="panel-section">
        <div className="panel-label">Share Document</div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-surface-400 mb-1 block">Access Level</label>
            <select
              value={permissions}
              onChange={(e) => setPermissions(e.target.value as typeof permissions)}
              className="w-full bg-surface-800 border border-surface-600 rounded px-2 py-1.5 text-xs text-white"
            >
              <option value="view">View only</option>
              <option value="comment">Comment</option>
              <option value="edit">Full edit</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-surface-400 mb-1 flex items-center gap-1">
              <Lock size={10} /> Password Protection
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Optional password"
              className="w-full bg-surface-800 border border-surface-600 rounded px-2 py-1.5 text-xs text-white placeholder:text-surface-500"
            />
          </div>

          <div>
            <label className="text-[10px] text-surface-400 mb-1 flex items-center gap-1">
              <Clock size={10} /> Expiration
            </label>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full bg-surface-800 border border-surface-600 rounded px-2 py-1.5 text-xs text-white"
            >
              <option value="never">Never</option>
              <option value="1h">1 hour</option>
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
            </select>
          </div>

          <button
            onClick={handleGenerateLink}
            className="w-full py-2 rounded-md bg-nova-600 hover:bg-nova-500 text-white text-xs font-medium transition-colors"
          >
            Generate Share Link
          </button>
        </div>
      </div>

      {shareLink && (
        <div className="panel-section">
          <div className="panel-label">Share Link</div>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 bg-surface-800 rounded px-2 py-1.5 text-[11px] text-surface-300 truncate font-mono">
              {shareLink}
            </div>
            <button
              onClick={handleCopyLink}
              className="toolbar-btn shrink-0"
              title="Copy link"
            >
              <Copy size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
