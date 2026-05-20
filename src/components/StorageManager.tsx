import React, { useState } from 'react';
import { StorageFile } from '../types';
import { HardDrive, Plus, Eye, Trash2, ShieldCheck, FileCode, CheckCircle, HelpCircle } from 'lucide-react';

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

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Upload file list controls */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-800 bg-slate-950/20 gap-4">
          <div>
            <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-emerald-400" />
              <span>Storage Buckets Explorer</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Store, retrieve, and execute server assets, JSON models, static metadata, and development media references.
            </p>
          </div>
          <button
            onClick={() => setIsAddingFile(!isAddingFile)}
            className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-semibold hover:bg-emerald-500/15 transition flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Deploy media file</span>
          </button>
        </div>

        {isAddingFile && (
          <form onSubmit={handleUploadSubmit} className="p-5 rounded-2xl border border-slate-850 bg-slate-950/40 space-y-4">
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
                <select
                  value={fileMime}
                  onChange={(e) => setFileMime(e.target.value)}
                  className="w-full text-xs font-mono bg-slate-1000 border border-slate-800 p-2.5 rounded text-slate-300 focus:outline-none"
                >
                  <option value="application/json">application/json</option>
                  <option value="text/markdown">text/markdown</option>
                  <option value="text/plain">text/plain</option>
                </select>
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-mono uppercase text-slate-400">File Body text content</label>
                <textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full h-32 text-xs font-mono bg-slate-900 border border-slate-800 p-2 rounded text-emerald-400 focus:outline-none focus:border-cyan-500/30"
                  placeholder="File content payload..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
              <button type="button" onClick={() => setIsAddingFile(false)} className="text-xs font-mono text-slate-450">Cancel</button>
              <button type="submit" className="text-xs font-mono bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 px-4 py-1.5 rounded">Deploy File</button>
            </div>
          </form>
        )}

        {/* Files tabular directory */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 bg-slate-950/80 font-mono text-xs text-slate-400 flex justify-between">
            <span>Bucket Content Directory File indexes</span>
            <span>Count: {files.length}</span>
          </div>

          {files.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <HelpCircle className="w-8 h-8 stroke-[1.2] mx-auto opacity-50 text-slate-400" />
              <p className="text-xs font-semibold text-slate-450">No files uploaded</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Click "Deploy media file" above to initialize file storage assets into buckets.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-850 bg-slate-900/10">
              {files.map((file) => (
                <div key={file.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-950/30 transition duration-100">
                  <div className="flex items-start gap-3">
                    <FileCode className="w-5 h-5 text-emerald-400 mt-1 shrink-0" />
                    <div>
                      <div className="font-mono text-xs font-semibold text-slate-250 break-all">{file.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 break-all">Path: {file.path}</div>
                      <div className="flex gap-3 text-[10px] text-slate-600 font-mono mt-1">
                        <span>Size: {formatSize(file.size)}</span>
                        <span>Mime: {file.mimeType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => setSelectedViewingFile(file)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-cyan-500/20 text-[11px] font-mono text-slate-350 rounded flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3 text-cyan-400" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => onDeleteFile(file.id)}
                      className="p-1 rounded bg-rose-500/5 hover:bg-rose-500/15 text-rose-450 border border-slate-850 transition"
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
      <div className="lg:col-span-1">
        {selectedViewingFile ? (
          <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/60 flex flex-col h-full justify-between gap-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase text-slate-500">Document Reader</span>
                <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase">{selectedViewingFile.mimeType.split("/")[1] || 'raw'}</span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-mono break-all">{selectedViewingFile.name}</h3>
                <p className="text-[10px] font-mono text-slate-450 mt-1">Virtual path: {selectedViewingFile.path}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-850 h-80 overflow-y-auto leading-relaxed text-left text-xs font-mono text-emerald-400">
                {selectedViewingFile.content ? (
                  <pre className="whitespace-pre-wrap">{selectedViewingFile.content}</pre>
                ) : (
                  <span className="italic text-slate-600 text-[11px]">Binary media metadata file. Content display unavailable.</span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-850/60 flex justify-between">
              <span className="text-[10px] font-mono text-slate-550">Last modified: {new Date(selectedViewingFile.updatedAt).toLocaleTimeString()}</span>
              <button
                onClick={() => setSelectedViewingFile(null)}
                className="text-[11px] font-mono text-slate-400 hover:text-white"
              >
                Close Viewer
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl border border-dashed border-slate-800 bg-slate-950/10 text-center text-slate-500 h-full flex flex-col justify-center items-center py-16 space-y-3">
            <Eye className="w-8 h-8 opacity-40 stroke-[1.2] text-slate-450" />
            <span className="text-xs font-semibold text-slate-400 tracking-tight">Read Storage Assets</span>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">Select any deployed configuration file to inspect inside the code viewer.</p>
          </div>
        )}
      </div>
    </div>
  );
}
