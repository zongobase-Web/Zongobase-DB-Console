import React, { useState, useEffect } from "react";
import { 
  X, Check, Copy, Code, Zap, Play, ArrowRight, Database, Sparkles, 
  CheckCircle, RefreshCw, Terminal, ExternalLink, HelpCircle, Laptop, GraduationCap, ChevronRight, BookOpen, Minimize2, Maximize2 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getBackendOrigin } from "../utils/api";
import { APIKey } from "../types";

interface OnboardingProps {
  apiKeys?: APIKey[];
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingGuide({ apiKeys = [], isOpen, onClose }: OnboardingProps) {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Interactive Quiz states
  const [quizFramework, setQuizFramework] = useState<'react' | 'node' | 'mobile' | 'html'>('react');
  const [quizObjective, setQuizObjective] = useState<'signup' | 'logging' | 'iot' | 'query'>('signup');
  const [quizSpeed, setQuizSpeed] = useState<'instant' | 'robust'>('instant');

  const backendUrl = getBackendOrigin();
  
  // Try retrieving user credentials
  const rawUser = localStorage.getItem('zongobase_user');
  let loggedInUser: any = null;
  if (rawUser) {
    try {
      loggedInUser = JSON.parse(rawUser);
    } catch (e) {}
  }
  const userId = loggedInUser?.id || 'u_guest_sandbox';
  const userEmail = loggedInUser?.email || 'dev@zongobase.com';

  const steps = [
    {
      badge: "Onboarding Quiz",
      title: "Interactive Setup Configurator Quiz",
      icon: HelpCircle,
      subtitle: "Answer 3 simple prompts to produce your bespoke connection blueprint",
      description: "No two projects are identical. Tell us what system environment you are using, and we will formulate, secure, and pre-compile your absolute personalized ZongoBase datastore connection script instantly. Effortless for beginners, and saves hours for senior developers."
    },
    {
      badge: "Architecture Strategy",
      title: "No Bloated Custom SDK Library Needed",
      icon: Database,
      subtitle: "Why standard HTTP connects faster & cleaner",
      description: "Unlike giants that lock you down with 50MB of client drivers, ZongoBase is built on clean, stateless, secure HTTP REST structures. You make zero-dependency requests from any language—making your frontend build smaller, faster, and highly portable. Every request is isolated, protected, and synced in real-time."
    },
    {
      badge: "Quick Integration",
      title: "Instant 1-Line REST Linkers",
      icon: Code,
      subtitle: "Copy safe templates with your live tokens",
      description: "Select, copy, and execute. We've pre-populated the fetch blocks below with your current active Sandbox identity tokens to connect under 30 seconds."
    },
    {
      badge: "Verifiable Testing",
      title: "Confirm Real-time Link Live",
      icon: Zap,
      subtitle: "Execute a test payload without leaving the console",
      description: "Click the test trigger below to fire an instant sync event into your datastore. You'll watch your dashboard counters update live without hard reloading!"
    },
    {
      badge: "Global Deployments",
      title: "Zero VPS Cost Standalone",
      icon: GraduationCap,
      subtitle: "Export portable PHP / Node database scripts",
      description: "Ready for production? Go to the 'Export Code' tab in the menu to export portable standalone single-file database scripts. Host your production servers completely free of charge on GitHub, Netlify, or your Apache/Nginx directories."
    }
  ];

  // Configurator compiled code builder
  const getQuizSnippet = () => {
    const targetCollection = quizObjective === 'signup' ? 'leads_list' 
      : quizObjective === 'logging' ? 'system_logs'
      : quizObjective === 'iot' ? 'telemetry_stream' : 'sandbox_records';

    const testObject = quizObjective === 'signup' 
      ? { name: 'Sarah Connor', email: userEmail, plan: 'enterprise_preview' }
      : quizObjective === 'logging'
      ? { level: 'error', origin: 'production_main', msg: 'Failed to synchronize web socket client endpoint.' }
      : quizObjective === 'iot'
      ? { celsius: 24.8, activeNodes: 12, signalStrength: -68 }
      : { activeConnection: true, mode: 'direct_tether_sandbox' };

    if (quizSpeed === 'instant') {
      if (quizFramework === 'react' || quizFramework === 'html') {
        return `// ⚡ Instant ZongoBase client integration
fetch('${backendUrl}/api/zongobase/db/collections/${targetCollection}/docs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-zongobase-user-id': '${userId}'
  },
  body: JSON.stringify({
    id: 'rec_' + Date.now(),
    data: ${JSON.stringify(testObject, null, 2).replace(/\n/g, '\n    ')}
  })
})
.then(r => r.json())
.then(d => console.log('ZongoBase Saved:', d))
.catch(e => console.error('Tether failure:', e));`;
      } else if (quizFramework === 'node') {
        return `// ⚡ Instant Node Axios integration
import axios from 'axios';

axios.post('${backendUrl}/api/zongobase/db/collections/${targetCollection}/docs', {
  id: 'node_' + Date.now(),
  data: ${JSON.stringify(testObject, null, 2).replace(/\n/g, '\n  ')}
}, {
  headers: {
    'Content-Type': 'application/json',
    'x-zongobase-user-id': '${userId}'
  }
})
.then(res => console.log('Saved to ZongoBase:', res.data));`;
      } else {
        return `# ⚡ Fast cURL datastore sync command
curl -X POST "${backendUrl}/api/zongobase/db/collections/${targetCollection}/docs" \\
  -H "Content-Type: application/json" \\
  -H "x-zongobase-user-id: ${userId}" \\
  -d '{"id": "usr_cli_direct", "data": ${JSON.stringify(testObject).replace(/"/g, '\\"')}}'`;
      }
    } else {
      // Robust with error mitigation
      return `/**
 * 🛡️ ZongoBase Production Guard Integration Class
 * Encapsulating secure handshakes, request timeouts and connection fallback logic
 */
class ZongoBaseDatastore {
  constructor() {
    this.apiUrl = '${backendUrl}';
    this.userId = '${userId}';
  }

  async save(collection, docId, data) {
    const endpoint = \`\${this.apiUrl}/api/zongobase/db/collections/\${collection}/docs\`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6500); // Guarded 6.5s timeout

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-zongobase-user-id': this.userId
        },
        body: JSON.stringify({ id: docId, data }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(\`Database rejected transaction code \${response.status}\`);
      }
      return await response.json();
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn("🛡️ ZongoBase transaction redirected to local standby cache on failure.");
      // Fallback mechanism to browser LocalStorage for bulletproof offline support
      const cacheKey = 'zongobase_offline_queue';
      const queue = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      queue.push({ collection, docId, data, timestamp: Date.now() });
      localStorage.setItem(cacheKey, JSON.stringify(queue));
      return { offlineCached: true, error: err.message };
    }
  }
}

// 🚀 Production Usage Implementation:
const db = new ZongoBaseDatastore();
db.save('${targetCollection}', 'id_' + Date.now(), ${JSON.stringify(testObject, null, 2).replace(/\n/g, '\n  ')})
  .then(success => console.log("Database transaction verified:", success));`;
    }
  };

  const handleCopyQuizSnippet = () => {
    navigator.clipboard.writeText(getQuizSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic templates matching step 1 selection
  const [activeLang, setActiveLang] = useState<'fetch' | 'node' | 'curl'>('fetch');

  const getCodeSnippet = () => {
    if (activeLang === 'fetch') {
      return `// 1. Post real-time logs to your NoSQL database
fetch('${backendUrl}/api/zongobase/db/collections/analytics/docs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-zongobase-user-id': '${userId}' // Authorized safe sandbox token
  },
  body: JSON.stringify({
    id: 'lead_' + Date.now(),
    data: {
      client: '${loggedInUser?.displayName || 'Active Client'}',
      email: '${userEmail}',
      status: 'active',
      source: 'web_portal'
    }
  })
})
.then(res => res.json())
.then(data => console.log('Successfully saved to ZongoBase:', data))
.catch(err => console.error('Connection issue:', err));`;
    } else if (activeLang === 'node') {
      return `// Express or Node Connection Module (zongobase.js)
import axios from 'axios';

const ZONGO_URL = '${backendUrl}';
const USER_TOKEN = '${userId}';

export async function saveRecord(collectionName, recordId, payload) {
  const endpoint = \`\${ZONGO_URL}/api/zongobase/db/collections/\${collectionName}/docs\`;
  const response = await axios.post(endpoint, {
    id: recordId,
    data: payload
  }, {
    headers: {
      'Content-Type': 'application/json',
      'x-zongobase-user-id': USER_TOKEN
    }
  });
  return response.data;
}

// saveRecord('users_logs', 'log_102', { event: 'user_login', ip: '127.0.0.1' });`;
    } else {
      return `curl -X POST "${backendUrl}/api/zongobase/db/collections/sandbox_records/docs" \\
  -H "Content-Type: application/json" \\
  -H "x-zongobase-user-id: ${userId}" \\
  -d '{"id": "curl_live_proof", "data": {"framework": "cURL", "verified": true}}'`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Live Sync Tester State
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [pingResultMsg, setPingResultMsg] = useState<string>('');
  const [testCollection, setTestCollection] = useState<string>('interactive_telemetry');

  const handleTriggerPing = async () => {
    setPingStatus('testing');
    setPingResultMsg('');
    try {
      // First ensure collection exists: generate metadata endpoint
      const collRes = await fetch(`${backendUrl}/api/zongobase/db/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-zongobase-user-id': userId
        },
        body: JSON.stringify({
          name: testCollection,
          description: "Auto-provisioned tether channel verified via setup wizard launcher."
        })
      });

      const payloadId = `onb_${Math.random().toString(36).substring(2, 7)}`;
      const docRes = await fetch(`${backendUrl}/api/zongobase/db/collections/${testCollection}/docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-zongobase-user-id': userId
        },
        body: JSON.stringify({
          id: payloadId,
          data: {
            via: "interactive_welcome_assistant",
            timestamp: new Date().toISOString(),
            status: "success",
            notes: "Instantly connected to the NoSQL live listener thread."
          }
        })
      });

      const resBody = await docRes.json();
      if (!docRes.ok) {
        throw new Error(resBody.error || "Gateway rejected validation tunnel signature.");
      }

      setPingStatus('success');
      setPingResultMsg(`Success! Saved live document [${payloadId}] inside collection [${testCollection}]. Real-time dashboard updated!`);
    } catch (err: any) {
      setPingStatus('error');
      setPingResultMsg(err.message || "Failed to make sandbox connection. Check internet or credentials.");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#020408]/92 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl bg-[#111215] border border-[#2d2f31] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden flex flex-col md:flex-row relative my-8"
          id="beautiful-welcome-wizard"
        >
          {/* Aesthetic Side Ribbon Inspired by Google Sites & Developer Guides */}
          <div className="w-full md:w-80 bg-gradient-to-b from-[#1c1d22] to-[#121316] border-b md:border-b-0 md:border-r border-[#2d2f31] p-6 flex flex-col justify-between shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full filter blur-2xl pointer-events-none" />
            
            <div className="space-y-6">
              {/* Header Logo */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center font-mono font-bold text-xs text-slate-950">
                  ZB
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm tracking-tight font-sans">ZongoBase</h3>
                  <p className="text-[9px] text-[#8ab4f8] tracking-widest font-mono font-bold uppercase">Quickstart Onboarding</p>
                </div>
              </div>

              {/* Progress Steps List */}
              <div className="space-y-2 relative">
                {steps.map((s, idx) => {
                  const isActive = idx === activeStep;
                  const isDone = idx < activeStep;
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveStep(idx)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition duration-150 relative cursor-pointer group ${
                        isActive 
                          ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold" 
                          : "border border-transparent text-slate-400 hover:bg-[#1e1f20] hover:text-slate-200"
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-mono shrink-0 ${
                        isDone 
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" 
                          : isActive 
                            ? "bg-amber-500 text-slate-950 font-bold" 
                            : "bg-slate-900 border border-slate-800 text-slate-500"
                      }`}>
                        {isDone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : idx + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs truncate">{s.badge}</p>
                        <p className="text-[10px] text-slate-500 truncate group-hover:text-slate-400">{s.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Support Signature */}
            <div className="pt-6 mt-6 border-t border-[#2d2f31]/60 flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-mono">zongobase@gmail.com</span>
              <a href="mailto:zongobase@gmail.com" className="text-amber-500 hover:underline flex items-center gap-0.5">
                <span>Talk to creators</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Core Content Segment */}
          <div className="flex-1 p-8 flex flex-col justify-between space-y-6">
            {/* Top Close Bar */}
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono tracking-widest text-[#8ab4f8] uppercase font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>COMMUNICATION FRAMEWORK & LINKER WIZARD</span>
              </span>
              <button 
                onClick={onClose}
                className="p-1 px-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 transition duration-150 cursor-pointer text-xs font-mono font-bold flex items-center gap-1"
                title="Double-click to return to sandboxed work console"
              >
                <span>Ignore & Enter Sandbox</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Illustrative Viewport */}
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                  {React.createElement(steps[activeStep].icon, { className: "w-5 h-5 text-amber-400 animate-pulse" })}
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-[#f0f4f9] tracking-tight">{steps[activeStep].title}</h2>
                  <p className="text-xs text-slate-400">{steps[activeStep].subtitle}</p>
                </div>
              </div>

              <p className="text-xs text-slate-350 leading-relaxed font-sans bg-slate-950/20 p-4 border border-slate-900 rounded-xl">
                {steps[activeStep].description}
              </p>

              {/* Dynamic Action Visualizers per Step */}
              {activeStep === 0 && (
                <div className="space-y-4">
                  {/* Step-by-Step interactive selector row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Q1: Tech Stack Selector */}
                    <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                      <label className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                        <span>1. Choose Tech Stack</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuizFramework('react')}
                          className={`px-2 py-1.5 rounded text-[11px] font-bold font-sans transition duration-150 cursor-pointer text-center ${
                            quizFramework === 'react' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ⚛️ React / JS
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizFramework('node')}
                          className={`px-2 py-1.5 rounded text-[11px] font-bold font-sans transition duration-150 cursor-pointer text-center ${
                            quizFramework === 'node' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🟢 Node Server
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizFramework('mobile')}
                          className={`px-2 py-1.5 rounded text-[11px] font-bold font-sans transition duration-150 cursor-pointer text-center ${
                            quizFramework === 'mobile' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🐍 Python / CLI
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizFramework('html')}
                          className={`px-2 py-1.5 rounded text-[11px] font-bold font-sans transition duration-150 cursor-pointer text-center ${
                            quizFramework === 'html' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🌐 Google Sites
                        </button>
                      </div>
                    </div>

                    {/* Q2: Database Objective Selector */}
                    <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                      <label className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1">
                        <span>2. Datastore Mission</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuizObjective('signup')}
                          className={`px-2 py-1.5 rounded text-[11px] font-bold font-sans transition duration-150 cursor-pointer text-center ${
                            quizObjective === 'signup' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          📋 User Leads
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizObjective('logging')}
                          className={`px-2 py-1.5 rounded text-[11px] font-bold font-sans transition duration-150 cursor-pointer text-center ${
                            quizObjective === 'logging' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          📁 Crash Logger
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizObjective('iot')}
                          className={`px-2 py-1.5 rounded text-[11px] font-bold font-sans transition duration-150 cursor-pointer text-center ${
                            quizObjective === 'iot' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          📡 IoT Telemetry
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizObjective('query')}
                          className={`px-2 py-1.5 rounded text-[11px] font-bold font-sans transition duration-150 cursor-pointer text-center ${
                            quizObjective === 'query' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' : 'bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🔍 Run Queries
                        </button>
                      </div>
                    </div>

                    {/* Q3: Speed Priority Selector */}
                    <div className="space-y-2 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                      <label className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1">
                        <span>3. Connection Guard</span>
                      </label>
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => setQuizSpeed('instant')}
                          className={`w-full py-1.5 rounded text-[11px] font-bold transition duration-150 cursor-pointer flex items-center justify-center gap-1 ${
                            quizSpeed === 'instant' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          ⚡ Instant Script (Sub-30s)
                        </button>
                        <button
                          type="button"
                          onClick={() => setQuizSpeed('robust')}
                          className={`w-full py-1.5 rounded text-[11px] font-bold transition duration-110 cursor-pointer flex items-center justify-center gap-1 ${
                            quizSpeed === 'robust' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-950 border border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          🛡️ Fail-Safe Guard Class
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Output custom compiled block */}
                  <div className="space-y-2 bg-[#080b0f] p-4 rounded-xl border border-slate-800 relative">
                    <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                      <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Pre-compiled Snippet backed with your credentials</span>
                      </div>
                      <button
                        onClick={handleCopyQuizSnippet}
                        className="px-2.5 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-[10px] text-slate-300 rounded font-mono font-bold transition duration-150 flex items-center gap-1 cursor-pointer select-none"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 font-extrabold" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied Custom Snippet!' : 'Copy Code'}</span>
                      </button>
                    </div>

                    <pre className="text-[10px] font-mono text-slate-300 bg-black/50 p-3 rounded border border-slate-950 overflow-x-auto max-h-48 break-all whitespace-pre leading-relaxed">
                      <code>{getQuizSnippet()}</code>
                    </pre>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-3 bg-[#080b0f] p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setActiveLang('fetch')} 
                        className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded ${activeLang === 'fetch' ? 'bg-amber-400/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                      >
                        JS Fetch (Client)
                      </button>
                      <button 
                        onClick={() => setActiveLang('node')} 
                        className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded ${activeLang === 'node' ? 'bg-amber-400/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                      >
                        Node.js Express
                      </button>
                      <button 
                        onClick={() => setActiveLang('curl')} 
                        className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded ${activeLang === 'curl' ? 'bg-amber-400/10 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-white'}`}
                      >
                        Raw cURL CLI
                      </button>
                    </div>

                    <button 
                      onClick={handleCopy}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-[10px] rounded hover:border-slate-700 text-slate-300 font-mono font-bold flex items-center gap-1"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <pre className="text-[10px] font-mono text-slate-350 overflow-x-auto select-all max-h-48 break-all leading-normal whitespace-pre bg-black/40 p-3 rounded border border-slate-950">
                    <code>{getCodeSnippet()}</code>
                  </pre>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-3 bg-[#080b0f] p-4 rounded-xl border border-slate-800">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-lg border border-slate-900">
                    <div>
                      <label className="block text-[10px] font-mono text-[#8ab4f8] uppercase tracking-widest font-extrabold">Sandbox Connection Tester</label>
                      <p className="text-[10px] text-slate-400 mt-0.5">Fires an encrypted POST payload directly to verify instant SSE client syncs.</p>
                    </div>
                    <button
                      onClick={handleTriggerPing}
                      disabled={pingStatus === 'testing'}
                      className="px-3.5 py-1 rounded bg-emerald-400 text-slate-950 hover:bg-emerald-300 font-mono text-xs font-bold transition flex items-center justify-center gap-1"
                    >
                      {pingStatus === 'testing' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                      <span>Send Sandbox Ping</span>
                    </button>
                  </div>

                  {pingStatus !== 'idle' && (
                    <div className={`p-3 rounded border text-[11px] font-mono ${
                      pingStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {pingResultMsg}
                    </div>
                  )}
                </div>
              )}

              {activeStep === 4 && (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-900 flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                  <p className="text-xs text-slate-400">
                    Need further guides? You can download complete sample codes or read our custom documentation at any time under the <strong className="text-slate-200">"Setup Wizards & FAQs"</strong> side tab inside your dashboard console.
                  </p>
                </div>
              )}
            </div>

            {/* Active Navigation Footer steps control */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-900">
              <button
                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                disabled={activeStep === 0}
                className="px-4 py-2 text-xs font-mono font-bold text-slate-400 hover:text-white transition duration-150 disabled:opacity-25 cursor-pointer"
              >
                ← Previous Step
              </button>

              <div className="flex gap-1.5 opacity-80">
                {steps.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveStep(i)} 
                    className={`w-1.5 h-1.5 rounded-full transition duration-150 ${i === activeStep ? "bg-amber-400 w-3" : "bg-slate-800"}`} 
                  />
                ))}
              </div>

              {activeStep === steps.length - 1 ? (
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-xl hover:from-amber-400 hover:to-amber-500 font-mono font-extrabold text-xs tracking-tight transition duration-150 shadow-[0_4px_12px_rgba(245,158,11,0.2)] select-none cursor-pointer flex items-center gap-1.5"
                >
                  <span>Finish Setup & Enter</span>
                  <ArrowRight className="w-3.5 h-3.5 font-extrabold" />
                </button>
              ) : (
                <button
                  onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl font-mono font-bold text-xs transition duration-150 select-none cursor-pointer flex items-center gap-1"
                >
                  <span>Next Step</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
