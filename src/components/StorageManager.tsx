import React, { useState, useRef } from 'react';
import { StorageFile } from '../types';
import { getApiUrl } from '../utils/api';
import { 
  HardDrive, Plus, Eye, Trash2, FileCode, CheckCircle, HelpCircle, 
  Settings, KeyRound, CloudLightning, Upload, Copy, ExternalLink, 
  RefreshCw, X, AlertTriangle, ShieldCheck, Database
} from 'lucide-react';

interface Props {
  files: StorageFile[];
  onUploadFile: (name: string, path: string, content: string, mimeType: string) => Promise<void>;
  onDeleteFile: (id: string) => Promise<void>;
}

export default function StorageManager({
  files,
  onUploadFile,
  onDeleteFile
}: Props) {
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [fileName, setFileName] = useState('');
  const [filePath, setFilePath] = useState('/configs/');
  const [fileContent, setFileContent] = useState('');
  const [fileMime, setFileMime] = useState('application/json');
  const [selectedViewingFile, setSelectedViewingFile] = useState<StorageFile | null>(null);

  // Cloudflare R2 Dynamic Configuration State
  const [r2Config, setR2Config] = useState({
    accountId: '',
    accessKeyId: '',
    secretAccessKey: '',
    bucketName: '',
    publicUrl: '',
    useR2: false,
    isEnvSet: false
  });
  const [showR2Config, setShowR2Config] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Drag and Drop State
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getUserHeaders = () => {
    const raw = localStorage.getItem('zongobase_user');
    if (!raw) return {};
    try {
      const user = JSON.parse(raw);
      return {
        'x-zongobase-user-id': user.id || '',
        'Authorization': `Bearer ${user.id || ''}`
      };
    } catch {
      return {};
    }
  };

  const loadR2Config = async () => {
    try {
      const res = await fetch(getApiUrl('/api/zongobase/storage/config'), {
        headers: getUserHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setR2Config(data);
      }
    } catch (err) {
      console.error('Failed loading Cloudflare R2 configurations:', err);
    }
  };

  React.useEffect(() => {
    loadR2Config();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTestResult(null);
    try {
      const res = await fetch(getApiUrl('/api/zongobase/storage/config'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getUserHeaders()
        },
        body: JSON.stringify(r2Config)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed saving configuration');
      setTestResult({ success: true, message: 'Settings synchronized and applied successfully!' });
      await loadR2Config();
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Error occurred saving settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(getApiUrl('/api/zongobase/storage/config/test'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getUserHeaders()
        },
        body: JSON.stringify({
          accountId: r2Config.accountId,
          accessKeyId: r2Config.accessKeyId,
          secretAccessKey: r2Config.secretAccessKey,
          bucketName: r2Config.bucketName
        })
      });
      const data = await res.json();
      if (res.ok) {
        setTestResult({ success: true, message: data.message || 'R2 S3 Handshake validated successfully!' });
      } else {
        setTestResult({ success: false, message: data.error || 'Credentials rejected by Cloudflare.' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Request failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    setFileName(file.name);
    const folder = file.type.startsWith('image/') ? '/images/' : '/assets/';
    setFilePath(folder + file.name);
    setFileMime(file.type || 'application/octet-stream');
    
    const reader = new FileReader();
    const isTextReadable = file.type.startsWith('text/') || 
                          file.type === 'application/json' || 
                          file.name.endsWith('.rules') || 
                          file.name.endsWith('.json') ||
                          file.name.endsWith('.md');

    if (isTextReadable) {
      reader.onload = (e) => {
        setFileContent(e.target?.result as string || '');
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        setFileContent(e.target?.result as string || '');
      };
      reader.readAsDataURL(file);
    }
    setIsAddingFile(true);
  };

  const templates = [
    {
      label: 'App Settings Schema',
      name: 'zongobase-app-config.json',
      path: '/configs/zongobase-app-config.json',
      mime: 'application/json',
      content: JSON.stringify({
        appName: "GlobalZongoPool",
        maxConnections: 10000,
        enableSSE: true,
        clusterNodeCount: 3,
        encryptionKeyMD5: "7f4c391aa9d01fc885be"
      }, null, 2)
    },
    {
      label: 'Security Custom Rules',
      name: 'security.rules',
      path: '/rules/security.rules',
      mime: 'text/plain',
      content: `# ZongoBase DB Storage and Read Guard Policies
service zongobase.db {
  match /collections/{collectionName} {
    allow read, write: if request.auth != null && request.auth.role == "admin";
    allow read: if request.apiKey.role == "public";
  }
}`
    }
  ];

  const applyTemplate = (tpl: typeof templates[0]) => {
    setFileName(tpl.name);
    setFilePath(tpl.path);
    setFileMime(tpl.mime);
    setFileContent(tpl.content);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName || !filePath) return;
    try {
      await onUploadFile(fileName, filePath, fileContent, fileMime);
      setFileName('');
      setFilePath('/configs/');
      setFileContent('');
      setIsAddingFile(false);
    } catch (err: any) {
      alert(err.message || 'Failed virtual file deployment');
    }
  };

  const handleCopyLink = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Upload file list controls */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Connection Header & Quick Engine Indicator */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-800 bg-[#0d0e11]/80 gap-4 shadow-xl">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-400" />
              <span>Sovereign Storage Buckets</span>
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`text-[9.5px] uppercase font-bold px-2 py-0.5 rounded flex items-center gap-1 border ${
                r2Config.useR2 
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' 
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/10'
              }`}>
                {r2Config.useR2 ? (
                  <>
                    <CloudLightning className="w-3 h-3 animate-pulse text-amber-400" />
                    <span>Real-time Cloudflare R2 S3 Active</span>
                  </>
                ) : (
                  <>
                    <Database className="w-3 h-3 text-emerald-400" />
                    <span>Local Memory Safe Mode fallbacks</span>
                  </>
                )}
              </span>
              <p className="text-[11px] text-slate-450">
                {r2Config.useR2 ? `Connected to ${r2Config.bucketName}` : 'Virtual environment activated'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowR2Config(!showR2Config)}
              className={`px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                showR2Config 
                  ? 'bg-slate-850 text-white border-slate-700' 
                  : 'bg-slate-900/40 text-slate-350 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5 text-indigo-400" />
              <span>S3 / R2 Configuration</span>
            </button>
            <button
              onClick={() => setIsAddingFile(!isAddingFile)}
              className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold hover:bg-emerald-500/15 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy file</span>
            </button>
          </div>
        </div>

        {/* Cloudflare R2 Credentials Sync Tray */}
        {showR2Config && (
          <div className="p-6 rounded-2xl border border-[#2d2f31] bg-[#111215] space-y-4 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-indigo-500" />
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CloudLightning className="w-4 h-4 text-amber-500" />
                  <span>Cloudflare R2 Bucket Integration API</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xl">
                  Cloudflare R2 storage gives zero egress-fee S3-compatible cloud bucket space. Insert authorization credentials to bypass in-memory fallbacks instantly. 
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowR2Config(false)}
                className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {r2Config.isEnvSet && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex gap-2.5 items-start">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[10px] uppercase font-mono text-indigo-350 leading-relaxed font-bold">
                  System Pre-Configuration Overrides ACTIVE: System Environment secrets are mounted at process start, disabling adjustments.
                </p>
              </div>
            )}

            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">R2 Account ID</label>
                  <input
                    type="text"
                    disabled={r2Config.isEnvSet}
                    placeholder="e.g. 5d96a6fb113d524817dcd1bfd35368f5"
                    value={r2Config.accountId}
                    onChange={(e) => setR2Config({ ...r2Config, accountId: e.target.value })}
                    className="w-full text-xs font-mono bg-black/60 border border-slate-800 p-2.5 rounded text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">R2 S3 Bucket Name</label>
                  <input
                    type="text"
                    disabled={r2Config.isEnvSet}
                    placeholder="e.g. my-zongobase-files"
                    value={r2Config.bucketName}
                    onChange={(e) => setR2Config({ ...r2Config, bucketName: e.target.value })}
                    className="w-full text-xs font-mono bg-black/60 border border-slate-800 p-2.5 rounded text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Access Key ID</label>
                  <input
                    type="text"
                    disabled={r2Config.isEnvSet}
                    placeholder="e.g. df87010f3dbcc8a55c2cd17482"
                    value={r2Config.accessKeyId}
                    onChange={(e) => setR2Config({ ...r2Config, accessKeyId: e.target.value })}
                    className="w-full text-xs font-mono bg-black/60 border border-slate-800 p-2.5 rounded text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Secret Access Key</label>
                  <input
                    type="password"
                    disabled={r2Config.isEnvSet}
                    placeholder="••••••••••••••••••••"
                    value={r2Config.secretAccessKey}
                    onChange={(e) => setR2Config({ ...r2Config, secretAccessKey: e.target.value })}
                    className="w-full text-xs font-mono bg-black/60 border border-slate-800 p-2.5 rounded text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">R2 Public Custom Domain / Gateway URL (Optional)</label>
                <input
                  type="text"
                  disabled={r2Config.isEnvSet}
                  placeholder="e.g. https://files.my-domain.com"
                  value={r2Config.publicUrl}
                  onChange={(e) => setR2Config({ ...r2Config, publicUrl: e.target.value })}
                  className="w-full text-xs font-mono bg-black/60 border border-slate-800 p-2.5 rounded text-[#8ab4f8] focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
                <p className="text-[9.5px] text-slate-500 font-sans leading mt-0.5">
                  Leaving this empty runs downloads automatically via the high-performance ZongoBase API proxy gateway!
                </p>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl flex items-center gap-2 border text-xs font-mono ${
                  testResult.success 
                    ? 'bg-emerald-500/10 text-emerald-405 border-emerald-550/20' 
                    : 'bg-rose-500/10 text-rose-350 border-rose-500/20'
                }`}>
                  {testResult.success ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-450 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-850">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enable_r2_checkbox"
                    disabled={r2Config.isEnvSet}
                    checked={r2Config.useR2}
                    onChange={(e) => setR2Config({ ...r2Config, useR2: e.target.checked })}
                    className="bg-black border-slate-750 p-2 rounded focus:ring-0 focus:ring-offset-0 text-amber-500 shrink-0"
                  />
                  <label htmlFor="enable_r2_checkbox" className="text-xs font-bold text-slate-300 font-sans select-none cursor-pointer">
                    Enable production S3/R2 storage engine
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-3.5 py-1.5 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-300 hover:bg-slate-800/80 transition text-xs font-semibold font-mono uppercase cursor-pointer"
                  >
                    {isTesting ? 'Testing S3 handshake...' : 'Test Connection'}
                  </button>
                  
                  {!r2Config.isEnvSet && (
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-550 transition font-semibold text-xs text-white cursor-pointer"
                    >
                      {isSaving ? 'Synchronizing Firestore...' : 'Save Settings'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Dash Upload Hub (Manual Click & Drag-and-Drop selection) */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 border-2 border-dashed rounded-3xl text-center cursor-pointer transition relative group ${
            dragActive 
              ? 'border-indigo-500 bg-indigo-550/10' 
              : 'border-slate-800 bg-[#0c0d10]/40 hover:border-slate-700 hover:bg-[#0c0d10]/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="space-y-4 max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-505/20 flex items-center justify-center mx-auto group-hover:scale-105 duration-250">
              <Upload className="w-6 h-6 text-indigo-400 group-hover:animate-bounce" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Upload and Deploy Live Assets</h3>
              <p className="text-[11px] text-slate-450 leading-relaxed mt-1">
                Drag and drop schemas, assets, JSON configuration files, text records, or client media files straight here, or <span className="text-[#8ab4f8] underline font-medium">browse local files</span>.
              </p>
            </div>
            <div className="text-[10px] font-mono text-slate-550">
              Files parsed automatically: Markdown/TXT/JSON directly viewable; images/binary converted safely via base64 encoding.
            </div>
          </div>
        </div>

        {/* Deploy file manually editor */}
        {isAddingFile && (
          <form onSubmit={handleUploadSubmit} className="p-5 rounded-2xl border border-slate-800 bg-slate-950/40 space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-350">Deploy Virtual Storage Asset</h4>
              <button type="button" onClick={() => setIsAddingFile(false)} className="text-[10px] font-mono text-slate-450 hover:text-slate-300">Close</button>
            </div>

            {/* Quick templates helper */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-slate-500">Form Preset templates:</span>
              <div className="flex gap-2">
                {templates.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => applyTemplate(tpl)}
                    className="text-[10px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-0.5 rounded cursor-pointer duration-100"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">File Name</label>
                <input
                  type="text"
                  placeholder="e.g. settings.json"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Storage Target Directory Path</label>
                <input
                  type="text"
                  placeholder="e.g. /configs/settings.json"
                  value={filePath}
                  onChange={(e) => setFilePath(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded text-cyan-400 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 md:col-span-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">MIME Content Type</label>
                <input
                  type="text"
                  value={fileMime}
                  onChange={(e) => setFileMime(e.target.value)}
                  placeholder="e.g. image/png"
                  className="w-full text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded text-slate-300 focus:outline-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-mono uppercase text-slate-400">File Body text content</label>
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full h-32 text-xs font-mono bg-slate-900 border border-slate-800 p-2 rounded text-emerald-450 focus:outline-none focus:border-cyan-500/30"
                  placeholder="File content payload..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
              <button type="button" onClick={() => {
                setIsAddingFile(false);
                setFileName('');
                setFileContent('');
              }} className="text-xs font-mono text-slate-450">Cancel</button>
              <button type="submit" className="text-xs font-mono bg-emerald-500/10 text-emerald-450 hover:bg-emerald-500/20 border border-emerald-500/20 px-4 py-1.5 rounded">Deploy File</button>
            </div>
          </form>
        )}

        {/* Files tabular directory */}
        <div className="rounded-2xl border border-slate-800 bg-[#090b0d]/70 overflow-hidden shadow-xl">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/80 font-mono text-xs text-slate-400 flex justify-between">
            <span>Bucket Content Directory File indexes</span>
            <span>Count: {files.length}</span>
          </div>

          {files.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <HelpCircle className="w-8 h-8 stroke-[1.2] mx-auto opacity-50 text-slate-400" />
              <p className="text-xs font-semibold text-slate-450">No files uploaded</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Click "Deploy media file" or drag & drop files above to initialize file storage assets into buckets.</p>
            </div>
          ) : (
            <div className="divide-y divide-[rgba(255,255,255,0.04)] bg-slate-900/10">
              {files.map((file) => (
                <div key={file.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[rgba(255,255,255,0.01)] transition duration-100">
                  <div className="flex items-start gap-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-550/20 flex items-center justify-center shrink-0 mt-0.5">
                      <FileCode className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-mono text-xs font-bold text-slate-100 break-all">{file.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono break-all font-medium">Path: {file.path}</div>
                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-mono pt-1">
                        <span className="font-semibold text-slate-450">Size: {formatSize(file.size)}</span>
                        <span>MimeType: <span className="text-emerald-450 font-bold">{file.mimeType}</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* View physical URL if R2 active */}
                    {file.url && (
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-indigo-500/30 text-[11px] font-mono text-slate-200 rounded flex items-center gap-1 leading-5"
                        title="Open Physical S3 File asset"
                      >
                        <ExternalLink className="w-3 h-3 text-indigo-400" />
                        <span>Remote link</span>
                      </a>
                    )}
                    {r2Config.useR2 && (
                      <button
                        onClick={() => handleCopyLink(file.url || `${window.location.origin}/api/zongobase/storage/raw/${file.id}`, file.id)}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-indigo-550/30 text-[11px] font-mono text-slate-200 rounded flex items-center gap-1"
                        title="Copy deployment download URL"
                      >
                        <Copy className="w-3 h-3 text-amber-400" />
                        <span>{copiedId === file.id ? 'Copied URL!' : 'Share URL'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedViewingFile(file)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-cyan-520/20 text-[11px] font-mono text-slate-200 rounded flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span>Read File</span>
                    </button>
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      className="p-1 rounded-lg bg-rose-500/5 hover:bg-rose-500/15 text-rose-450 border border-slate-800 transition"
                      title="Delete Asset file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Viewing File sidebar panel */}
      <div className="xl:col-span-1">
        {selectedViewingFile ? (
          <div className="p-5 rounded-2xl border border-slate-850 bg-[#0a0b0d]/90 flex flex-col h-full justify-between gap-4 shadow-xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Document Reader Console</span>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold">{selectedViewingFile.mimeType.split("/")[1] || 'raw'}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-mono break-all">{selectedViewingFile.name}</h3>
                <p className="text-[10px] font-mono text-slate-450 mt-1">Virtual target: <span className="text-cyan-400">{selectedViewingFile.path}</span></p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/80 border border-slate-900 h-96 overflow-y-auto leading-relaxed text-left text-xs font-mono text-emerald-400 select-text">
                {selectedViewingFile.content ? (
                  <pre className="whitespace-pre-wrap">{selectedViewingFile.content}</pre>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center h-full text-slate-500 space-y-2">
                    <Database className="w-6 h-6 text-indigo-400" />
                    <p className="italic text-[10.5px]">Binary media metadata file.</p>
                    <p className="text-[9.5px] max-w-[160px] mx-auto text-slate-550 leading-normal">
                      This file contains raw binary data. View or download it using the Remote url or Share url indicators.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-850/60 flex justify-between items-center">
              <span className="text-[9.5px] font-mono text-slate-500 font-semibold">Updated: {new Date(selectedViewingFile.updatedAt).toLocaleTimeString()}</span>
              <button
                onClick={() => setSelectedViewingFile(null)}
                className="text-[11px] font-mono text-slate-400 hover:text-white border border-slate-800 bg-slate-900 hover:bg-slate-850 px-3 py-1 rounded-lg transition"
              >
                Close Viewer
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-slate-850 bg-slate-950/10 text-center text-slate-550 h-full flex flex-col justify-center items-center py-20 space-y-3 shadow-sm">
            <Eye className="w-8 h-8 opacity-40 stroke-[1.2] text-slate-450" />
            <span className="text-xs font-semibold text-slate-400 tracking-tight">Active Document Terminal</span>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Select any deployed configuration file or media record to inspect inside the code viewer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
