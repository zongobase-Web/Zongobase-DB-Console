import React, { useState } from 'react';
import { Terminal, Check, Copy, Code, Zap, Play, ArrowRight, Database, Sparkles, CheckCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getBackendOrigin } from '../utils/api';
import { APIKey } from '../types';

interface Props {
  apiKeys?: APIKey[];
}

export default function QuickSetupWizard({ apiKeys = [] }: Props) {
  const [activeTab, setActiveTab] = useState<'fetch' | 'node' | 'curl' | 'ping'>('fetch');
  const [copiedText, setCopiedText] = useState(false);
  
  // Dynamic fields from environment
  const backendUrl = getBackendOrigin();
  
  // Check login roles from local storage
  const rawUser = localStorage.getItem('zongobase_user');
  let loggedInUser: any = null;
  if (rawUser) {
    try {
      loggedInUser = JSON.parse(rawUser);
    } catch (e) {}
  }
  
  const userId = loggedInUser?.id || 'u_guest_sandbox';
  const userEmail = loggedInUser?.email || 'dev@zongobase.com';
  
  // Use first API Key if available, or generate a reliable developer preview one
  const apiKeyToken = apiKeys.length > 0 
    ? apiKeys[0].secret 
    : 'nx_root_8fa2c30dfbe0e81bac8a0029b3cef';

  // Code snippets generator dynamically backed by user properties
  const getCodeSnippet = () => {
    switch (activeTab) {
      case 'fetch':
        return `// 1. Send data to your ZongoBase database
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
.catch(err => console.error('Database connection issue:', err));`;

      case 'node':
        return `// ZongoBase Database Client Module (zongobase.js)
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

// Example Execution
// saveRecord('users_logs', 'log_102', { event: 'user_login', ip: '127.0.0.1' });`;

      case 'curl':
        return `curl -X POST "${backendUrl}/api/zongobase/db/collections/sandbox_records/docs" \\
  -H "Content-Type: application/json" \\
  -H "x-zongobase-user-id: ${userId}" \\
  -d '{"id": "curl_test_01", "data": {"framework": "cURL", "verified": true}}'`;

      default:
        return '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Interactive connection tester variables
  const [pingStatus, setPingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [pingResultMsg, setPingResultMsg] = useState('');
  const [testCollection, setTestCollection] = useState('instant_tether');
  const [testPayload, setTestPayload] = useState('{\n  "source": "30_second_wizard",\n  "status": "connected_successfully",\n  "system": "ZongoBase Realtime Tether"\n}');

  const handleSendPing = async () => {
    setPingStatus('testing');
    setPingResultMsg('');
    try {
      let parsedData = {};
      try {
        parsedData = JSON.parse(testPayload);
      } catch (err) {
        throw new Error("Invalid custom validation JSON. Please fix formatting before broadcasting.");
      }

      // Automatically construct or post to a collection setup
      // First ensure collection exists: create/ensure
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

      // It's okay if collection already exists (returns 400 error but endpoint handles it)
      
      const payloadId = `ping_${Math.random().toString(36).substring(2, 7)}`;
      const docRes = await fetch(`${backendUrl}/api/zongobase/db/collections/${testCollection}/docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-zongobase-user-id': userId
        },
        body: JSON.stringify({
          id: payloadId,
          data: parsedData
        })
      });

      const resBody = await docRes.json();
      if (!docRes.ok) {
        throw new Error(resBody.error || "Gateway rejected validation tunnel signature.");
      }

      setPingStatus('success');
      setPingResultMsg(`Success! Saved document ID: ${payloadId} inside collection [${testCollection}] in true real-time.`);
    } catch (err: any) {
      setPingStatus('error');
      setPingResultMsg(err.message || "Failed to make sandbox connection. Check logs.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border-2 border-[#1d2025] bg-slate-900/50 hover:bg-slate-900/70 p-6 space-y-6 text-left relative overflow-hidden shadow-2xl transition duration-300"
    >
      {/* Visual background ambient gradient to emphasize layout */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-blue-500/5 rounded-full filter blur-2xl pointer-events-none" />

      {/* Header alert */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Developer Quickstart Blueprint</span>
          </div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <span>⚡ 30-Second Instant Database Hook</span>
          </h2>
          <p className="text-xs text-slate-400">
            No sweat configuration. Copy your active sandbox credentials directly into your React, Node, or frontend project now.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-slate-950 p-1.5 rounded-lg border border-slate-805 text-[10px] font-mono text-slate-400">
          <span className="text-slate-500">Active API Root:</span>
          <span className="text-amber-400 underline select-all">{backendUrl}</span>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Side: Navigation triggers */}
        <div className="md:col-span-1 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible">
          <button
            onClick={() => setActiveTab('fetch')}
            className={`flex-1 md:flex-initial flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-bold transition duration-155 cursor-pointer text-left ${
              activeTab === 'fetch'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Code className="w-4 h-4" />
            <span className="whitespace-nowrap">1. JS Fetch (Client)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('node')}
            className={`flex-1 md:flex-initial flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-bold transition duration-155 cursor-pointer text-left ${
              activeTab === 'node'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span className="whitespace-nowrap">2. Node.js Express</span>
          </button>
          
          <button
            onClick={() => setActiveTab('curl')}
            className={`flex-1 md:flex-initial flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-bold transition duration-155 cursor-pointer text-left ${
              activeTab === 'curl'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
                : 'bg-slate-950/40 text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="whitespace-nowrap">3. Raw cURL CLI</span>
          </button>
          
          <button
            onClick={() => setActiveTab('ping')}
            className={`flex-1 md:flex-initial flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-bold transition duration-155 cursor-pointer text-left border ${
              activeTab === 'ping'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-950/60 text-slate-300 border-emerald-500/10 hover:border-emerald-500/20'
            }`}
          >
            <Play className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="relative whitespace-nowrap flex items-center gap-1">
              <span>4. Test Real Live Ping</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping absolute -right-2 top-0" />
            </span>
          </button>
        </div>

        {/* Right Side: Code snippets & Simulation interface */}
        <div className="md:col-span-3 bg-[#080b12] rounded-xl border border-slate-800 p-4 relative overflow-hidden flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {activeTab !== 'ping' ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-3 flex-1 flex flex-col"
              >
                <div className="flex justify-between items-center">
                  <div className="text-[10px] uppercase font-mono font-semibold text-slate-550 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>Copy-Paste ready code block</span>
                  </div>
                  <button
                    onClick={handleCopy}
                    className="text-[10px] font-mono font-bold text-slate-400 hover:text-white flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition duration-150 cursor-pointer"
                  >
                    {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Snippet'}</span>
                  </button>
                </div>
                
                <pre className="text-[11px] font-mono text-slate-300 bg-slate-950/70 p-3.5 rounded-lg border border-slate-850 overflow-x-auto leading-relaxed text-left flex-1 break-all whitespace-pre">
                  <code>{getCodeSnippet()}</code>
                </pre>
                
                <div className="text-[10px] text-slate-500 font-sans leading-relaxed flex items-center gap-1">
                  <span>ℹ️ Secure token authentication header was automatically pre-populated with your current identity workspace credentials</span>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="ping-tester"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-4"
              >
                <div className="text-xs font-sans text-slate-300 font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Interactive Real-time Sandbox Gateway Tester</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Enter connection payload details below. Clicking "Broadcast Test Ping" executes a live REST action inside your sandbox, instantly triggeringSSE components to update without reloading!
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">Tether Collection Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50"
                      value={testCollection}
                      onChange={(e) => setTestCollection(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5 font-semibold">JSON Data Body</label>
                    <textarea
                      rows={3}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-amber-500/50 resize-none"
                      value={testPayload}
                      onChange={(e) => setTestPayload(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleSendPing}
                    disabled={pingStatus === 'testing'}
                    className="px-4 py-2 bg-emerald-500 text-slate-950 font-mono font-bold text-xs rounded-lg hover:bg-emerald-400 flex items-center justify-center gap-1.5 duration-150 transition select-none disabled:opacity-50 cursor-pointer"
                  >
                    {pingStatus === 'testing' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Broadcasting...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Broadcast Test Ping</span>
                      </>
                    )}
                  </button>

                  {pingStatus !== 'idle' && (
                    <div className={`p-2.5 rounded-lg border flex-1 text-left text-[11px] font-mono ${
                      pingStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                      {pingResultMsg}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
