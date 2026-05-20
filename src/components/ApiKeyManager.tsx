import React, { useState } from 'react';
import { APIKey } from '../types';
import { KeyRound, Plus, ShieldCheck, Mail, CheckCircle, Trash2, Key, HelpCircle } from 'lucide-react';

interface Props {
  apiKeys: APIKey[];
  onCreateKey: (name: string, role: 'root' | 'read-only' | 'public') => Promise<void>;
  onDeleteKey: (id: string) => Promise<void>;
}

export default function ApiKeyManager({
  apiKeys,
  onCreateKey,
  onDeleteKey
}: Props) {
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [keyRole, setKeyRole] = useState<'root' | 'read-only' | 'public'>('read-only');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName) return;
    try {
      await onCreateKey(keyName, keyRole);
      setKeyName('');
      setIsAddingKey(false);
    } catch (err: any) {
      alert(err.message || 'Failed credential generation');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl border border-slate-800 bg-slate-950/20 gap-4">
        <div>
          <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-cyan-400" />
            <span>Gateway Access Keys Control</span>
          </h2>
          <p className="text-xs text-slate-450 leading-relaxed mt-1">
            Authorize third-party external apps, flutter clients, or backend APIs to communicate securely with your local or production hosted databases.
          </p>
        </div>
        <button
          onClick={() => setIsAddingKey(!isAddingKey)}
          className="px-4 py-2 bg-cyan-400/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-400/15 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision API token</span>
        </button>
      </div>

      {isAddingKey && (
        <form onSubmit={handleCreate} className="p-5 rounded-2xl border border-slate-850 bg-slate-950/40 space-y-4 max-w-xl">
          <div className="flex justify-between items-center">
            <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-350">Provision API Gateway Token</h4>
            <button type="button" onClick={() => setIsAddingKey(false)} className="text-[10px] font-mono text-slate-500">Close</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-slate-400">Credential Name/Alias</label>
              <input
                type="text"
                placeholder="e.g., iOS Mobile Client Key"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 p-2.5 rounded text-white focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono text-slate-400">Authorization Level Access Role</label>
              <select
                value={keyRole}
                onChange={(e) => setKeyRole(e.target.value as any)}
                className="w-full text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded text-slate-300 focus:outline-none"
              >
                <option value="root">Root (Full administration CRUD access)</option>
                <option value="read-only">Read-Only (Access restricted to reads)</option>
                <option value="public">Public Client (Requires Firestore schema validation filters)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
            <button type="button" onClick={() => setIsAddingKey(false)} className="text-xs font-mono text-slate-450">Cancel</button>
            <button type="submit" className="text-xs font-mono bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/20 px-4 py-1.5 rounded">Generate Keys</button>
          </div>
        </form>
      )}

      {/* Keys overview directory list */}
      <div className="rounded-2xl border border-slate-850 bg-slate-950/45 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-850 bg-slate-950/80 font-mono text-[10px] uppercase text-slate-500 flex justify-between">
          <span>Cryptographic Gateway Keys List</span>
          <span>Security status: ONLINE</span>
        </div>

        {apiKeys.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <HelpCircle className="w-8 h-8 stroke-[1] mx-auto opacity-50 text-slate-400" />
            <p className="text-xs font-semibold text-slate-450">No API Keys created</p>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Generate a key to authorize third-party external networks.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-850 bg-slate-900/5">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-950/30 transition duration-100">
                <div className="flex items-start gap-3">
                  <Key className="w-4.5 h-4.5 text-cyan-400 mt-1 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{key.name}</h4>
                    <p className="text-[10px] font-mono text-slate-450 mt-1">Secret Token: <span className="bg-slate-950 px-2 py-0.5 rounded text-cyan-350 border border-slate-850 select-text">{key.secret}</span></p>
                    <p className="text-[9px] text-slate-550 font-mono mt-1">Created: {new Date(key.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono border uppercase ${
                    key.role === 'root'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }`}>
                    {key.role} access
                  </span>
                  <button
                    onClick={() => onDeleteKey(key.id)}
                    className="p-1 px-2.5 rounded bg-rose-500/5 hover:bg-rose-500/15 border border-slate-850 text-rose-400 font-mono text-[10px] transition"
                  >
                    Revoke Token
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
