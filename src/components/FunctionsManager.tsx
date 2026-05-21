import React, { useState } from 'react';
import { CloudFunction } from '../types';
import { getApiUrl } from '../utils/api';
import { Cpu, Plus, Sparkles, Terminal, Activity, Trash2, ShieldCheck, Play, HelpCircle, Code } from 'lucide-react';

interface Props {
  functions: CloudFunction[];
  onCreateFunction: (name: string, trigger: string, code: string) => Promise<void>;
  onToggleFunction: (id: string) => Promise<void>;
  onDeleteFunction: (id: string) => Promise<void>;
  onRunFunction: (id: string, payload: any) => Promise<{ success: boolean; logs: string[]; result: any; durationMs: number }>;
}

export default function FunctionsManager({
  functions,
  onCreateFunction,
  onToggleFunction,
  onDeleteFunction,
  onRunFunction
}: Props) {
  const [isAddingFn, setIsAddingFn] = useState(false);
  const [fnName, setFnName] = useState('');
  const [fnTrigger, setFnTrigger] = useState<'db:write' | 'auth:create' | 'http:get' | 'cron'>('auth:create');
  const [fnCode, setFnCode] = useState('');

  // Runner states
  const [selectedFn, setSelectedFn] = useState<CloudFunction | null>(functions[0] || null);
  const [testPayload, setTestPayload] = useState('{\n  "id": "u_9421",\n  "displayName": "Clara Sola",\n  "email": "clara@zongobase.tech"\n}');
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);
  const [runResult, setRunResult] = useState<any>(null);
  const [runDuration, setRunDuration] = useState<number | null>(null);

  // Gemini states
  const [aiCodePrompt, setAiCodePrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const activeFn = functions.find(f => f.id === (selectedFn?.id || '')) || functions[0] || null;

  const fnPresets = [
    {
      label: 'Security domain filter',
      name: 'filterCorporateUser',
      trigger: 'auth:create' as const,
      code: `// Ensure users registering accounts belong ONLY to corporate domains
exports.onUserCreated = async (user) => {
  console.log("Auditing domain credentials for: " + user.email);
  if (!user.email.endsWith("@zongobase.tech") && !user.email.endsWith("@google.com")) {
    console.warn("ALERT: Restricting registration payload. Outside corporate cloud boundary.");
    throw new Error("Access restriction: Registration blocked on this ZongoBase domain space.");
  }
  
  console.log("Domain matches compliance policies. Account approved.");
  return { ...user, status: "active", zongobaseVerified: true };
};`
    },
    {
      label: 'Purchase telemetry ledger',
      name: 'dispatchOrderAlerts',
      trigger: 'db:write' as const,
      code: `// Format telemetry schemas and dispatch slack payloads
exports.onDatabaseWrite = async (change) => {
  console.log("Audit log triggered validation flows on orders index...");
  const orderAmount = change.amount || 0;
  
  if (orderAmount > 1000) {
    console.warn("CRITICAL: Extreme transaction value detected of: $" + orderAmount);
    return { flagged: true, alertDispatched: true };
  }
  
  return { flagged: false, dispatchState: "green" };
};`
    }
  ];

  const applyPreset = (preset: typeof fnPresets[0]) => {
    setFnName(preset.name);
    setFnTrigger(preset.trigger);
    setFnCode(preset.code);
  };

  const handleCreateFn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fnName || !fnTrigger || !fnCode) return;
    try {
      await onCreateFunction(fnName, fnTrigger, fnCode);
      setFnName('');
      setFnCode('');
      setIsAddingFn(false);
    } catch (err: any) {
      alert(err.message || 'Failed creating serverless function code index.');
    }
  };

  const handleRunTest = async () => {
    if (!activeFn) return;
    setIsRunning(true);
    setRunLogs(['Init execution thread...', 'Setting up virtual micro-sandbox container...']);
    setRunResult(null);
    setRunDuration(null);

    try {
      let parsedPayload = {};
      if (testPayload.trim()) {
        parsedPayload = JSON.parse(testPayload);
      }
      const data = await onRunFunction(activeFn.id, parsedPayload);
      setRunLogs(data.logs);
      setRunResult(data.result);
      setRunDuration(data.durationMs);
    } catch (err: any) {
      setRunLogs(prev => [...prev, `CRITICAL THREAD CRASH: ${err.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleAiGenerateCode = async () => {
    if (!aiCodePrompt) return;
    setIsAiGenerating(true);
    try {
      const response = await fetch(getApiUrl('/api/zongobase/ai/generate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'function', prompt: aiCodePrompt })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);

      // Open creation form and apply code
      setIsAddingFn(true);
      setFnName('aiGeneratedTrigger');
      setFnTrigger('db:write');
      setFnCode(data.result);
    } catch (err: any) {
      alert('AI compiler assistance failed: ' + err.message);
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Functions List sidebar menu */}
      <div className="lg:col-span-1 space-y-6">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/40">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold tracking-wider uppercase text-slate-400 font-mono">
              Serverless scripts
            </h3>
            <button
              onClick={() => setIsAddingFn(!isAddingFn)}
              className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/25 hover:bg-slate-950 duration-150 transition"
              title="Add cloud function"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {functions.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No serverless hooks loaded.</p>
            ) : (
              functions.map((fn) => {
                const isSelected = activeFn?.id === fn.id;
                return (
                  <button
                    key={fn.id}
                    onClick={() => setSelectedFn(fn)}
                    className={`w-full text-left p-3 rounded-xl border flex items-center justify-between text-xs duration-150 transition-all ${
                      isSelected
                        ? 'border-indigo-500/30 bg-indigo-500/5 text-white shadow-lg'
                        : 'border-transparent bg-slate-950/10 text-slate-400 hover:text-slate-200 hover:bg-slate-950/20'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className={`w-3.5 h-3.5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <span className="font-mono font-medium">{fn.name}</span>
                    </div>
                    <span className="text-[9px] font-mono bg-slate-900 border border-slate-850 px-1.5 py-0.5 rounded-full text-slate-450 uppercase">
                      {fn.trigger}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Gemini functions builder prompt */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/20 shadow-md">
          <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-350 flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI Code Architect</span>
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed mb-3.5">
            Describe serverless tasks in human speech. Gemini writes robust JS scripts complete with payload structures, which deploy immediately.
          </p>

          <textarea
            value={aiCodePrompt}
            onChange={(e) => setAiCodePrompt(e.target.value)}
            className="w-full h-24 text-xs bg-slate-950 border border-slate-850 rounded p-2 text-slate-200 focus:border-amber-500/50 focus:outline-none font-sans leading-relaxed resize-none mb-3"
            placeholder="Describe database validations or notifications triggers..."
          />

          <button
            onClick={handleAiGenerateCode}
            disabled={isAiGenerating}
            className="w-full py-2 px-3 border border-amber-500/20 bg-amber-500/10 text-amber-400 rounded-lg hover:bg-amber-500/20 text-xs font-semibold flex items-center justify-center gap-2 duration-155 disabled:opacity-40 cursor-pointer"
          >
            {isAiGenerating ? (
              <>
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling Function...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Compile JS with Gemini</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cloud Function editor and execution playground */}
      <div className="lg:col-span-3 space-y-6">
        {/* Creation Overlay banner */}
        {isAddingFn && (
          <form onSubmit={handleCreateFn} className="p-5 rounded-2xl border border-slate-850 bg-slate-950/70 shadow-xl space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-semibold tracking-wider uppercase text-slate-350">Setup Serverless Lambda hook</h4>
              <button type="button" onClick={() => setIsAddingFn(false)} className="text-[10px] font-mono text-slate-450">Close</button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase font-mono text-slate-500">Form Preset options:</span>
              <div className="flex gap-2">
                {fnPresets.map((tpl) => (
                  <button
                    key={tpl.label}
                    type="button"
                    onClick={() => applyPreset(tpl)}
                    className="text-[10px] font-mono bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-0.5 rounded cursor-pointer duration-100"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1 space-y-3 bg-slate-950/50 p-3 rounded-xl border border-slate-850">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Function Name</label>
                  <input
                    type="text"
                    placeholder="e.g., hashPasswords"
                    value={fnName}
                    onChange={(e) => setFnName(e.target.value)}
                    className="w-full text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase text-slate-400">Event Trigger Binding</label>
                  <select
                    value={fnTrigger}
                    onChange={(e) => setFnTrigger(e.target.value as any)}
                    className="w-full text-xs font-mono bg-slate-900 border border-slate-800 p-2 text-slate-300 focus:outline-none"
                  >
                    <option value="auth:create">auth:create (On join)</option>
                    <option value="db:write">db:write (On database update)</option>
                    <option value="http:get">http:get (Web API payload)</option>
                    <option value="cron">cron (Schedules)</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-mono uppercase text-slate-400">Node JS Sandbox script code</label>
                <textarea
                  value={fnCode}
                  onChange={(e) => setFnCode(e.target.value)}
                  className="w-full h-44 text-xs font-mono bg-slate-900 border border-slate-800 p-2.5 rounded text-emerald-400 focus:outline-none"
                  placeholder={`// Export an asymmetric module hook\nexports.handler = async (payload) => {\n  console.log("Input:", payload);\n  return payload;\n};`}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-850">
              <button type="button" onClick={() => setIsAddingFn(false)} className="text-xs font-mono text-slate-450">Cancel</button>
              <button type="submit" className="text-xs font-mono bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 px-4 py-1.5 rounded">Register Function</button>
            </div>
          </form>
        )}

        {activeFn ? (
          <>
            {/* Function summary banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl border border-slate-800/80 bg-slate-950/20 gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-white font-mono">{activeFn.name}</h2>
                  <span className="text-[9px] font-mono uppercase bg-indigo-500/5 text-indigo-400 border border-indigo-500/15 px-2 py-0.5 rounded">
                    Trigger: {activeFn.trigger}
                  </span>
                </div>
                <p className="text-xs text-slate-450 mt-1">Status: <span className={activeFn.status === 'active' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>{activeFn.status}</span></p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onToggleFunction(activeFn.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border duration-150 ${
                    activeFn.status === 'active'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/15'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/15'
                  }`}
                >
                  {activeFn.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => onDeleteFunction(activeFn.id)}
                  className="p-1.5 rounded-lg border border-slate-850 bg-rose-500/10 text-rose-400 border-rose-500/25 text-xs font-semibold hover:bg-rose-500/20 duration-150"
                  title="Remove Function"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code editor view */}
            <div className="rounded-2xl border border-slate-805 bg-slate-950/40 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-805 bg-slate-950/70 text-xs text-slate-400 flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span className="font-mono font-semibold uppercase tracking-wider text-[11px]">Serverless Script Index Console (Read-Only Editor)</span>
              </div>
              <div className="p-4 bg-slate-950 text-emerald-450 font-mono text-xs overflow-x-auto text-left leading-relaxed">
                <pre>{activeFn.code}</pre>
              </div>
            </div>

            {/* Test Playgrounds and runtime compilers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Test payload card */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/20 space-y-3">
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-350 flex items-center justify-between">
                  <span>Input Event Mock payload</span>
                  <span className="text-[10px] font-mono bg-slate-900 text-slate-500 px-1.5 rounded uppercase">JSON API</span>
                </h3>
                <p className="text-xs text-slate-450">Mutate the inputs list below to mock structural data queries entering other event boundaries.</p>

                <textarea
                  value={testPayload}
                  onChange={(e) => setTestPayload(e.target.value)}
                  className="w-full h-40 font-mono text-xs bg-slate-900 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none"
                />

                <button
                  onClick={handleRunTest}
                  disabled={isRunning || activeFn.status === 'disabled'}
                  className="w-full py-2.5 bg-indigo-500 text-white hover:bg-indigo-600 rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-2 duration-150 disabled:opacity-40"
                >
                  {isRunning ? (
                    <>
                      <Cpu className="w-4 h-4 animate-spin" />
                      <span>Running Execution Threads...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Trigger Function Run Thread</span>
                    </>
                  )}
                </button>
              </div>

              {/* Execution console monitors logs card */}
              <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950/20 flex flex-col justify-between h-full gap-4">
                <div className="space-y-4">
                  <h3 className="text-xs font-bold tracking-wider uppercase text-slate-350 flex items-center justify-between">
                    <span>Active Sandbox execution trace</span>
                    {runDuration !== null && (
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-1.5 rounded">
                        TIME: {runDuration}ms
                      </span>
                    )}
                  </h3>

                  <div className="p-3.5 bg-slate-950 border border-slate-850 h-32 overflow-y-auto rounded-xl font-mono text-[10px] space-y-2 text-left text-slate-300">
                    {runLogs.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-600 font-sans italic text-center">
                        Execute a loop trigger to inspect running virtual logs.
                      </div>
                    ) : (
                      runLogs.map((log, i) => (
                        <div key={i} className="leading-relaxed">
                          <span className="text-slate-500">{`[ST_T+${i}] `}</span>
                          <span className={log.startsWith("ALERT") || log.startsWith("[WARN") ? "text-amber-400" : log.includes("ERROR") ? "text-rose-400" : "text-emerald-400"}>{log}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Compiled Yield Object Output</span>
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-lg font-mono text-xs text-blue-400 text-left overflow-x-auto">
                    {runResult ? (
                      <pre className="max-h-24 overflow-y-auto">{JSON.stringify(runResult, null, 2)}</pre>
                    ) : (
                      <span className="italic text-slate-600 text-[11px]">No return result captured in this thread.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/10 text-slate-500 space-y-2">
            <Cpu className="w-10 h-10 stroke-[1.2] mx-auto opacity-40 text-slate-450" />
            <h3 className="text-sm font-semibold text-slate-400">Serverless processor disengaged</h3>
            <p className="text-xs text-slate-555 max-w-sm mx-auto">Click '+' above to register, preset templates or use filters to generate database transaction layers.</p>
          </div>
        )}
      </div>
    </div>
  );
}
