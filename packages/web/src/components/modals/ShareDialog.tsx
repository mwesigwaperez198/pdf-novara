import { useState } from 'react';
import { X, Link, Copy, Lock, Clock, Check } from 'lucide-react';
import { useDocumentStore } from '../../store/useDocumentStore';
import { useUIStore } from '../../store/useUIStore';

export function ShareDialog() {
  const [permissions, setPermissions] = useState<'view' | 'comment' | 'edit'>('view');
  const [password, setPassword] = useState('');
  const [usePassword, setUsePassword] = useState(false);
  const [expiry, setExpiry] = useState('never');
  const [shareLink, setShareLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const doc = useDocumentStore((s) => s.getActiveDocument());
  const dialogOpen = useUIStore((s) => s.dialogOpen);
  const closeDialog = useUIStore((s) => s.closeDialog);
  const showToast = useUIStore((s) => s.showToast);

  if (dialogOpen !== 'share' || !doc) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 800));
    const token = Math.random().toString(36).slice(2, 14);
    setShareLink(`https://nova-doc.novara.dev/shared/${token}`);
    setIsGenerating(false);
    showToast('Share link created', 'success');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    showToast('Link copied', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-800 rounded-xl border border-surface-600 shadow-2xl w-[440px] animate-fade-in">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700">
          <h2 className="text-base font-semibold text-white">Share Document</h2>
          <button onClick={closeDialog} className="toolbar-btn">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-surface-700/50 rounded-lg px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-nova-600/20 flex items-center justify-center">
              <Link size={18} className="text-nova-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">{doc.name}</div>
              <div className="text-xs text-surface-400">{doc.pages.length} pages</div>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-surface-400 mb-1.5 block">Access Level</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['view', 'comment', 'edit'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setPermissions(level)}
                  className={`py-2 text-xs font-medium rounded-md border transition-all capitalize ${
                    permissions === level
                      ? 'border-nova-400 bg-nova-600/15 text-nova-300'
                      : 'border-surface-600 text-surface-400 hover:border-surface-500'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setUsePassword(!usePassword)}
              className={`flex items-center gap-1.5 text-xs ${usePassword ? 'text-nova-400' : 'text-surface-400'}`}
            >
              <Lock size={12} />
              Password protect
            </button>
          </div>

          {usePassword && (
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white placeholder:text-surface-500"
            />
          )}

          <div>
            <label className="text-[11px] text-surface-400 mb-1.5 flex items-center gap-1">
              <Clock size={10} /> Expiration
            </label>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="never">No expiration</option>
              <option value="1h">1 hour</option>
              <option value="24h">24 hours</option>
              <option value="7d">7 days</option>
              <option value="30d">30 days</option>
            </select>
          </div>

          {shareLink && (
            <div className="flex items-center gap-2 bg-surface-700/50 rounded-lg px-3 py-2">
              <span className="flex-1 text-xs text-surface-300 font-mono truncate">{shareLink}</span>
              <button onClick={handleCopy} className="toolbar-btn shrink-0">
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-surface-700">
          <button
            onClick={closeDialog}
            className="px-4 py-2 text-xs font-medium rounded-md border border-surface-600
                       text-surface-300 hover:bg-surface-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={shareLink ? handleCopy : handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 text-xs font-medium rounded-md bg-nova-600 hover:bg-nova-500
                       text-white transition-colors disabled:opacity-50"
          >
            {isGenerating ? 'Creating...' : shareLink ? 'Copy Link' : 'Create Share Link'}
          </button>
        </div>
      </div>
    </div>
  );
}
