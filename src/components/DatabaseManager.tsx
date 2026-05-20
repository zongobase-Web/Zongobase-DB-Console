import React, { useState } from 'react';
import { Collection, DatabaseDoc } from '../types';
import { Database, Plus, Trash2, ArrowRightLeft, Cpu, Sparkles, Code, Table, HelpCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  collections: Collection[];
  onCreateCollection: (name: string, description: string) => Promise<void>;
  onDeleteCollection: (name: string) => Promise<void>;
  onAddDocument: (collectionName: string, id: string, data: Record<string, any>) => Promise<void>;
  onUpdateDocument: (collectionName: string, id: string, data: Record<string, any>) => Promise<void>;
  onDeleteDocument: (collectionName: string, id: string) => Promise<void>;
  onCreateIndex: (collectionName: string, field: string) => Promise<void>;
}

export default function DatabaseManager({
  collections,
  onCreateCollection,
  onDeleteCollection,
  onAddDocument,
  onUpdateDocument,
  onDeleteDocument,
  onCreateIndex
}: Props) {
  // Collection States
  const [selectedCol, setSelectedCol] = useState<Collection | null>(collections[0] || null);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [isCreatingCol, setIsCreatingCol] = useState(false);

  // Document States
  const [docIdInput, setDocIdInput] = useState('');
  const [docJsonInput, setDocJsonInput] = useState('{\n  "fieldName": "fieldValue",\n  "active": true\n}');
  const [editingDoc, setEditingDoc] = useState<DatabaseDoc | null>(null);
  const [editJsonInput, setEditJsonInput] = useState('');
  const [docError, setDocError] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  // Index States
  const [newIndexField, setNewIndexField] = useState('');
  
  // Gemini States
  const [aiPrompt, setAiPrompt] = useState('Build a collection called electronic_gadgets with 3 products including price, stock, brand, and reviews count');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<any[] | null>(null);
  const [aiProposedName, setAiProposedName] = useState('electronic_gadgets');

  // Sync selected collection when collections list changes under the hood due to SSE
  const activeCol = collections.find(c => c.name === (selectedCol?.name || '')) || collections[0] || null;

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName) return;
    try {
      await onCreateCollection(newColName, newColDesc);
      setNewColName('');
      setNewColDesc('');
      setIsCreatingCol(false);
    } catch (err: any) {
      alert(err.message || 'Failed to create collection');
    }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCol) return;
    setDocError('');
    try {
      const parsed = JSON.parse(docJsonInput);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Payload must be a valid JSON Object');
      }
      await onAddDocument(activeCol.name, docIdInput, parsed);
      setDocIdInput('');
      setDocJsonInput('{\n  "fieldName": "fieldValue",\n  "active": true\n}');
      setIsAddingDoc(false);
    } catch (err: any) {
      setDocError(err.message || 'Invalid JSON syntax formulation.');
    }
  };

  const handleStartEdit = (doc: DatabaseDoc) => {
    setEditingDoc(doc);
    setEditJsonInput(JSON.stringify(doc.data, null, 2));
    setDocError('');
  };

  const handleSaveEdit = async () => {
    if (!activeCol || !editingDoc) return;
    setDocError('');
    try {
      const parsed = JSON.parse(editJsonInput);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
        throw new Error('Payload must be a valid JSON Object');
      }
      await onUpdateDocument(activeCol.name, editingDoc.id, parsed);
      setEditingDoc(null);
    } catch (err: any) {
      setDocError(err.message || 'Invalid JSON syntax formulation.');
    }
  };

  const handleCreateIndex = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCol || !newIndexField) return;
    try {
      await onCreateIndex(activeCol.name, newIndexField);
      setNewIndexField('');
    } catch (err: any) {
      alert(err.message || 'Failed to apply index field');
    }
  };

  const handleAiGenerateSchema = async () => {
    if (!aiPrompt) return;
    setIsAiGenerating(true);
    setDocError('');
    setAiResult(null);
    try {
      const response = await fetch('/api/zongobase/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'schema', prompt: aiPrompt })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Parse safety
      const seedArray = JSON.parse(data.result);
      if (Array.isArray(seedArray)) {
        setAiResult(seedArray);
      } else {
        throw new Error('Response did not format as a valid seeding dataset.');
      }
    } catch (err: any) {
      setDocError('Gemini error setting up NoSQL assets: ' + err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleDeployAiProposal = async () => {
    if (!aiProposedName || !aiResult || aiResult.length === 0) return;
    try {
      // Create collection
      const finalName = aiProposedName.toLowerCase().replace(/[^a-z0-9_]/g, '');
      await onCreateCollection(finalName, `AI Generated schema dataset of ${finalName}`);
      
      // Inject each item as document
      for (let i = 0; i < aiResult.length; i++) {
        await onAddDocument(finalName, `${finalName}_seed_${i + 1}`, aiResult[i]);
      }

      setAiResult(null);
      setAiProposedName('');
      // Set to active
      const refreshedCol = collections.find(c => c.name === finalName);
      if (refreshedCol) {
        setSelectedCol(refreshedCol);
      }
    } catch (err: any) {
      alert('Failed deploying schema: ' + err.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Selector: Collections & AI Engine */}
      <div className="space-y-6 lg:col-span-1">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
              Database Core collections
            </h3>
            <button
              onClick={() => setIsCreatingCol(!isCreatingCol)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/20 hover:bg-slate-950 duration-150 transition"
              title="Add Collection"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {isCreatingCol && (
            <form onSubmit={handleCreateCollection} className="space-y-3 mb-4 p-3 rounded-lg bg-slate-950 border border-slate-850">
              <input
                type="text"
                placeholder="Name (e.g., users_metadata)"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 p-2 rounded text-white font-mono focus:border-cyan-500/50 outline-none"
                required
              />
              <input
                type="text"
                placeholder="Short description"
                value={newColDesc}
                onChange={(e) => setNewColDesc(e.target.value)}
                className="w-full text-xs bg-slate-900 border border-slate-800 p-2 rounded text-white focus:border-cyan-500/50 outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingCol(false)}
                  className="text-[10px] font-mono hover:text-slate-200 text-slate-400 px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-[10px] font-mono text-cyan-400 bg-cyan-950/20 border border-cyan-850 px-3 py-1 rounded hover:bg-cyan-950/40"
                >
                  Create
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1">
            {collections.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No active db collections found.</p>
            ) : (
              collections.map((col) => {
                const isSelected = activeCol?.name === col.name;
                return (
                  <button
                    key={col.name}
                    onClick={() => setSelectedCol(col)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs duration-150 transition-all ${
                      isSelected
                        ? 'border-cyan-500/30 bg-cyan-500/5 text-white shadow-lg shadow-cyan-950/10'
                        : 'border-transparent bg-slate-950/10 text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Database className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span className="font-mono font-medium">{col.name}</span>
                    </div>
                    <span className="text-[10px] font-mono bg-slate-900 text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">
                      {col.documents.length}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Gemini AI Designer Card */}
        <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-950/20 shadow-md">
          <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-350 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Schema Architect</span>
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">
            Describe a collection. Nexus matches field requirements, populates structured dummy JSON nodes via Gemini, and compiles schema fields.
          </p>

          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            className="w-full h-24 text-xs bg-slate-950 border border-slate-850 rounded p-2 text-slate-200 focus:border-amber-500/50 outline-none font-sans leading-relaxed resize-none mb-3"
            placeholder="Describe collection data..."
          />

          <button
            onClick={handleAiGenerateSchema}
            disabled={isAiGenerating}
            className="w-full py-2 px-3 border border-amber-500/20 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 text-xs font-semibold flex items-center justify-center gap-2 duration-150 disabled:opacity-40"
          >
            {isAiGenerating ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>Generating Schema...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Setup via Gemini</span>
              </>
            )}
          </button>

          {aiResult && (
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-mono text-slate-500">Proposed Deployment</span>
                <span className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">READY</span>
              </div>
              <input
                type="text"
                placeholder="Collection Target Name"
                value={aiProposedName}
                onChange={(e) => setAiProposedName(e.target.value)}
                className="w-full text-xs font-mono bg-slate-900 border border-slate-800 p-2 rounded text-cyan-400 focus:outline-none"
              />
              <div className="max-h-32 overflow-y-auto w-full text-[10px] font-mono text-slate-400 bg-slate-900 p-2 rounded text-left">
                {JSON.stringify(aiResult, null, 2)}
              </div>
              <button
                onClick={handleDeployAiProposal}
                className="w-full py-1.5 px-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-[11px] font-bold rounded"
              >
                Deploy Schema & Seed Documents
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Database Table view */}
      <div className="lg:col-span-3 space-y-6">
        {activeCol ? (
          <>
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-800/80 bg-slate-950/20 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white font-mono">{activeCol.name}</h2>
                  <span className="text-[10px] font-mono uppercase bg-slate-900 text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full">
                    NoSQL Collection
                  </span>
                </div>
                <p className="text-xs text-slate-450 mt-1">{activeCol.description}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddingDoc(!isAddingDoc)}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-400/10 text-cyan-400 border border-cyan-500/20 text-xs font-semibold hover:bg-cyan-400/20 flex items-center gap-1.5 duration-150"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Document</span>
                </button>
                <button
                  onClick={() => onDeleteCollection(activeCol.name)}
                  className="p-1.5 rounded-lg border border-slate-850 bg-rose-500/10 text-rose-400 border-rose-500/25 text-xs font-semibold hover:bg-rose-500/15 duration-150"
                  title="Delete Collection"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document validation / error message alerts */}
            {docError && (
              <div className="p-3 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs flex items-center gap-2 font-mono">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{docError}</span>
              </div>
            )}

            {/* Document Addition Overlay panel */}
            {isAddingDoc && (
              <form onSubmit={handleAddDocument} className="p-5 rounded-2xl border border-slate-850 bg-slate-950/90 shadow-xl space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-300">Set Up Document Node</h4>
                  <button type="button" onClick={() => setIsAddingDoc(false)} className="text-[10px] font-mono text-slate-500 hover:text-slate-300">Close</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1 space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Document Node Key ID</label>
                    <input
                      type="text"
                      placeholder="e.g., prod_4812 (Optional)"
                      value={docIdInput}
                      onChange={(e) => setDocIdInput(e.target.value)}
                      className="w-full text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded text-white focus:outline-none focus:border-cyan-500/50"
                    />
                    <p className="text-[9px] text-slate-500 leading-normal">If kept blank, a pseudorandom base timestamp document signature is emitted.</p>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-mono text-slate-400 uppercase">Document JSON Dictionary Payload</label>
                    <textarea
                      value={docJsonInput}
                      onChange={(e) => setDocJsonInput(e.target.value)}
                      className="w-full h-32 font-mono text-xs bg-slate-900 border border-slate-800 p-2.5 rounded text-emerald-400 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setIsAddingDoc(false)}
                    className="text-xs font-mono text-slate-500 px-3 py-1.5 hover:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-xs font-mono bg-cyan-940/30 text-cyan-400 hover:bg-cyan-940/50 border border-cyan-850 px-4 py-1.5 rounded"
                  >
                    Deploy Document
                  </button>
                </div>
              </form>
            )}

            {/* Document Editor Overlay */}
            {editingDoc && (
              <div className="p-5 rounded-2xl border border-slate-850 bg-slate-950/90 shadow-xl space-y-4">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-300">
                    Modifying Node [{editingDoc.id}]
                  </h4>
                  <button type="button" onClick={() => setEditingDoc(null)} className="text-[10px] font-mono text-slate-500 hover:text-slate-300">Close</button>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">Payload JSON</label>
                  <textarea
                    value={editJsonInput}
                    onChange={(e) => setEditJsonInput(e.target.value)}
                    className="w-full h-40 font-mono text-xs bg-slate-900 border border-slate-850 p-2.5 rounded text-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1 border-t border-slate-850">
                  <button
                    type="button"
                    onClick={() => setEditingDoc(null)}
                    className="text-xs font-mono text-slate-500 px-3 py-1.5 hover:text-slate-300"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="text-xs font-mono bg-emerald-950/40 text-emerald-400 hover:bg-emerald-950/60 border border-emerald-850 px-4 py-1.5 rounded"
                  >
                    Commit document mutation
                  </button>
                </div>
              </div>
            )}

            {/* Documents Spreadsheet or JSON list */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/40 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
                  Collection database snapshots ({activeCol.documents.length} entries)
                </span>
                <span className="text-[10px] text-slate-500 italic max-w-xs text-right">Double-click or edit action to mutate document nodes</span>
              </div>

              {activeCol.documents.length === 0 ? (
                <div className="p-12 text-center text-slate-500 space-y-2">
                  <HelpCircle className="w-8 h-8 stroke-[1] mx-auto opacity-40 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-400">Database collection empty</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">Click "Insert Document" at the top-right, or prompt the Gemini Schema Architect to populate electronic arrays.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead>
                      <tr className="bg-slate-950/70 text-slate-450 border-b border-slate-850 font-mono text-[10px] uppercase">
                        <th className="p-4 font-semibold tracking-wider">Node ID</th>
                        <th className="p-4 font-semibold tracking-wider">Document Payload Dictionary</th>
                        <th className="p-4 font-semibold tracking-wider">Created</th>
                        <th className="p-4 font-semibold tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-950/20 font-sans">
                      {activeCol.documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-slate-900/40 duration-100 transition">
                          <td className="p-4 font-mono text-cyan-400 font-semibold align-top whitespace-nowrap">{doc.id}</td>
                          <td className="p-4 font-mono text-[11px] text-emerald-400 align-top max-w-lg">
                            <pre className="whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed text-left">
                              {JSON.stringify(doc.data, null, 2)}
                            </pre>
                          </td>
                          <td className="p-4 text-slate-500 text-[10px] font-mono align-top whitespace-nowrap">
                            {new Date(doc.createdAt).toLocaleDateString()}<br />
                            {new Date(doc.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="p-4 align-top text-right whitespace-nowrap space-x-1">
                            <button
                              onClick={() => handleStartEdit(doc)}
                              className="px-2.5 py-1 text-[10px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded"
                            >
                              Edit Node
                            </button>
                            <button
                              onClick={() => onDeleteDocument(activeCol.name, doc.id)}
                              className="px-2 bg-rose-950/20 text-rose-400 hover:bg-rose-950/45 hover:border-rose-500/20 border border-slate-850 text-[10px] py-1 font-mono rounded"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Collection indexes module */}
            <div className="p-5 rounded-2xl border border-slate-800/80 bg-slate-950/20">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2 mb-3">
                <ArrowRightLeft className="w-4 h-4 text-cyan-400" />
                <span>Collection Indexes & Optimization Rules</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Define document property path indexes to speed up backend query filtering loops.
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeCol.indexes.map((idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 font-mono text-xs rounded-full flex items-center gap-1.5"
                  >
                    <span>Field:</span>
                    <span className="font-semibold text-cyan-400">{idx}</span>
                  </span>
                ))}
              </div>

              <form onSubmit={handleCreateIndex} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  placeholder="Index target field (e.g. status)"
                  value={newIndexField}
                  onChange={(e) => setNewIndexField(e.target.value)}
                  className="flex-1 text-xs font-mono bg-slate-950 border border-slate-800 p-2.5 rounded text-white focus:outline-none focus:border-cyan-500/40"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/20 text-xs font-mono text-cyan-400 font-semibold rounded"
                >
                  Apply Index
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/10 text-slate-500 space-y-3">
            <Database className="w-10 h-10 stroke-[1] mx-auto text-slate-650 opacity-50" />
            <h3 className="text-sm font-semibold text-slate-400">Database environment unloaded</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">To inspect documents or create custom index sets, create and select a custom collection in the left menu.</p>
          </div>
        )}
      </div>
    </div>
  );
}
